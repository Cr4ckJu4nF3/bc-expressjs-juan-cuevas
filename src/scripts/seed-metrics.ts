// src/scripts/seed-metrics.ts — Seed de métricas (MongoDB)
// Dominio: Agencia de Marketing Digital
//
// Reemplaza los UUIDs de abajo por los ids reales de tus Campaign en Postgres
// (los obtienes con GET /api/v1/campaigns o mirando el log de `pnpm dlx prisma db seed`).
// También puedes pasarlos por variables de entorno para no tocar el código.

import mongoose from 'mongoose';
import { Metric } from '../models/metric.model';

const CAMPAIGN_IDS = {
  veranoRebajas: process.env['SEED_CAMPAIGN_VERANO'] ?? 'REEMPLAZA-CON-UUID-DE-CAMPAIGN-VERANO',
  blackFriday: process.env['SEED_CAMPAIGN_BLACKFRIDAY'] ?? 'REEMPLAZA-CON-UUID-DE-CAMPAIGN-BLACKFRIDAY',
};

async function main(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) throw new Error('MONGODB_URI no está definida');

  console.log('🌱 Iniciando seed de métricas...');
  await mongoose.connect(uri);
  console.log('🍃 Conectado a MongoDB');

  await Metric.deleteMany({});

  const docs = [
    {
      campaignId: CAMPAIGN_IDS.veranoRebajas,
      channel: 'Instagram',
      date: new Date('2026-07-01'),
      impressions: 12000,
      clicks: 480,
      conversions: 22,
      spend: 180,
      extra: { likes: 340, shares: 12 },
    },
    {
      campaignId: CAMPAIGN_IDS.veranoRebajas,
      channel: 'Instagram',
      date: new Date('2026-07-02'),
      impressions: 15500,
      clicks: 610,
      conversions: 30,
      spend: 195,
      extra: { likes: 410, shares: 20 },
    },
    {
      campaignId: CAMPAIGN_IDS.blackFriday,
      channel: 'Facebook',
      date: new Date('2026-11-24'),
      impressions: 22000,
      clicks: 990,
      conversions: 55,
      spend: 310,
      extra: { reactions: 800 },
    },
    {
      campaignId: CAMPAIGN_IDS.blackFriday,
      channel: 'TikTok',
      date: new Date('2026-11-24'),
      impressions: 41000,
      clicks: 2100,
      conversions: 90,
      spend: 260,
      extra: { videoViews: 38000, watchTimeSeconds: 512000 },
    },
  ];

  const result = await Metric.insertMany(docs);
  console.log(`✅ Seed completo: ${result.length} métricas creadas`);
}

main()
  .catch((err: unknown) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
