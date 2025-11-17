import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/AuthService';
import { validate } from '../middleware/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate([
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('first_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name is required'),
    body('last_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name is required'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Invalid phone number'),
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  })
);

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post(
  '/login',
  validate([
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client should remove token)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    // In a production system, you might want to blacklist the token
    // or remove it from a session store

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  })
);

export default router;
