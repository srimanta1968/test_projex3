import app from './app';
import { env, validateEnv } from './config/env';
import { testDatabaseConnection } from './config/testConnection';
import logger from './utils/logger';

async function startServer(): Promise<void> {
  try {
    // Validate environment variables
    validateEnv();
    logger.info('Environment variables validated');

    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info('Server started successfully!');
      logger.info(`   Listening on: http://localhost:${env.PORT}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   Database: Connected`);
      logger.info(`   API Prefix: ${env.API_PREFIX}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
