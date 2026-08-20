// ============================================
// APP — configuración de Express
// Registra middlewares, rutas y manejo de errores
// en el ORDEN CORRECTO.
// ============================================
import express from 'express';
import { morganMiddleware } from './config/logger';
import campaignsRouter from './routes/campaigns.routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// 1. Middlewares generales
app.use(express.json());
app.use(morganMiddleware);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 2. Rutas del dominio
app.use('/api/v1/campaigns', campaignsRouter);

// 3. Rutas no encontradas — DESPUÉS de todas las rutas
app.use(notFound);

// 4. Manejador global de errores — SIEMPRE el último (4 params)
app.use(errorHandler);

export default app;
