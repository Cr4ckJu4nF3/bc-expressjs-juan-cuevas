// src/services/auth.service.ts — Lógica de negocio de autenticación
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as usersRepo from '../repositories/users.repository';
import * as refreshRepo from '../repositories/refreshTokens.repository';
import { AppError } from '../errors/AppError';
import { hashPassword, verifyPassword } from '../lib/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, newJti, hashToken } from '../lib/tokens';
import { RegisterDto, LoginDto } from '../schemas/auth.schema';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d — debe coincidir con JWT_REFRESH_EXPIRES_IN

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}

function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function issueTokens(user: PublicUser): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  const jti = newJti();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  await refreshRepo.create({
    userId: user.id,
    jti,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

export async function register(dto: RegisterDto): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  try {
    const passwordHash = await hashPassword(dto.password);
    const user = await usersRepo.create({ email: dto.email, passwordHash, name: dto.name });
    const publicUser = toPublicUser(user);
    const tokens = await issueTokens(publicUser);
    return { user: publicUser, tokens };
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe una cuenta con ese email');
    }
    throw err;
  }
}

export async function login(dto: LoginDto): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  const user = await usersRepo.findByEmail(dto.email);
  // Mismo mensaje exista o no el email — evita revelar qué correos están registrados.
  if (!user) throw new AppError(401, 'Credenciales inválidas');

  const valid = await verifyPassword(dto.password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Credenciales inválidas');

  const publicUser = toPublicUser(user);
  const tokens = await issueTokens(publicUser);
  return { user: publicUser, tokens };
}

export async function refresh(refreshToken: string | undefined): Promise<AuthTokens> {
  if (!refreshToken) throw new AppError(401, 'No autenticado');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token inválido o expirado');
  }

  const stored = await refreshRepo.findByJti(payload.jti);
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token inválido o expirado');
  }
  if (stored.tokenHash !== hashToken(refreshToken)) {
    // jti válido pero el token no coincide con el hash guardado: indicio de
    // que un refresh token ya rotado se está reutilizando. Se revocan todas
    // las sesiones del usuario por seguridad.
    await refreshRepo.revokeAllForUser(stored.userId);
    throw new AppError(401, 'Refresh token inválido');
  }

  const user = await usersRepo.findById(stored.userId);
  if (!user) throw new AppError(401, 'Usuario no encontrado');

  // Rotación: el refresh token usado se revoca y se emite un par nuevo.
  await refreshRepo.revoke(stored.id);
  return issueTokens(toPublicUser(user));
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await refreshRepo.findByJti(payload.jti);
    if (stored && !stored.revokedAt) {
      await refreshRepo.revoke(stored.id);
    }
  } catch {
    // Token ya inválido/expirado: no hay nada que revocar, se ignora.
  }
}

export async function me(userId: string): Promise<PublicUser> {
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  return toPublicUser(user);
}
