// src/schemas/campaign.schema.ts — Validación Zod para Campaign
import { z } from 'zod';

// Campos base SIN .default() — updateCampaignSchema (.partial() sobre esta
// forma) no debe inyectar active:true en un PUT parcial que no envía ese
// campo (mismo bug de Zod: .partial() no anula .default()).
const campaignShape = {
  name: z.string().min(1, 'El nombre es requerido').max(150),
  channel: z.string().min(1, 'El canal es requerido').max(50),
  budget: z.number().positive('El presupuesto debe ser mayor a 0'),
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(30)
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede tener letras mayúsculas, números y guiones'),
  active: z.boolean(),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
  clientId: z.string().uuid('clientId debe ser un UUID válido').optional(),
};

export const createCampaignSchema = z.object(campaignShape).extend({
  active: campaignShape.active.default(true),
  impressions: campaignShape.impressions.default(0),
  clicks: campaignShape.clicks.default(0),
  conversions: campaignShape.conversions.default(0),
});

export const updateCampaignSchema = z.object(campaignShape).partial();

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignSchema>;
