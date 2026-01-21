import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from '@/shared/logger';
import { errorHandler, notFoundHandler } from './error-handler.middleware';

export function initializeMiddlewares(app: Express): void {
  // Security middlewares
  app.use(helmet());
  app.use(cors());

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  });
}

export function initializeErrorHandlers(app: Express): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

export * from './error-handler.middleware';
export * from './tenant.middleware';
export * from './auth.middleware';
export * from './validate.middleware';
export * from './idempotency.middleware';
