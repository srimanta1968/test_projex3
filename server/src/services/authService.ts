import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import dataService from './dataService';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
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

  /**
   * Login an existing user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const { email, password } = input;

      // Find user by email
      const user = await dataService.queryOne<User>(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
