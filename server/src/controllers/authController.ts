import { Request, Response } from 'express';
import authService from '../services/authService';
import { validateRegistrationInput, sanitizeEmail } from '../utils/validation';

/**
 * AuthController handles authentication HTTP requests
 */
export const authController = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate inputs
      const validation = validateRegistrationInput({ email, password });
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        });
        return;
      }

      // Sanitize email
      const sanitizedEmail = sanitizeEmail(email);

      const result = await authService.register({
        email: sanitizedEmail,
        password
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  /**
   * Login an existing user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
        return;
      }

      // Sanitize email
      const sanitizedEmail = sanitizeEmail(email);

      const result = await authService.login({
        email: sanitizedEmail,
        password
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid email or password')) {
        res.status(401).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
};

export default authController;
