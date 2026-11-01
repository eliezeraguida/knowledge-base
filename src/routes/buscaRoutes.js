import { Router } from 'express';
import { pesquisar } from '../controllers/buscaController.js';

const router = Router();

router.get('/', pesquisar);

export default router;
