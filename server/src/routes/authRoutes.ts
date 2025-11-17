import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/AuthService';
import { authenticate, checkLoginRateLimit } from '../middleware/authMiddleware';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters, alphanumeric and underscores only'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('first_name')
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('First name is required'),
    body('last_name')
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('Last name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('date_of_birth').optional().isISO8601().toDate().withMessage('Invalid date format'),
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    logger.info('User registered successfully', { userId: result.user.id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post(
  '/login',
  checkLoginRateLimit,
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.login(req.body, ipAddress);

    logger.info('User logged in successfully', { userId: result.user.id });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getUserById(req.user!.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate([
    body('first_name').optional().isLength({ min: 1, max: 50 }).trim(),
    body('last_name').optional().isLength({ min: 1, max: 50 }).trim(),
    body('phone').optional().isMobilePhone('any'),
    body('date_of_birth').optional().isISO8601().toDate(),
    body('preferences').optional().isObject(),
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateUser(req.user!.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  })
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(
      req.user!.userId,
      req.body.currentPassword,
      req.body.newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token on client side)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    // In a production app, you might want to:
    // 1. Add token to a blacklist
    // 2. Delete refresh token from database
    // 3. Clear session data

    logger.info('User logged out', { userId: req.user!.userId });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

export default router;
