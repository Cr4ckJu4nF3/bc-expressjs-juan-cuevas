// src/repositories/campaigns.repository.ts — Acceso a datos con Prisma
import { prisma } from '../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AppError } from '../errors/AppError';
import { CreateCampaignDto, UpdateCampaignDto } from '../schemas/items.schema';

export async function findAll(page: number, limit: number) {
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
    prisma.campaign.count(),
  ]);
  return { data: campaigns, total, page, limit };
}

export async function findById(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: { client: true },
  });
}

export async function create(data: CreateCampaignDto) {
  try {
    return await prisma.campaign.create({ data });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe una campaña con ese código');
    }
    throw err;
  }
}

export async function update(id: string, data: UpdateCampaignDto) {
  try {
    return await prisma.campaign.update({ where: { id }, data });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Campaña no encontrada');
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe una campaña con ese código');
    }
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    await prisma.campaign.delete({ where: { id } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Campaña no encontrada');
    }
    throw err;
  }
}
