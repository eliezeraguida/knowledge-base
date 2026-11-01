
import 'dotenv/config';
import { pool } from '../config/database.js';

const TYPESENSE_URL = 'http://localhost:8108';
const API_KEY = process.env.TYPESENSE_API_KEY;
const TAMANHO_LOTE = 250;

async function buscarArtigos() {
    const resultado = await pool.query(`
        SELECT
            a.id::text AS id,
            a.titulo,
            a.resumo,
            a.conteudo,
            a.status,
            FLOOR(EXTRACT(EPOCH FROM a.criado_em))::bigint AS criado_em,

            COALESCE((
                SELECT json_agg(au.nome ORDER BY au.nome)
                FROM artigo_autores aa
                JOIN autores au ON au.id = aa.autor_id
                WHERE aa.artigo_id = a.id
            ), '[]'::json) AS autores,

            COALESCE((
                SELECT json_agg(c.nome ORDER BY c.nome)
                FROM artigo_categorias ac
                JOIN categorias c ON c.id = ac.categoria_id
                WHERE ac.artigo_id = a.id
            ), '[]'::json) AS categorias,

            COALESCE((
                SELECT json_agg(t.nome ORDER BY t.nome)
                FROM artigo_tags at
                JOIN tags t ON t.id = at.tag_id
                WHERE at.artigo_id = a.id
            ), '[]'::json) AS tags

        FROM artigos a
        ORDER BY a.id
    `);

    return resultado.rows;
}

async function importarLote(artigos) {
    const documentos = artigos
        .map(artigo => JSON.stringify({
            ...artigo,
            criado_em: Number(artigo.criado_em)
        }))
        .join('\n');

    const resposta = await fetch(
        `${TYPESENSE_URL}/collections/artigos/documents/import?action=upsert`,
        {
            method: 'POST',
            headers: {
                'X-TYPESENSE-API-KEY': API_KEY,
                'Content-Type': 'text/plain'
            },
            body: documentos
        }
    );

    const texto = await resposta.text();

    if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}: ${texto}`);
    }

    return texto.trim().split('\n').map(linha => JSON.parse(linha));
}

async function sincronizar() {
    if (!API_KEY) {
        throw new Error('TYPESENSE_API_KEY não encontrada no .env');
    }

    const artigos = await buscarArtigos();

    console.log(`Artigos encontrados no PostgreSQL: ${artigos.length}`);

    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < artigos.length; i += TAMANHO_LOTE) {
        const lote = artigos.slice(i, i + TAMANHO_LOTE);
        const resultados = await importarLote(lote);

        for (const resultado of resultados) {
            if (resultado.success) {
                sucessos++;
            } else {
                falhas++;
                console.error('Falha na importação:', resultado);
            }
        }

        console.log(
            `Lote ${Math.floor(i / TAMANHO_LOTE) + 1}: ` +
            `${sucessos + falhas}/${artigos.length} processados`
        );
    }

    console.log('\nSincronização finalizada.');
    console.log(`Sucessos: ${sucessos}`);
    console.log(`Falhas: ${falhas}`);
}

try {
    await sincronizar();
} catch (erro) {
    console.error('Erro na sincronização:', erro.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}
