// src/controllers/campaigns.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as service from '../services/items.service';
import { createCampaignSchema, updateCampaignSchema } from '../schemas/items.schema';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const result = await service.findAll(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaign = await service.findById(req.params['id'] as string);
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // El errorHandler global (dado) solo reconoce AppError, no ZodError.
    // Por eso validamos con safeParse y respondemos el 400 acá mismo,
    // en vez de dejar que .parse() tire una excepción sin manejar.
    const result = createCampaignSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Datos de entrada inválidos',
        issues: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
      return;
    }
    const campaign = await service.create(result.data);
    res.status(201).json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = updateCampaignSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Datos de entrada inválidos',
        issues: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
      return;
    }
    const campaign = await service.update(req.params['id'] as string, result.data);
    res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.remove(req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
