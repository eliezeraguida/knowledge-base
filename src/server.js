
import express from 'express';
import buscaRoutes from './routes/buscaRoutes.js';

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());

// Rota inicial para verificar se a API está funcionando
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API Knowledge Base funcionando!'
    });
});

// Rotas de pesquisa
app.use('/api/busca', buscaRoutes);

// Inicialização do servidor
app.listen(PORTA, () => {
    console.log(`API disponível em http://localhost:${PORTA}`);
});
