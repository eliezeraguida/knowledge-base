import { Router } from 'express';
import { obterArtigo } from '../controllers/buscaController.js';

const router = Router();

router.get('/:id', obterArtigo);

export default router;