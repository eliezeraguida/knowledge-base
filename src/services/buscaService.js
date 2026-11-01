
import typesense from '../config/typesense.js';

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
