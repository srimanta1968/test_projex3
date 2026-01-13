import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import dataService from './dataService';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

/**
 * AuthService handles user authentication operations
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      const { email, password } = input;

      // Check if user already exists
      const existingUser = await dataService.queryOne<User>(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

      // Create user
      const newUser = await dataService.queryOne<User>(
        `INSERT INTO users (email, password_hash, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, email, created_at, updated_at`,
        [email, passwordHash]
      );

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
