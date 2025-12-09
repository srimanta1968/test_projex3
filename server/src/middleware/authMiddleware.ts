import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware - protects routes requiring authentication
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('Authentication token required', 'NO_TOKEN');
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware - sets user if token is valid, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch {
    // Token is invalid but we don't require auth, so continue
    next();
  }
}

export default authMiddleware;
