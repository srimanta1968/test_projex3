import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import type { ApiResponse, AuthenticatedUser } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    const token = parts[1];
    const user = await authService.getUserFromToken(token);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Authentication required',
    };
    res.status(401).json(response);
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const user = await authService.getUserFromToken(token);
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch {
    next();
  }
};

export default authMiddleware;
