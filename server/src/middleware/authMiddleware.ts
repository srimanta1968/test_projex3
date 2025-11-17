import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { authService } from '../services/AuthService';
import { UserResponseDTO, toUserResponseDTO } from '../models/User';
import { asyncHandler } from './errorHandler';

/**
 * Extended Request interface with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: UserResponseDTO;
  userId?: string;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    // Extract token from header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided', 'NO_TOKEN');
    }

    // Verify token
    const payload = verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(payload.userId);

    // Check if user is active
    if (user.status === 'suspended' || user.status === 'deactivated') {
      throw new UnauthorizedError('Account is not active', 'ACCOUNT_INACTIVE');
    }

    // Attach user to request
    req.user = toUserResponseDTO(user);
    req.userId = user.id;

    next();
  }
);

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if not present
 */
export const optionalAuthenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next();
    }

    try {
      const payload = verifyToken(token);
      const user = await authService.getUserById(payload.userId);

      if (user.status === 'active' || user.status === 'pending_verification') {
        req.user = toUserResponseDTO(user);
        req.userId = user.id;
      }
    } catch {
      // Silently fail for optional auth
    }

    next();
  }
);

/**
 * Require specific user status
 */
export const requireStatus = (statuses: string[]) => {
  return asyncHandler(
    async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required', 'AUTH_REQUIRED');
      }

      if (!statuses.includes(req.user.status)) {
        throw new UnauthorizedError(
          `User status must be one of: ${statuses.join(', ')}`,
          'INVALID_STATUS'
        );
      }

      next();
    }
  );
};

/**
 * Require email verification
 */
export const requireEmailVerified = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required', 'AUTH_REQUIRED');
    }

    if (!req.user.email_verified) {
      throw new UnauthorizedError('Email verification required', 'EMAIL_NOT_VERIFIED');
    }

    next();
  }
);
