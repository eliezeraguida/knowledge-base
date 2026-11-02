import express from 'express';
import buscaRoutes from './routes/buscaRoutes.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import artigoRoutes from './routes/artigoRoutes.js';

const app = express();
const PORTA = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api/artigos', artigoRoutes);

app.use(express.static(path.join(__dirname, '../public')));

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
