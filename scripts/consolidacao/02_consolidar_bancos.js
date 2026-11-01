
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const configuracao = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
};

const destino = new Pool({
    ...configuracao,
    database: 'knowledge_base'
});

const fontes = [
    { nome: 'agy', database: 'kb_staging_agy' },
    { nome: 'claude', database: 'kb_staging_claude' }
];

const pools = fontes.map(fonte => ({
    ...fonte,
    pool: new Pool({
        ...configuracao,
        database: fonte.database,
        options: '-c default_transaction_read_only=on'
    })
}));

function normalizar(valor) {
    return valor
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ');
}

async function lerFonte(fonte) {
    const [autores, categorias, tags, artigos,
        relAutores, relCategorias, relTags] = await Promise.all([
        fonte.pool.query('SELECT * FROM autores'),
        fonte.pool.query('SELECT * FROM categorias'),
        fonte.pool.query('SELECT * FROM tags'),
        fonte.pool.query('SELECT * FROM artigos'),
        fonte.pool.query('SELECT * FROM artigo_autores'),
        fonte.pool.query('SELECT * FROM artigo_categorias'),
        fonte.pool.query('SELECT * FROM artigo_tags')
    ]);

    return {
        ...fonte,
        autores: autores.rows,
        categorias: categorias.rows,
        tags: tags.rows,
        artigos: artigos.rows,
        relAutores: relAutores.rows,
        relCategorias: relCategorias.rows,
        relTags: relTags.rows
    };
}

async function inserir(pool, tabela, campos, valores) {
    const placeholders = campos.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${tabela} (${campos.join(', ')})
                 VALUES (${placeholders}) RETURNING id`;

    const resultado = await pool.query(sql, valores);
    return resultado.rows[0].id;
}

async function executar() {
    const dados = [];

    for (const fonte of pools) {
        dados.push(await lerFonte(fonte));
    }

    console.log('Fontes lidas:');
    for (const fonte of dados) {
        console.log(`${fonte.database}: ${fonte.artigos.length} artigos`);
    }

    const db = await destino.connect();

    try {
        await db.query('BEGIN');

        const verificacao = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM artigos) AS artigos,
                (SELECT COUNT(*) FROM autores) AS autores,
                (SELECT COUNT(*) FROM categorias) AS categorias,
                (SELECT COUNT(*) FROM tags) AS tags
        `);

        if (Object.values(verificacao.rows[0]).some(Number)) {
            throw new Error(
                'A base principal não está vazia. Importação cancelada.'
            );
        }

        const mapaAutores = new Map();
        const mapaCategorias = new Map();
        const mapaTags = new Map();
        const mapaArtigos = new Map();

        // 1. Consolidar autores por e-mail.
        for (const fonte of dados) {
            for (const autor of fonte.autores) {
                const chave = autor.email.trim().toLowerCase();

                if (!mapaAutores.has(chave)) {
                    const id = await inserir(
                        db,
                        'autores',
                        ['nome', 'email', 'biografia'],
                        [autor.nome, autor.email, autor.biografia]
                    );
                    mapaAutores.set(chave, id);
                }
            }
        }

        // 2. Consolidar categorias por nome normalizado.
        for (const fonte of dados) {
            for (const categoria of fonte.categorias) {
                const chave = normalizar(categoria.nome);

                if (!mapaCategorias.has(chave)) {
                    const id = await inserir(
                        db,
                        'categorias',
                        ['nome', 'descricao'],
                        [categoria.nome, categoria.descricao]
                    );
                    mapaCategorias.set(chave, id);
                }
            }
        }

        // 3. Consolidar tags por nome normalizado.
        for (const fonte of dados) {
            for (const tag of fonte.tags) {
                const chave = normalizar(tag.nome);

                if (!mapaTags.has(chave)) {
                    const id = await inserir(
                        db,
                        'tags',
                        ['nome'],
                        [tag.nome]
                    );
                    mapaTags.set(chave, id);
                }
            }
        }

        // 4. Inserir todos os artigos.
        const slugsUsados = new Set();

        for (const fonte of dados) {
            for (const artigo of fonte.artigos) {
                let slug = artigo.slug;
                let sufixo = `-${fonte.nome}`;
                let contador = 1;

                if (slugsUsados.has(slug.toLowerCase())) {
                    slug = `${artigo.slug}${sufixo}`;
                }

                while (slugsUsados.has(slug.toLowerCase())) {
                    contador++;
                    slug = `${artigo.slug}${sufixo}-${contador}`;
                }

                slugsUsados.add(slug.toLowerCase());

                const id = await inserir(
                    db,
                    'artigos',
                    [
                        'titulo', 'slug', 'resumo', 'conteudo',
                        'status', 'criado_em', 'atualizado_em'
                    ],
                    [
                        artigo.titulo,
                        slug,
                        artigo.resumo,
                        artigo.conteudo,
                        artigo.status,
                        artigo.criado_em,
                        artigo.atualizado_em
                    ]
                );

                mapaArtigos.set(`${fonte.nome}:${artigo.id}`, id);
            }
        }

        // 5. Reconstruir os relacionamentos.
        const relacoesAutores = [];
        const relacoesCategorias = [];
        const relacoesTags = [];

        for (const fonte of dados) {
            for (const rel of fonte.relAutores) {
                const artigoId = mapaArtigos.get(
                    `${fonte.nome}:${rel.artigo_id}`
                );
                const autor = fonte.autores.find(
                    a => a.id === rel.autor_id
                );
                const autorId = mapaAutores.get(
                    autor.email.trim().toLowerCase()
                );

                relacoesAutores.push([artigoId, autorId]);
            }

            for (const rel of fonte.relCategorias) {
                const artigoId = mapaArtigos.get(
                    `${fonte.nome}:${rel.artigo_id}`
                );
                const categoria = fonte.categorias.find(
                    c => c.id === rel.categoria_id
                );
                const categoriaId = mapaCategorias.get(
                    normalizar(categoria.nome)
                );

                relacoesCategorias.push([artigoId, categoriaId]);
            }

            for (const rel of fonte.relTags) {
                const artigoId = mapaArtigos.get(
                    `${fonte.nome}:${rel.artigo_id}`
                );
                const tag = fonte.tags.find(
                    t => t.id === rel.tag_id
                );
                const tagId = mapaTags.get(normalizar(tag.nome));

                relacoesTags.push([artigoId, tagId]);
            }
        }

        async function inserirRelacoes(tabela, relacoes) {
            if (!relacoes.length) return;

            const artigos = relacoes.map(r => r[0]);
            const relacionados = relacoes.map(r => r[1]);

            await db.query(`
                INSERT INTO ${tabela}
                    (artigo_id, ${tabela === 'artigo_autores'
                        ? 'autor_id'
                        : tabela === 'artigo_categorias'
                            ? 'categoria_id' : 'tag_id'})
                SELECT * FROM UNNEST($1::integer[], $2::integer[])
                ON CONFLICT DO NOTHING
            `, [artigos, relacionados]);
        }

        await inserirRelacoes('artigo_autores', relacoesAutores);
        await inserirRelacoes('artigo_categorias', relacoesCategorias);
        await inserirRelacoes('artigo_tags', relacoesTags);

        await db.query('COMMIT');

        console.log('\nCONSOLIDAÇÃO CONCLUÍDA');

        const resultado = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM autores) AS autores,
                (SELECT COUNT(*) FROM categorias) AS categorias,
                (SELECT COUNT(*) FROM tags) AS tags,
                (SELECT COUNT(*) FROM artigos) AS artigos,
                (SELECT COUNT(*) FROM artigo_autores) AS rel_autores,
                (SELECT COUNT(*) FROM artigo_categorias) AS rel_categorias,
                (SELECT COUNT(*) FROM artigo_tags) AS rel_tags
        `);

        console.table(resultado.rows);

    } catch (erro) {
        await db.query('ROLLBACK');
        console.error('\nCONSOLIDAÇÃO CANCELADA:', erro.message);
        process.exitCode = 1;
    } finally {
        db.release();
    }
}

try {
    await executar();
} finally {
    await Promise.all([
        destino.end(),
        ...pools.map(f => f.pool.end())
    ]);
}
