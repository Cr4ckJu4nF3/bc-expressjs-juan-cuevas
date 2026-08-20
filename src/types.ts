// ============================================
// TYPES — Dominio: Agencia de Marketing Digital
// ============================================

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface Campaign {
  id: number;
  name: string;
  client: string;
  channel: string;
  budget: number;
  active: boolean;
  metrics: CampaignMetrics;
}

// DTO usado para crear una nueva campaña (sin id, se genera automáticamente)
export type CreateCampaignDto = Omit<Campaign, 'id'>;

// DTO para actualización (todos los campos editables)
export type UpdateCampaignDto = Partial<CreateCampaignDto>;
