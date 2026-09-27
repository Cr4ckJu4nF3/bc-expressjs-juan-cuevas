// prisma/seed.ts — Dominio: Agencia de Marketing Digital
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo1234!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@agencia.test' },
    update: {},
    create: { email: 'demo@agencia.test', passwordHash, name: 'Usuario Demo', role: 'admin' },
  });
  console.log('✅ Usuario demo creado:', demoUser.email, '(password: Demo1234!)');

  const modaUrbana = await prisma.client.upsert({
    where: { name: 'Moda Urbana' }, update: {}, create: { name: 'Moda Urbana' },
  });
  const fitLife = await prisma.client.upsert({
    where: { name: 'FitLife Gym' }, update: {}, create: { name: 'FitLife Gym' },
  });
  const techNova = await prisma.client.upsert({
    where: { name: 'TechNova' }, update: {}, create: { name: 'TechNova' },
  });

  console.log('✅ Clientes creados:', modaUrbana.name, fitLife.name, techNova.name);

  const result = await prisma.campaign.createMany({
    data: [
      { name: 'Verano Rebajas 2026', channel: 'Instagram', budget: 2500, code: 'CMP-001', impressions: 154000, clicks: 6200, conversions: 310, clientId: modaUrbana.id },
      { name: 'Black Friday Push', channel: 'Facebook', budget: 3100.75, code: 'CMP-002', active: false, impressions: 178000, clicks: 7300, conversions: 390, clientId: modaUrbana.id },
      { name: 'Lanzamiento App Fit', channel: 'Google Ads', budget: 4200.5, code: 'CMP-003', impressions: 89000, clicks: 4100, conversions: 205, clientId: fitLife.id },
      { name: 'Tutoriales de Producto', channel: 'TikTok', budget: 1500, code: 'CMP-004', impressions: 320000, clicks: 15200, conversions: 610, clientId: fitLife.id },
      { name: 'Newsletter Semanal', channel: 'Email', budget: 350, code: 'CMP-005', impressions: 12000, clicks: 1800, conversions: 95, clientId: techNova.id },
    ],
  });

  console.log(`✅ Seed completo: ${result.count} campañas creadas`);
}

main()
  .catch((err: unknown) => { console.error('❌ Error en seed:', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
