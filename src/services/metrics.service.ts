// src/services/metrics.service.ts — Lógica de negocio
import * as repo from '../repositories/metrics.repository';
import { CreateMetricDto, UpdateMetricDto } from '../schemas/metric.schema';
import { AppError } from '../errors/AppError';

interface FindAllParams {
  page: number;
  limit: number;
  campaignId?: string | undefined;
  channel?: string | undefined;
}

export async function findAll(params: FindAllParams) {
  return repo.findAll(params);
}

export async function findById(id: string) {
  const metric = await repo.findById(id);
  if (!metric) throw new AppError(404, 'Métrica no encontrada');
  return metric;
}

export async function create(dto: CreateMetricDto) {
  return repo.create(dto);
}

export async function update(id: string, dto: UpdateMetricDto) {
  return repo.update(id, dto);
}

export async function remove(id: string): Promise<void> {
  await repo.remove(id);
}

export async function summaryByCampaign(campaignId: string) {
  return repo.summaryByCampaign(campaignId);
}
