import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@/shared/errors/app.error';
import { ErrorResponse } from '@/shared/utils/response.util';
import { logger } from '@/shared/logger';
import { config } from '@/config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    const response = ErrorResponse(
      err.message,
      err.errorCode,
      err instanceof ValidationError ? err.errors : undefined
    );

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Objection.js errors
  if (err.name === 'ValidationError') {
    const response = ErrorResponse(
      'Validation failed',
      'VALIDATION_ERROR'
    );
    res.status(400).json(response);
    return;
  }

  if (err.name === 'NotFoundError') {
    const response = ErrorResponse('Resource not found', 'NOT_FOUND');
    res.status(404).json(response);
    return;
  }

  if (err.name === 'UniqueViolationError') {
    const response = ErrorResponse(
      'Resource already exists',
      'DUPLICATE_ENTRY'
    );
    res.status(409).json(response);
    return;
  }

  if (err.name === 'ForeignKeyViolationError') {
    const response = ErrorResponse(
      'Referenced resource not found',
      'FOREIGN_KEY_VIOLATION'
    );
    res.status(400).json(response);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response = ErrorResponse('Invalid token', 'INVALID_TOKEN');
    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response = ErrorResponse('Token expired', 'TOKEN_EXPIRED');
    res.status(401).json(response);
    return;
  }

  // Handle unknown errors
  const message = config.app.isProduction
    ? 'Internal server error'
    : err.message;

  const response = ErrorResponse(message, 'INTERNAL_ERROR');
  res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response = ErrorResponse(
    `Route ${req.method} ${req.path} not found`,
    'ROUTE_NOT_FOUND'
  );
  res.status(404).json(response);
}
