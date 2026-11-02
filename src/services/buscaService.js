import typesense from '../config/typesense.js';
import { pool } from '../config/database.js';

// Pesquisa textual no Typesense
export async function buscarArtigos(termo, pagina = 1, limite = 10) {
    const resultado = await typesense
        .collections('artigos')
        .documents()
        .search({
            q: termo,
            query_by: 'titulo,resumo,conteudo',
            query_by_weights: '5,3,1',
            page: pagina,
            per_page: limite
        });

    return {
        termo,
        total: resultado.found,
        pagina: resultado.page,
        limite,
        resultados: resultado.hits.map(item => item.document)
    };
}

// Busca artigos que compartilham categorias e tags
export async function buscarArtigosRelacionados(idArtigo) {

    const consulta = `
        WITH categorias_base AS (
            SELECT categoria_id
            FROM artigo_categorias
            WHERE artigo_id = $1
        ),

        tags_base AS (
            SELECT tag_id
            FROM artigo_tags
            WHERE artigo_id = $1
        ),

        correspondencias AS (

            SELECT
                ac.artigo_id,
                2 AS pontos
            FROM artigo_categorias ac
            INNER JOIN categorias_base cb
                ON cb.categoria_id = ac.categoria_id
            WHERE ac.artigo_id <> $1

            UNION ALL

            SELECT
                at.artigo_id,
                1 AS pontos
            FROM artigo_tags at
            INNER JOIN tags_base tb
                ON tb.tag_id = at.tag_id
            WHERE at.artigo_id <> $1
        ),

        pontuacao AS (
            SELECT
                artigo_id,
                SUM(pontos) AS relevancia
            FROM correspondencias
            GROUP BY artigo_id
        )

        SELECT
            a.id,
            a.titulo,
            a.resumo,
            p.relevancia

        FROM pontuacao p

        INNER JOIN artigos a
            ON a.id = p.artigo_id

        ORDER BY
            p.relevancia DESC,
            a.titulo ASC

        LIMIT 10;
    `;

    const resultado = await pool.query(consulta, [idArtigo]);

    return resultado.rows;
}

export async function buscarArtigoPorId(idArtigo) {
    const consulta = `
        SELECT
            a.id,
            a.titulo,
            a.slug,
            a.resumo,
            a.conteudo,
            a.status,
            a.criado_em,
            a.atualizado_em,

            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', au.id,
                            'nome', au.nome
                        )
                    )
                    FROM artigo_autores aa
                    INNER JOIN autores au ON au.id = aa.autor_id
                    WHERE aa.artigo_id = a.id
                ),
                '[]'::json
            ) AS autores,

            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', c.id,
                            'nome', c.nome
                        )
                    )
                    FROM artigo_categorias ac
                    INNER JOIN categorias c ON c.id = ac.categoria_id
                    WHERE ac.artigo_id = a.id
                ),
                '[]'::json
            ) AS categorias,

            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', t.id,
                            'nome', t.nome
                        )
                    )
                    FROM artigo_tags at
                    INNER JOIN tags t ON t.id = at.tag_id
                    WHERE at.artigo_id = a.id
                ),
                '[]'::json
            ) AS tags

        FROM artigos a
        WHERE a.id = $1;
    `;

    const resultado = await pool.query(consulta, [idArtigo]);

    return resultado.rows[0] || null;
}
