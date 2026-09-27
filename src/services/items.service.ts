// src/services/campaigns.service.ts — Lógica de negocio
import * as repo from '../repositories/items.repository';
import { CreateCampaignDto, UpdateCampaignDto } from '../schemas/items.schema';
import { AppError } from '../errors/AppError';

export async function findAll(page: number, limit: number) {
  return repo.findAll(page, limit);
}

export async function findById(id: string) {
  const campaign = await repo.findById(id);
  if (!campaign) throw new AppError(404, 'Campaña no encontrada');
  return campaign;
}

export async function create(dto: CreateCampaignDto) {
  return repo.create(dto);
}

export async function update(id: string, dto: UpdateCampaignDto) {
  return repo.update(id, dto);
}

export async function remove(id: string): Promise<void> {
  await repo.remove(id);
}
