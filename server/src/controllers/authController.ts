import { Request, Response } from 'express';
import { authService, RegisterData, LoginData } from '../services/authService';

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const data: RegisterData = req.body;

      // Basic validation
      if (!data.email || !data.password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.register(data);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.status(201).json({
        success: true,
        data: result.user
      });
    } catch (error) {
      console.error('Register controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response) {
    try {
      const data: LoginData = req.body;

      // Basic validation
      if (!data.email || !data.password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.login(data);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// Singleton instance
export const authController = new AuthController();
