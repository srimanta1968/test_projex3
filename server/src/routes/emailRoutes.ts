import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { emailService } from '../services/EmailService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validation';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/email/verify
 * Verify email with token
 */
router.post(
  '/verify',
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid token format'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      const result = await emailService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: result.userId,
          email: result.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/email/resend-verification
 * Resend verification email (requires auth)
 */
router.post(
  '/resend-verification',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      const tokenData = await emailService.resendVerificationEmail(userId);

      // Send verification email
      // In production, get the email from the user record
      const userEmail = req.user?.email || '';
      await emailService.sendVerificationEmail(userEmail, tokenData.token);

      res.json({
        success: true,
        message: 'Verification email sent',
        data: {
          expires: tokenData.expires,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/email/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const tokenData = await emailService.createPasswordResetToken(email);

      if (tokenData) {
        await emailService.sendPasswordResetEmail(email, tokenData.token);
      }

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/email/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid token format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;

      // Hash new password
      const passwordHash = await hashPassword(password);

      await emailService.resetPassword(token, passwordHash);

      logger.info('Password reset completed');

      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/email/verification-status
 * Check if current user's email is verified (requires auth)
 */
router.get(
  '/verification-status',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }

      const isVerified = await emailService.isEmailVerified(userId);

      res.json({
        success: true,
        data: {
          email_verified: isVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
