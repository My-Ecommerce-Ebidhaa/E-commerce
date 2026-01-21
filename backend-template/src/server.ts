import 'reflect-metadata';
import { config } from '@/config';
import { logger } from '@/shared/logger';
import { initializeDatabase, closeDatabase } from '@/database';
import { registerDependencies } from '@/bootstrap';
import { createApp } from '@/app';

async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    await initializeDatabase();
    logger.info('Database initialized');

    // Register DI dependencies
    registerDependencies();
    logger.info('Dependencies registered');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.app.port, () => {
      logger.info(`Server running on port ${config.app.port}`);
      logger.info(`Environment: ${config.app.env}`);
      logger.info(`API endpoint: http://localhost:${config.app.port}/api/${config.app.apiVersion}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await closeDatabase();
        logger.info('Database connection closed');

        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
