import jwt from 'jsonwebtoken';
import userService from './user.service';
import type { User, AuthenticatedUser, JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authService = {
  generateToken(user: User): { token: string; expiresIn: string } {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      expiresIn: JWT_EXPIRES_IN,
    };
  },

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: AuthenticatedUser; token: string; expiresIn: string }> {
    const user = await userService.verifyPassword(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { token, expiresIn } = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
      },
      token,
      expiresIn,
    };
  },

  async getUserFromToken(token: string): Promise<AuthenticatedUser | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await userService.findById(payload.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
    };
  },
};

export default authService;
