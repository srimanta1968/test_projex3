import { createApp } from './app';
import { env, validateEnv } from './config/env';
import { logger } from './utils/logger';
import { pool, testDatabaseConnection } from './config/database';
import { webSocketServer } from './websocket/WebSocketServer';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Validate environment variables
    logger.info('🔧 Validating environment configuration...');
    validateEnv();

    // Test database connection
    logger.info('🔍 Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      logger.error('❌ Failed to connect to database. Server startup aborted.');
      process.exit(1);
    }

    // Create Express app
    const app = createApp();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info('🚀 Server started successfully!', {
        port: env.PORT,
        environment: env.NODE_ENV,
        url: `http://localhost:${env.PORT}`,
      });
      logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`🔐 Auth API: http://localhost:${env.PORT}/api/auth`);
      logger.info(`🔌 WebSocket: ws://localhost:${env.PORT}/ws`);
    });

    // Initialize WebSocket server
    webSocketServer.initialize(server);

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close WebSocket server
        webSocketServer.close();

        try {
          await pool.end();
          logger.info('Database connections closed');
        } catch (err) {
          logger.error('Error closing database connections:', err);
        }

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
