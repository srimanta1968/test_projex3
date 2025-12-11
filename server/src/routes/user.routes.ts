import { Router, Request, Response } from 'express';
import userService from '../services/user.service';
import emailService from '../config/email';
import type {
  ApiResponse,
  RegisterUserRequest,
  SendVerificationEmailRequest,
  VerifyEmailRequest,
  SendPhoneVerificationRequest,
  VerifyPhoneRequest,
  AuthenticatedUser,
} from '../types';

const router = Router();

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body as RegisterUserRequest;
    const errors: Record<string, string> = {};

    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email || !validateEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!phone || !validatePhone(phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      const response: ApiResponse = {
        success: false,
        error: { fields: errors },
      };
      return res.status(400).json(response);
    }

    const { user, verificationToken } = await userService.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/[\s-]/g, ''),
      password,
    });

    await emailService.sendVerificationEmail(user.email, verificationToken);

    const response: ApiResponse<Omit<AuthenticatedUser, 'email_verified' | 'phone_verified'> & { created_at: string }> = {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: new Date().toISOString(),
      },
      message: 'User registered successfully',
    };

    return res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';

    if (message === 'Email already registered') {
      const response: ApiResponse = {
        success: false,
        error: 'Email already registered',
      };
      return res.status(409).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Registration error:', error);
    return res.status(500).json(response);
  }
});

router.post('/send-verification-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as SendVerificationEmailRequest;

    if (!email || !validateEmail(email)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email format',
      };
      return res.status(400).json(response);
    }

    await userService.sendVerificationEmail(email.trim().toLowerCase());

    const response: ApiResponse = {
      success: true,
      message: 'Verification email sent successfully',
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send verification email';

    if (message === 'User not found') {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    if (message === 'Email already verified') {
      const response: ApiResponse = {
        success: false,
        error: 'Email already verified',
      };
      return res.status(409).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Send verification email error:', error);
    return res.status(500).json(response);
  }
});

router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body as VerifyEmailRequest;

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Verification token is required',
      };
      return res.status(400).json(response);
    }

    await userService.verifyEmail(token);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email verification failed';

    if (message === 'Invalid or expired verification token') {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired verification token',
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Email verification error:', error);
    return res.status(500).json(response);
  }
});

router.post('/send-phone-verification', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body as SendPhoneVerificationRequest;

    if (!phone || !validatePhone(phone)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid phone number format',
      };
      return res.status(400).json(response);
    }

    await userService.sendPhoneVerification(phone);

    const response: ApiResponse = {
      success: true,
      message: 'Verification code sent successfully',
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send verification code';

    if (message === 'User not found') {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    if (message === 'Phone already verified') {
      const response: ApiResponse = {
        success: false,
        error: 'Phone already verified',
      };
      return res.status(409).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Send phone verification error:', error);
    return res.status(500).json(response);
  }
});

router.post('/verify-phone', async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body as VerifyPhoneRequest;

    if (!phone || !validatePhone(phone)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid phone number format',
      };
      return res.status(400).json(response);
    }

    if (!code || !/^[0-9]{6}$/.test(code)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid verification code format',
      };
      return res.status(400).json(response);
    }

    await userService.verifyPhone(phone, code);

    const response: ApiResponse = {
      success: true,
      message: 'Phone verified successfully',
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Phone verification failed';

    if (message === 'Invalid or expired verification code') {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired verification code',
      };
      return res.status(400).json(response);
    }

    if (message === 'User not found') {
      const response: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
    };
    console.error('Phone verification error:', error);
    return res.status(500).json(response);
  }
});

export default router;
