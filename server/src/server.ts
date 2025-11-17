import http from 'http';
import { createApp } from './app';
import { env, validateEnv } from './config/env';
import { testConnection, closePool } from './config/database';
import { WebSocketManager } from './websocket/websocketServer';
import logger from './utils/logger';

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    // Validate environment
    validateEnv();

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    const wsManager = new WebSocketManager(server);

    // Make WebSocket manager available globally
    (global as any).wsManager = wsManager;

    // Start server
    server.listen(env.port, () => {
      logger.info(`Server started`, {
        port: env.port,
        environment: env.nodeEnv,
      });
      logger.info(`HTTP server: http://localhost:${env.port}`);
      logger.info(`WebSocket server: ws://localhost:${env.port}/ws`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await closePool();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Server startup error', { error });
    process.exit(1);
  }
}

start();
