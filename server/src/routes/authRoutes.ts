import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/AuthService';
import { validateBody } from '../middleware/validation';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { toUserDTO } from '../models/User';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }
      const user = await authService.getUserById(req.user.id);
      res.status(200).json({ user: toUserDTO(user) });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
