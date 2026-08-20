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
  createdAt: string;
}

// DTO para crear — sin campos auto-generados
export type CreateCampaignDto = Omit<Campaign, 'id' | 'createdAt'>;

// DTO para actualizar — todos los campos opcionales
export type UpdateCampaignDto = Partial<CreateCampaignDto>;

// Contratos de respuesta (genéricos, no cambiar nombres)
export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
