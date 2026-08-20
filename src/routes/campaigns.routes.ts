import { Router } from 'express';
import * as store from '../store.js';
import type { CreateCampaignDto, UpdateCampaignDto } from '../types.js';

export const campaignsRouter = Router();

// GET /campaigns — Listar todas las campañas
campaignsRouter.get('/', (_req, res) => {
  res.json(store.getAll());
});

// GET /campaigns/:id — Obtener campaña por ID
campaignsRouter.get('/:id', (req, res) => {
  const campaign = store.getById(Number(req.params.id));
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json(campaign);
});

// POST /campaigns — Crear nueva campaña
campaignsRouter.post('/', (req, res) => {
  const dto = req.body as CreateCampaignDto;
  const newCampaign = store.create(dto);
  res.status(201).json(newCampaign);
});

// PUT /campaigns/:id — Actualizar campaña completa
campaignsRouter.put('/:id', (req, res) => {
  const dto = req.body as UpdateCampaignDto;
  const updated = store.update(Number(req.params.id), dto);
  if (!updated) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json(updated);
});

// DELETE /campaigns/:id — Eliminar campaña
campaignsRouter.delete('/:id', (req, res) => {
  const deleted = store.remove(Number(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.status(204).send();
});
