// src/routes/campaigns.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/items.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Lectura pública; escritura requiere sesión (semana 07).
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
