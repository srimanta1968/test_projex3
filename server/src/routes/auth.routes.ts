import { Router, Response } from 'express';
import authService from '../services/auth.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import userService from '../services/user.service';
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

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }

    const response: ApiResponse<AuthenticatedUser> = {
      success: true,
      data: req.user,
    };

    return res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Get current user error:', error);
    return res.status(500).json(response);
  }
});

router.post('/refresh', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }

    const user = await userService.findById(req.user.id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const { token, expiresIn } = authService.generateToken(user);

    const response: ApiResponse<{ token: string; expiresIn: string }> = {
      success: true,
      data: {
        token,
        expiresIn,
      },
      message: 'Token refreshed successfully',
    };

    return res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Token refresh error:', error);
    return res.status(500).json(response);
  }
});

export default router;
