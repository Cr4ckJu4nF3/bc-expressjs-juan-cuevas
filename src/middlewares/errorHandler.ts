// ============================================
// MIDDLEWARES — errorHandler (4 parámetros)
// ============================================
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. ZodError → 400 con lista de issues
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Datos de entrada inválidos',
      issues: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // 2. AppError → código HTTP del error operacional
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.statusCode} — ${err.message}`);
    res.status(err.statusCode).json({
      error: 'Application Error',
      message: err.message,
    });
    return;
  }

  // 3. Error genérico → 500 (ocultar detalles en producción)
  const isProduction = process.env['NODE_ENV'] === 'production';
  const message = isProduction ? 'Error interno del servidor' : (err as Error).message;
  logger.error(`[Unhandled] ${(err as Error).message}`, { stack: (err as Error).stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message,
    ...(isProduction ? {} : { stack: (err as Error).stack }),
  });
}
