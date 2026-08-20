// ============================================
// CONFIG — logger de Winston + stream para Morgan
// ============================================
import { createLogger, format, transports } from 'winston';
import morgan from 'morgan';

const isDev = process.env['NODE_ENV'] !== 'production';

// Formato para desarrollo: coloreado y legible en consola
const devFormat = format.combine(
  format.timestamp({ format: 'HH:mm:ss' }),
  format.colorize(),
  format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
);

// Formato para producción: JSON estructurado (fácil de parsear por herramientas de log)
const prodFormat = format.combine(format.timestamp(), format.json());

export const logger = createLogger({
  level: isDev ? 'http' : 'warn',
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
    // Solo en producción: además de consola, persistir errores en archivo
    ...(isDev ? [] : [new transports.File({ filename: 'logs/error.log', level: 'error' })]),
  ],
});

// Stream que conecta Morgan (logs HTTP) con Winston (nivel 'http')
export const morganStream = { write: (message: string) => logger.http(message.trim()) };

const morganFormat = isDev ? 'dev' : 'combined';
export const morganMiddleware = morgan(morganFormat, { stream: morganStream });
