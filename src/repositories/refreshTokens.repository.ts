// src/repositories/refreshTokens.repository.ts — Acceso a datos con Prisma
import { prisma } from '../lib/prisma';

interface CreateRefreshTokenData {
  userId: string;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
}

export async function create(data: CreateRefreshTokenData) {
  return prisma.refreshToken.create({ data });
}

export async function findByJti(jti: string) {
  return prisma.refreshToken.findUnique({ where: { jti } });
}

export async function revoke(id: string) {
  return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
}

// Se usa cuando se detecta reuso de un refresh token ya rotado
// (posible robo): invalida todas las sesiones activas del usuario.
export async function revokeAllForUser(userId: string) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
