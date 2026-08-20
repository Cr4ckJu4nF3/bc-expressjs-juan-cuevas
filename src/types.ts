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
  createdAt: Date;
}

export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  issues: Array<{ field: string; message: string }>;
}

export interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
}
