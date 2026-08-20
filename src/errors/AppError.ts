// ============================================
// ERRORS — AppError (clase de errores operacionales)
// ============================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Fix necesario en TypeScript + CommonJS al extender clases nativas
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
