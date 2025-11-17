import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(config.node_env === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle PostgreSQL errors
  if ((err as any).code) {
    const pgError = err as any;

    if (pgError.code === '23505') {
      res.status(409).json({
        status: 'error',
        message: 'Resource already exists',
      });
      return;
    }

    if (pgError.code === '23503') {
      res.status(400).json({
        status: 'error',
        message: 'Invalid reference',
      });
      return;
    }
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: config.node_env === 'production'
      ? 'Internal server error'
      : err.message,
    ...(config.node_env === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
}
