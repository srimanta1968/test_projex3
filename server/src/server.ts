import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

/**
 * Main server entry point
 */
async function startServer(): Promise<void> {
  try {
    const app = createApp();

    // Start the server
    const server = app.listen(config.port, () => {
      logger.info(`Server started successfully!`, {
        port: config.port,
        environment: config.nodeEnv,
        url: `http://localhost:${config.port}`,
      });

      console.log('\n=================================');
      console.log('  Banking Portal API Server');
      console.log('=================================');
      console.log(`  Status:      RUNNING`);
      console.log(`  Port:        ${config.port}`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  URL:         http://localhost:${config.port}`);
      console.log(`  Health:      http://localhost:${config.port}/health`);
      console.log('=================================\n');
    });

    // Graceful shutdown handlers
    const shutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();
