// src/models/metric.model.ts — Modelo Mongoose
// Dominio: Agencia de Marketing Digital
//
// Metric guarda un evento diario de rendimiento de una Campaign (Postgres)
// en un canal dado. campaignId NO es una FK real (no hay joins entre Postgres
// y MongoDB): es el id (UUID) de la Campaign en Postgres, guardado como string.
//
// El campo `extra` es intencionalmente Mixed: cada canal reporta métricas
// distintas (TikTok → videoViews/watchTimeSeconds, Email → openRate/bounceRate,
// Instagram → likes/shares...). Esa variabilidad de forma es justamente el
// caso de uso donde un schema flexible (MongoDB) encaja mejor que una tabla
// relacional con columnas fijas.

import { Schema, model, type Document } from 'mongoose';

export interface IMetric extends Document {
  campaignId: string;
  channel: string;
  date: Date;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  extra?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const metricSchema = new Schema<IMetric>(
  {
    campaignId: { type: String, required: true, index: true },
    channel: { type: String, required: true, trim: true, maxlength: 50 },
    date: { type: Date, required: true },
    impressions: { type: Number, required: true, min: 0, default: 0 },
    clicks: { type: Number, required: true, min: 0, default: 0 },
    conversions: { type: Number, required: true, min: 0, default: 0 },
    spend: { type: Number, required: true, min: 0, default: 0 },
    extra: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Evita cargar dos veces la métrica de la misma campaña+canal+día
// (equivalente conceptual al P2002/code único de Campaign en Prisma).
metricSchema.index({ campaignId: 1, channel: 1, date: 1 }, { unique: true });

export const Metric = model<IMetric>('Metric', metricSchema);
