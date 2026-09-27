// src/lib/tokens.ts — Firma y verificación de JWT (access + refresh)
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

function getAccessSecret(): string {
  const secret = process.env['JWT_ACCESS_SECRET'];
  if (!secret) throw new Error('JWT_ACCESS_SECRET no está definida en las variables de entorno');
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error('JWT_REFRESH_SECRET no está definida en las variables de entorno');
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const expiresIn = process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m';
  return jwt.sign(payload, getAccessSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const expiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d';
  return jwt.sign(payload, getRefreshSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
}

export function newJti(): string {
  return crypto.randomUUID();
}

// Solo se guarda el hash del refresh token en la base de datos — nunca el
// token en claro — igual que con la contraseña.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
