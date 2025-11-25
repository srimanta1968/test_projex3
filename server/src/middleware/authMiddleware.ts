import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { JWTPayload } from '../models/User';

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - requires valid JWT token
 * Extracts token from Authorization header and validates it
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError(
        'No authentication token provided',
        'NO_TOKEN'
      );
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware - sets user if token is valid, but doesn't require it
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch {
    // Token invalid or expired, but that's okay for optional auth
    next();
  }
}

/**
 * Require specific user - validates that authenticated user matches param
 * Use after authenticate middleware
 */
export function requireSameUser(paramName: string = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required', 'NOT_AUTHENTICATED');
      }

      const paramId = req.params[paramName];

      if (req.user.userId !== paramId) {
        throw new UnauthorizedError(
          'You can only access your own resources',
          'FORBIDDEN_RESOURCE'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Type for authenticated request
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Export authenticate as authenticateToken for compatibility
export const authenticateToken = authenticate;

export default authenticate;
