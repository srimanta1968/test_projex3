import { randomBytes } from 'crypto';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { NotFoundError, BadRequestError } from '../utils/errors';

/**
 * Email verification token data
 */
interface VerificationTokenData {
  token: string;
  expires: Date;
}

/**
 * Email Service - handles email verification and password reset
 * Note: In production, integrate with a real email service (SendGrid, AWS SES, etc.)
 */
export class EmailService {
  private readonly tokenExpiryHours = 24;
  private readonly resetTokenExpiryHours = 1;

  /**
   * Generate a random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a verification token for a user
   */
  async createVerificationToken(userId: string): Promise<VerificationTokenData> {
    const token = this.generateToken();
    const expires = new Date(Date.now() + this.tokenExpiryHours * 60 * 60 * 1000);

    await query(
      `UPDATE users
       SET verification_token = $1,
           verification_token_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [token, expires, userId]
    );

    logger.info('Verification token created', { userId });

    return { token, expires };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ userId: string; email: string }> {
    const result = await query<{ id: string; email: string }>(
      `SELECT id, email FROM users
       WHERE verification_token = $1
       AND verification_token_expires > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    const user = result.rows[0];

    // Mark email as verified and clear token
    await query(
      `UPDATE users
       SET email_verified = TRUE,
           verification_token = NULL,
           verification_token_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    logger.info('Email verified successfully', { userId: user.id, email: user.email });

    return { userId: user.id, email: user.email };
  }

  /**
   * Create a password reset token
   */
  async createPasswordResetToken(email: string): Promise<VerificationTokenData | null> {
    // Check if user exists
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not for security
      logger.warn('Password reset requested for non-existent email', { email });
      return null;
    }

    const userId = userResult.rows[0].id;
    const token = this.generateToken();
    const expires = new Date(Date.now() + this.resetTokenExpiryHours * 60 * 60 * 1000);

    await query(
      `UPDATE users
       SET reset_password_token = $1,
           reset_password_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [token, expires, userId]
    );

    logger.info('Password reset token created', { userId, email });

    return { token, expires };
  }

  /**
   * Verify password reset token and return user ID
   */
  async verifyPasswordResetToken(token: string): Promise<string> {
    const result = await query<{ id: string }>(
      `SELECT id FROM users
       WHERE reset_password_token = $1
       AND reset_password_expires > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    return result.rows[0].id;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPasswordHash: string): Promise<void> {
    const userId = await this.verifyPasswordResetToken(token);

    await query(
      `UPDATE users
       SET password = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    logger.info('Password reset successfully', { userId });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<VerificationTokenData> {
    // Check if user exists and email is not already verified
    const result = await query<{ id: string; email_verified: boolean }>(
      'SELECT id, email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    if (result.rows[0].email_verified) {
      throw new BadRequestError('Email is already verified');
    }

    return this.createVerificationToken(userId);
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const result = await query<{ email_verified: boolean }>(
      'SELECT email_verified FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return result.rows[0].email_verified ?? false;
  }

  /**
   * Send verification email (mock implementation)
   * In production, integrate with email service like SendGrid, AWS SES, etc.
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    // In production, send actual email
    logger.info('Sending verification email', {
      email,
      verificationUrl,
      note: 'In production, integrate with email service',
    });

    // Mock: Log the verification URL (in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n========================================');
      console.log('VERIFICATION EMAIL (Development Mode)');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('========================================\n');
    }
  }

  /**
   * Send password reset email (mock implementation)
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    logger.info('Sending password reset email', {
      email,
      resetUrl,
      note: 'In production, integrate with email service',
    });

    // Mock: Log the reset URL (in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n========================================');
      console.log('PASSWORD RESET EMAIL (Development Mode)');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('========================================\n');
    }
  }
}

export const emailService = new EmailService();
export default emailService;
