import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dataService } from './dataService';
import { config } from '../config/env';

export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterData {
  email: string;
  username?: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existing = await dataService.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [data.email, data.username]
      );

      if (existing.rows.length > 0) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, config.bcryptRounds);

      // Create user
      const result = await dataService.query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, username, first_name, last_name, role, is_active, email_verified, created_at, updated_at`,
        [data.email, data.username, passwordHash, data.first_name, data.last_name]
      );

      const user = result.rows[0];

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      // Find user
      const result = await dataService.query(
        'SELECT * FROM users WHERE email = $1',
        [data.email]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }

      const user = result.rows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if user is active
      if (!user.is_active) {
        return { success: false, error: 'Account is disabled' };
      }

      // Update last login
      await dataService.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.secret as jwt.Secret,
        { expiresIn: config.jwt.expiresIn as any }
      ) as string;

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return { success: true, user: userWithoutPassword, token };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      const result = await dataService.query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const { password_hash, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance
export const authService = new AuthService();
