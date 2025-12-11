import { Router, Request, Response } from 'express';
import authService from '../services/auth.service';
import type { ApiResponse, LoginRequest, AuthenticatedUser } from '../types';

const router = Router();

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      const response: ApiResponse = {
        success: false,
        error: { fields: errors },
      };
      return res.status(400).json(response);
    }

    const { user, token, expiresIn } = await authService.login(
      email.trim().toLowerCase(),
      password
    );

    const response: ApiResponse<{ user: AuthenticatedUser; token: string; expiresIn: string }> = {
      success: true,
      data: {
        user,
        token,
        expiresIn,
      },
      message: 'Login successful',
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';

    if (message === 'Invalid email or password') {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password',
      };
      return res.status(401).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Login error:', error);
    return res.status(500).json(response);
  }
});

export default router;
