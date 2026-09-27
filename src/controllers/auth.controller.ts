// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as service from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { setAuthCookies, clearAuthCookies } from '../lib/cookies';
import { AppError } from '../errors/AppError';

function sendValidationError(res: Response, issues: { field: string; message: string }[]): void {
  res.status(400).json({ status: 'error', message: 'Datos de entrada inválidos', issues });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      sendValidationError(res, result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })));
      return;
    }
    const { user, tokens } = await service.register(result.data);
    setAuthCookies(res, tokens);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      sendValidationError(res, result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })));
      return;
    }
    const { user, tokens } = await service.login(result.data);
    setAuthCookies(res, tokens);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tokens = await service.refresh(req.cookies?.['refreshToken']);
    setAuthCookies(res, tokens);
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.logout(req.cookies?.['refreshToken']);
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'No autenticado');
    const user = await service.me(req.user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}
