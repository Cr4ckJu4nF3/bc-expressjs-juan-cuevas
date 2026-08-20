import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import { campaignsRouter } from './routes/campaigns.routes.js';

export function createApp(): Application {
  const app = express();

  // 1. express.json() — parseo de body (requerido para POST/PUT)
  app.use(express.json());

  // 2. Logger personalizado — loggear todas las peticiones
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.url} → ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // 3. Health check (no requiere middleware especial)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 4. Rutas del recurso principal
  app.use('/api/v1/campaigns', campaignsRouter);

  // 5. Handler para rutas no encontradas (404)
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // 6. Error handler global — SIEMPRE el último app.use()
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const isDev = process.env.NODE_ENV === 'development';

    console.error(`[ERROR] ${err.message}`);
    if (isDev) console.error(err.stack);

    res.status(500).json({
      error: isDev ? err.message : 'Internal server error',
    });
  });

  return app;
}
