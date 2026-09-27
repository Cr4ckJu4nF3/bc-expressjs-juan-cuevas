// src/app.ts — Configuración de la aplicación Express
// Dominio: Agencia de Marketing Digital

import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import authRouter from './routes/auth.routes';
import campaignsRouter from './routes/items.routes';
import metricsRouter from './routes/metrics.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/campaigns', campaignsRouter);
app.use('/api/v1/metrics', metricsRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
