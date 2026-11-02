import { Router } from 'express';

import {
    pesquisar,
    relacionados
} from '../controllers/buscaController.js';

const router = Router();

router.get('/', pesquisar);

router.get('/:id/relacionados', relacionados);

export default router;
