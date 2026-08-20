import { createApp } from './app.js';

const PORT = process.env.PORT ?? '3000';
const app = createApp();

const server = app.listen(Number(PORT), () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown: cierra el servidor limpiamente ante SIGTERM o SIGINT
// (importante para no cortar peticiones en curso al desplegar o reiniciar)
function shutdown(signal: string): void {
  console.log(`\n${signal} received. Closing server gracefully...`);
  server.close(() => {
    console.log('Server closed. Bye!');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
