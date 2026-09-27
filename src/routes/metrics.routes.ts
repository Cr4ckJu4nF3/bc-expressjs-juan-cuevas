// src/routes/metrics.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/metrics.controller';

const router = Router();

// El summary va ANTES de /:id — si no, Express intentaría tratar
// "summary" como si fuera un :id de la ruta GET /:id.
router.get('/summary/:campaignId', controller.getSummary);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
