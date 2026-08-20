// ============================================
// REPOSITORY — capa de acceso a datos (en memoria)
// ============================================
import { Campaign } from '../types';

export type CreateCampaignRepoDto = Omit<Campaign, 'id' | 'createdAt'>;
export type UpdateCampaignRepoDto = Partial<CreateCampaignRepoDto>;

let campaigns: Campaign[] = [
  {
    id: 1,
    name: 'Verano Rebajas 2026',
    client: 'Moda Urbana',
    channel: 'Instagram',
    budget: 2500,
    active: true,
    metrics: { impressions: 154000, clicks: 6200, conversions: 310 },
    createdAt: new Date(),
  },
  {
    id: 2,
    name: 'Lanzamiento App Fit',
    client: 'FitLife Gym',
    channel: 'Google Ads',
    budget: 4200.5,
    active: true,
    metrics: { impressions: 89000, clicks: 4100, conversions: 205 },
    createdAt: new Date(),
  },
  {
    id: 3,
    name: 'Newsletter Semanal',
    client: 'TechNova',
    channel: 'Email',
    budget: 350,
    active: false,
    metrics: { impressions: 12000, clicks: 1800, conversions: 95 },
    createdAt: new Date(),
  },
];

let nextId = 4;

export async function findAll(): Promise<Campaign[]> {
  return [...campaigns];
}

export async function findById(id: number): Promise<Campaign | undefined> {
  return campaigns.find((c) => c.id === id);
}

export async function create(dto: CreateCampaignRepoDto): Promise<Campaign> {
  const campaign: Campaign = { id: nextId++, ...dto, createdAt: new Date() };
  campaigns.push(campaign);
  return { ...campaign };
}

export async function update(id: number, dto: UpdateCampaignRepoDto): Promise<Campaign | undefined> {
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  campaigns[index] = { ...campaigns[index]!, ...dto };
  return { ...campaigns[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return false;
  campaigns.splice(index, 1);
  return true;
}
