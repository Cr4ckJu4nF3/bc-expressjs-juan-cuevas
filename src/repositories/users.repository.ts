// src/repositories/users.repository.ts — Acceso a datos con Prisma
import { prisma } from '../lib/prisma';

interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function create(data: CreateUserData) {
  return prisma.user.create({ data });
}
