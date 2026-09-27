// src/routes/metrics.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/metrics.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// El summary va ANTES de /:id — si no, Express intentaría tratar
// "summary" como si fuera un :id de la ruta GET /:id.
router.get('/summary/:campaignId', controller.getSummary);

// Lectura pública; escritura requiere sesión (semana 07).
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
