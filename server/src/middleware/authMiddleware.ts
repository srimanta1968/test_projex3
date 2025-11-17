import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';
import { JWTPayload } from '../models/User';
import logger from '../utils/logger';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to request
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    const payload = verifyToken(token);

    // Attach user info to request
    req.user = payload;

    logger.debug('User authenticated', { userId: payload.userId });
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
      logger.debug('User optionally authenticated', { userId: payload.userId });
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional auth failed, continuing without user context');
    next();
  }
};

/**
 * Require specific user status
 */
export const requireActiveUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  // This would normally check user status in database
  // For now, we trust the token is valid
  next();
};

/**
 * Rate limiting helper for auth routes
 * Track login attempts by IP
 */
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export const checkLoginRateLimit = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const attempt = loginAttempts.get(ip);

  if (attempt) {
    if (now > attempt.resetTime) {
      // Reset window
      loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (attempt.count >= maxAttempts) {
      throw new AuthenticationError('Too many login attempts. Please try again later.');
    } else {
      attempt.count++;
    }
  } else {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
  }

  next();
};
