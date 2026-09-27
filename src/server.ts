// src/server.ts — Entry point del servidor
import { app } from './app';
import { logger } from './config/logger';
import { prisma } from './lib/prisma';
import { connectMongo, disconnectMongo } from './lib/mongoose';

const PORT = Number(process.env['PORT']) || 3000;

async function bootstrap(): Promise<void> {
  await connectMongo();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📘 Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
  });

  function shutdown(signal: string): void {
    logger.info(`${signal} received. Closing server gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      await disconnectMongo();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err: unknown) => {
  logger.error(`❌ Error al iniciar el servidor: ${err}`);
  process.exit(1);
});
