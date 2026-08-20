// ============================================
// ROUTES — Mapeo de URLs a controllers
// ============================================

import { Router } from 'express';
import * as controller from '../controllers/campaigns.controller';

export const campaignsRouter = Router();

campaignsRouter.get('/', controller.getAll);
campaignsRouter.get('/:id', controller.getById);
campaignsRouter.post('/', controller.create);
campaignsRouter.put('/:id', controller.update);
campaignsRouter.delete('/:id', controller.remove);
