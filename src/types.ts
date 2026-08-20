// ============================================
// TIPOS — Dominio: Agencia de Marketing Digital
// ============================================

// Métricas de rendimiento de la campaña
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
}

// Recurso principal del catálogo
export interface Campaign {
  id: string;
  name: string;
  client: string;
  channel: string;
  budget: number;
  active: boolean;
  metrics: CampaignMetrics;
}

// Resumen que el procesador debe calcular
export interface CampaignSummary {
  total: number;
  active: number;
  inactive: number;
  averageBudget: number;
  mostExpensive: Campaign; // mayor presupuesto
  cheapest: Campaign; // menor presupuesto
  channels: string[];
}

// Reporte final que se escribirá en output/report.json
export interface Report {
  generatedAt: string;
  appliedFilter: string | null;
  summary: CampaignSummary;
  campaigns: Campaign[];
}