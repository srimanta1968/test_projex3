import { query, getClient } from '../config/database';
import { User, UserDTO, RegisterInput, LoginInput, userToDTO } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Authentication service handling user registration and login
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await query<User>(
        'SELECT id FROM "user" WHERE email = $1 OR username = $2',
        [input.email, input.username]
      );

      if (existingUser.rows.length > 0) {
        throw new BadRequestError('User with this email or username already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Insert user
      const result = await query<User>(
        `INSERT INTO "user"
        (email, username, first_name, last_name, phone, date_of_birth, password_hash, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING *`,
        [
          input.email,
          input.username,
          input.first_name,
          input.last_name,
          input.phone || null,
          input.date_of_birth || null,
          passwordHash,
        ]
      );

      const user = result.rows[0];

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: userToDTO(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error', { error });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(input: LoginInput, ipAddress?: string): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
    try {
      // Find user
      const result = await query<User>(
        'SELECT * FROM "user" WHERE email = $1',
        [input.email]
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const user = result.rows[0];

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new UnauthorizedError('Account is temporarily locked. Please try again later.');
      }

      // Verify password
      const isPasswordValid = await comparePassword(input.password, user.password_hash);

      if (!isPasswordValid) {
        // Increment failed attempts
        await query(
          'UPDATE "user" SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
          [user.id]
        );

        throw new UnauthorizedError('Invalid email or password');
      }

      // Reset failed attempts and update last login
      await query(
        `UPDATE "user"
        SET failed_login_attempts = 0,
            last_login_at = NOW(),
            last_login_ip = $1
        WHERE id = $2`,
        [ipAddress || null, user.id]
      );

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: userToDTO({ ...user, failed_login_attempts: 0 }),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error', { error });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserDTO | null> {
    try {
      const result = await query<User>(
        'SELECT * FROM "user" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return userToDTO(result.rows[0]);
    } catch (error) {
      logger.error('Get user error', { error, userId });
      throw error;
    }
  }
}
