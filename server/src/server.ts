import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/testConnection';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server started successfully!`);
      logger.info(`   Listening on: http://localhost:${env.PORT}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   Database: Connected`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
