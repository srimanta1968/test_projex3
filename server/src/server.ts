import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { pool, testDatabaseConnection } from './config/database';

async function startServer(): Promise<void> {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database. Server startup aborted.');
      process.exit(1);
    }

    // Start the server
    app.listen(env.port, () => {
      logger.info(`Server started successfully!`, {
        port: env.port,
        environment: env.nodeEnv,
        database: 'Connected',
      });

      console.log(`
========================================
  Quick Taxi API Server
========================================
  Status:      Running
  Port:        ${env.port}
  Environment: ${env.nodeEnv}
  Database:    Connected

  Health:      http://localhost:${env.port}/health
  API Base:    http://localhost:${env.port}/api
========================================
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', reason as Error, { promise: String(promise) });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

startServer();
