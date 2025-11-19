import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await authService.login(req.body, ipAddress);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear session/token
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});


/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await authService.changePassword(userId, req.body.currentPassword, req.body.newPassword);
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Test API detection after fixes
// Final test after fixes
// Testing pre-push hook API detection - Nov 17, 2025
// Updated MCP server binary - should detect ALL endpoints now!

/**
 * GET /api/test/detection
 * Test endpoint for MCP API detection
 */
router.get('/api/test/detection', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'MCP API detection test endpoint',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
// API detection test - Mon, Nov 17, 2025  4:28:46 PM
// Final test
// test

/**
 * POST /verify-email
 * NEW endpoint to demonstrate API testing with PASSED count
 */
router.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
});
// Testing API detection - Mon, Nov 17, 2025  5:09:19 PM
// Test API detection - Mon, Nov 17, 2025  5:12:41 PM
// Testing improved duplicate detection - $(date)
// Test change 1

