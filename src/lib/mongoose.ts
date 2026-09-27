// src/lib/mongoose.ts — Conexión a MongoDB
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export async function connectMongo(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('MONGODB_URI no está definida en las variables de entorno');
  }

  mongoose.connection.on('connected', () => logger.info('🍃 MongoDB conectado'));
  mongoose.connection.on('error', (err: unknown) => logger.error(`❌ Error de conexión a MongoDB: ${err}`));
  mongoose.connection.on('disconnected', () => logger.info('🍃 MongoDB desconectado'));

  await mongoose.connect(uri);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
