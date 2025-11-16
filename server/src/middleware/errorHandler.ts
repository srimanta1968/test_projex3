import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ErrorResponse {
  status: 'error';
  message: string;
  stack?: string;
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      message: err.message,
    };

    if (env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown error
  const response: ErrorResponse = {
    status: 'error',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };

  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}

export default errorHandler;
