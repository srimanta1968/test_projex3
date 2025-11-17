import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    errors?: Array<{ field: string; message: string }>;
    stack?: string;
  };
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Internal server error',
    },
  };

  let statusCode = 500;

  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    response.error.message = err.message;
    response.error.code = err.code;
    response.error.errors = err.errors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.error.message = err.message;
    response.error.code = err.code;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    response.error.message = 'Invalid token';
    response.error.code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    response.error.message = 'Token expired';
    response.error.code = 'TOKEN_EXPIRED';
  }

  if (env.isDevelopment) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
