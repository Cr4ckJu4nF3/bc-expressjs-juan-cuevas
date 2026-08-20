// ============================================
// SERVICE — Lógica de negocio
// ============================================
// CERO imports de Express. 100% testeable con Jest.

import { CreateCampaignDto, UpdateCampaignDto, Campaign, PaginatedResponse, PaginationParams } from '../types';
import * as repo from '../repositories/campaigns.repository';

export async function findAll(params: PaginationParams): Promise<PaginatedResponse<Campaign>> {
  const { page, limit } = params;
  const all = await repo.findAll();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total: all.length, page, limit };
}

export async function findById(id: number): Promise<Campaign | undefined> {
  return repo.findById(id);
}

export async function create(dto: CreateCampaignDto): Promise<Campaign> {
  // Regla de negocio: el presupuesto no puede ser negativo
  if (dto.budget < 0) {
    throw new Error('budget must be a non-negative number');
  }
  return repo.create(dto);
}

export async function update(id: number, dto: UpdateCampaignDto): Promise<Campaign | undefined> {
  const exists = await repo.findById(id);
  if (!exists) return undefined;
  return repo.update(id, dto);
}

export async function remove(id: number): Promise<boolean> {
  const exists = await repo.findById(id);
  if (!exists) return false;
  return repo.remove(id);
}
