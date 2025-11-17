import app from './app';
import { config } from './config/env';
import { testDatabaseConnection } from './config/testConnection';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start server
    const server = app.listen(config.port, () => {
      logger.info('Server started successfully!', {
        port: config.port,
        environment: config.node_env,
        timestamp: new Date().toISOString(),
      });
      console.log(`\n🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Environment: ${config.node_env}`);
      console.log(`✅ Database: Connected`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
