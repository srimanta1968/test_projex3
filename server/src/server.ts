import http from 'http';
import app from './app';
import { env } from './config/env';
import logger from './utils/logger';

const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting Banking Portal Server...');
    logger.info(`Environment: ${env.NODE_ENV}`);

    // Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`Server is running on http://localhost:${env.PORT}`);
      logger.info('Available endpoints:');
      logger.info(`  - Health check: http://localhost:${env.PORT}/health`);
      logger.info(`  - API root: http://localhost:${env.PORT}/`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', { error: reason.message, stack: reason.stack });
      // In production, you might want to exit and let a process manager restart the app
      if (env.isProduction) {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
      // Gracefully shutdown
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    const shutdown = (signal: string): void => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  }
};

startServer();

export default server;
