// src/lib/cookies.ts — Cookies HttpOnly para access/refresh token
import type { Response } from 'express';

const isProd = process.env['NODE_ENV'] === 'production';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // 15m — debe coincidir con JWT_ACCESS_EXPIRES_IN
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7d — debe coincidir con JWT_REFRESH_EXPIRES_IN

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function setAuthCookies(res: Response, tokens: Tokens): void {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
  // El refresh token solo se envía de vuelta en /api/v1/auth/* — reduce
  // la superficie de exposición del token de mayor duración.
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
}
