// ============================================
// SERVICE — lógica de negocio
// ============================================
import { Campaign, PaginatedResponse } from '../types';
import * as repo from '../repositories/campaigns.repository';
import { AppError } from '../errors/AppError';

interface FindAllOptions {
  page: number;
  limit: number;
}

export async function findAll(opts: FindAllOptions): Promise<PaginatedResponse<Campaign>> {
  const { page, limit } = opts;
  const all = await repo.findAll();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total: all.length, page, limit };
}

export async function findById(id: number): Promise<Campaign> {
  const campaign = await repo.findById(id);
  if (!campaign) throw new AppError(404, `Campaign ${id} not found`);
  return campaign;
}

export async function create(dto: repo.CreateCampaignRepoDto): Promise<Campaign> {
  return repo.create(dto);
}

export async function update(id: number, dto: repo.UpdateCampaignRepoDto): Promise<Campaign> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Campaign ${id} not found`);
  const updated = await repo.update(id, dto);
  return updated!;
}

export async function remove(id: number): Promise<void> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Campaign ${id} not found`);
  await repo.remove(id);
}
