// src/schemas/metric.schema.ts — Validación Zod para Metric
import { z } from 'zod';

// Campos base SIN .default() por el mismo motivo que en campaign.schema.ts:
// .partial() (usado en updateMetricSchema) no anula un .default() previo,
// así que un PUT parcial podría reinyectar valores por defecto no deseados.
const metricShape = {
  // id de la Campaign en Postgres — no se valida contra la base de datos acá,
  // eso lo resuelve quien consuma el endpoint (o se valida en el repository si hace falta).
  campaignId: z.string().uuid('campaignId debe ser un UUID válido (id de Campaign en Postgres)'),
  channel: z.string().min(1, 'El canal es requerido').max(50),
  date: z.coerce.date({ message: 'date debe ser una fecha válida (ISO 8601)' }),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
  spend: z.number().nonnegative(),
  extra: z.record(z.string(), z.unknown()).optional(),
};

export const createMetricSchema = z.object(metricShape).extend({
  impressions: metricShape.impressions.default(0),
  clicks: metricShape.clicks.default(0),
  conversions: metricShape.conversions.default(0),
  spend: metricShape.spend.default(0),
});

export const updateMetricSchema = z.object(metricShape).partial();

export type CreateMetricDto = z.infer<typeof createMetricSchema>;
export type UpdateMetricDto = z.infer<typeof updateMetricSchema>;
