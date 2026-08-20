// ============================================
// CONTROLLER — Interfaz HTTP
// ============================================
// 3 pasos: extraer → llamar service → responder.
// Sin lógica de negocio. Sin acceso al store.

import { Request, Response, NextFunction } from 'express';
import * as service from '../services/campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../types';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const result = await service.findAll({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params['id'] as string);
    const campaign = await service.findById(id);
    if (!campaign) {
      res.status(404).json({ error: 'Not Found', message: `Campaign ${id} not found` });
      return;
    }
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = req.body as CreateCampaignDto;
    const campaign = await service.create(dto);
    res.status(201).json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params['id'] as string);
    const dto = req.body as UpdateCampaignDto;
    const campaign = await service.update(id, dto);
    if (!campaign) {
      res.status(404).json({ error: 'Not Found', message: `Campaign ${id} not found` });
      return;
    }
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params['id'] as string);
    const deleted = await service.remove(id);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: `Campaign ${id} not found` });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
