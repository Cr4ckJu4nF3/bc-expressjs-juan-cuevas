// ============================================
// REPOSITORY — Capa de acceso a datos
// ============================================
// Único punto de acceso al store (hoy: array en memoria,
// mañana week-05: Prisma sin tocar service ni controller).

import { Campaign, CreateCampaignDto, UpdateCampaignDto } from '../types';

const store: Campaign[] = [
  {
    id: 1,
    name: 'Verano Rebajas 2026',
    client: 'Moda Urbana',
    channel: 'Instagram',
    budget: 2500,
    active: true,
    metrics: { impressions: 154000, clicks: 6200, conversions: 310 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Lanzamiento App Fit',
    client: 'FitLife Gym',
    channel: 'Google Ads',
    budget: 4200.5,
    active: true,
    metrics: { impressions: 89000, clicks: 4100, conversions: 205 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Newsletter Semanal',
    client: 'TechNova',
    channel: 'Email',
    budget: 350,
    active: true,
    metrics: { impressions: 12000, clicks: 1800, conversions: 95 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Reels Producto Estrella',
    client: 'Bella Cosmetics',
    channel: 'Instagram',
    budget: 1800,
    active: false,
    metrics: { impressions: 210000, clicks: 9800, conversions: 480 },
    createdAt: new Date().toISOString(),
  },
];
let nextId = 5;

export async function findAll(): Promise<Campaign[]> {
  // Copia defensiva: no exponemos la referencia interna del array
  return [...store];
}

export async function findById(id: number): Promise<Campaign | undefined> {
  return store.find((c) => c.id === id);
}

export async function create(dto: CreateCampaignDto): Promise<Campaign> {
  const campaign: Campaign = {
    id: nextId++,
    ...dto,
    createdAt: new Date().toISOString(),
  };
  store.push(campaign);
  return { ...campaign };
}

export async function update(id: number, dto: UpdateCampaignDto): Promise<Campaign | undefined> {
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index]!, ...dto };
  return { ...store[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
