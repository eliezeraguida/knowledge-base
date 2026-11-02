import {
    buscarArtigos,
    buscarArtigosRelacionados,
    buscarArtigoPorId
} from '../services/buscaService.js';

export async function pesquisar(req, res) {
    try {
        const termo = req.query.q;
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;

        if (!termo || !termo.trim()) {
            return res.status(400).json({
                erro: 'Informe um termo para pesquisar.'
            });
        }

        if (pagina < 1 || limite < 1 || limite > 50) {
            return res.status(400).json({
                erro: 'Parâmetros de paginação inválidos.'
            });
        }

        const resultado = await buscarArtigos(
            termo.trim(),
            pagina,
            limite
        );

        return res.status(200).json(resultado);

    } catch (erro) {
        console.error('Erro na pesquisa:', erro);

        return res.status(500).json({
            erro: 'Não foi possível realizar a pesquisa.'
        });
    }
}

// Retorna artigos relacionados por categorias e tags
export async function relacionados(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                erro: 'ID do artigo inválido.'
            });
        }

        const resultado = await buscarArtigosRelacionados(id);

        return res.status(200).json({
            artigo_id: id,
            total: resultado.length,
            resultados: resultado
        });

    } catch (erro) {
        console.error('Erro ao buscar artigos relacionados:', erro);

        return res.status(500).json({
            erro: 'Não foi possível buscar artigos relacionados.'
        });
    }
}
// Busca os dados completos de um artigo pelo ID
export async function obterArtigo(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                erro: 'ID do artigo inválido.'
            });
        }

        const artigo = await buscarArtigoPorId(id);

        if (!artigo) {
            return res.status(404).json({
                erro: 'Artigo não encontrado.'
            });
        }

        return res.status(200).json(artigo);

    } catch (erro) {
        console.error('Erro ao buscar artigo:', erro);

        return res.status(500).json({
            erro: 'Não foi possível buscar o artigo.'
        });
    }
}
