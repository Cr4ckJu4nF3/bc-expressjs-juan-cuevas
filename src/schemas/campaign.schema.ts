// ============================================
// SCHEMAS — Dominio: Agencia de Marketing Digital
// ============================================
import { z } from 'zod';

const metricsShape = z.object({
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
});

// Campos base SIN .default() — updateCampaignSchema usa esta forma con
// .partial() para que un PUT que no envía "active" no lo pise con un
// valor por defecto (el mismo bug de Zod que encontramos en el
// ejercicio 01: .partial() no anula .default()).
const campaignShape = {
  name: z.string({ error: 'name es obligatorio' }).min(1, 'name no puede estar vacío').trim(),
  client: z.string({ error: 'client es obligatorio' }).min(1, 'client no puede estar vacío').trim(),
  channel: z.string({ error: 'channel es obligatorio' }).min(1, 'channel no puede estar vacío').trim(),
  budget: z.number({ error: 'budget es obligatorio' }).positive('budget debe ser mayor a 0'),
  active: z.boolean(),
  metrics: metricsShape,
};

export const createCampaignSchema = z.object(campaignShape).extend({
  active: campaignShape.active.default(true),
  metrics: campaignShape.metrics.default({ impressions: 0, clicks: 0, conversions: 0 }),
});

export const updateCampaignSchema = z.object(campaignShape).partial();

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignSchema>;
