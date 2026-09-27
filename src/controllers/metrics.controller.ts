// src/controllers/metrics.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as service from '../services/metrics.service';
import { createMetricSchema, updateMetricSchema } from '../schemas/metric.schema';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const campaignId = req.query['campaignId'] as string | undefined;
    const channel = req.query['channel'] as string | undefined;
    const result = await service.findAll({ page, limit, campaignId, channel });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const metric = await service.findById(req.params['id'] as string);
    res.json({ data: metric });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Mismo patrón que campaigns.controller.ts: el errorHandler global solo
    // reconoce AppError, así que el 400 de validación se responde acá con safeParse.
    const result = createMetricSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Datos de entrada inválidos',
        issues: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
      return;
    }
    const metric = await service.create(result.data);
    res.status(201).json({ data: metric });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = updateMetricSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Datos de entrada inválidos',
        issues: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
      return;
    }
    const metric = await service.update(req.params['id'] as string, result.data);
    res.json({ data: metric });
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

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await service.summaryByCampaign(req.params['campaignId'] as string);
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
}
