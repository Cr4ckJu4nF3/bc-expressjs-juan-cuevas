// src/middlewares/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../lib/tokens';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.['accessToken'];
  if (!token) {
    next(new AppError(401, 'No autenticado'));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'Sesión inválida o expirada'));
  }
}
