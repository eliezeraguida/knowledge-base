
import { buscarArtigos } from '../services/buscaService.js';

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
