import type { Campaign, CreateCampaignDto, UpdateCampaignDto } from './types.js';

// Store en memoria — simula una base de datos sin persistencia
// Los datos se pierden al reiniciar el servidor (se usará BD a partir de week-05)
const campaigns: Campaign[] = [];
let nextId = 1;

export function getAll(): Campaign[] {
  return campaigns;
}

export function getById(id: number): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}

export function create(data: CreateCampaignDto): Campaign {
  const newCampaign: Campaign = { id: nextId++, ...data };
  campaigns.push(newCampaign);
  return newCampaign;
}

export function update(id: number, data: UpdateCampaignDto): Campaign | undefined {
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  campaigns[index] = { ...campaigns[index], ...data };
  return campaigns[index];
}

export function remove(id: number): boolean {
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return false;

  campaigns.splice(index, 1);
  return true;
}
