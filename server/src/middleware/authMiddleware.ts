import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, JWTPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { authService } from '../services/AuthService';
import { asyncHandler } from './errorHandler';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const payload: JWTPayload = verifyToken(token);

    // Verify user still exists and is active
    const user = await authService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  }
);

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't reject if missing
 */
export const optionalAuthenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      try {
        const payload: JWTPayload = verifyToken(token);
        const user = await authService.findById(payload.userId);

        if (user && user.is_active) {
          req.user = {
            id: payload.userId,
            email: payload.email,
          };
        }
      } catch {
        // Token invalid, but that's okay for optional auth
      }
    }

    next();
  }
);
