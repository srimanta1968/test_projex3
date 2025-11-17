import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import {
  User,
  CreateUserInput,
  LoginInput,
  UserResponse,
  AuthResponse
} from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError
} from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthService {
  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      status: user.status,
      email_verified: user.email_verified,
      two_factor_enabled: user.two_factor_enabled,
      preferences: user.preferences,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async register(input: CreateUserInput): Promise<AuthResponse> {
    logger.info('Attempting user registration', { email: input.email });

    // Validate password strength
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUserQuery = `
      SELECT id FROM "user" WHERE email = $1 OR username = $2
    `;
    const existingUser = await pool.query(existingUserQuery, [input.email, input.username]);

    if (existingUser.rows.length > 0) {
      throw new ConflictError('User with this email or username already exists');
    }

    // Hash password
    const password_hash = await hashPassword(input.password);

    // Create user
    const userId = uuidv4();
    const insertQuery = `
      INSERT INTO "user" (
        id, email, username, first_name, last_name, phone, date_of_birth,
        password_hash, status, email_verified, two_factor_enabled,
        failed_login_attempts, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      userId,
      input.email.toLowerCase(),
      input.username,
      input.first_name,
      input.last_name,
      input.phone || null,
      input.date_of_birth || null,
      password_hash,
      'pending_verification',
      false,
      false,
      0,
    ]);

    const user = result.rows[0] as User;
    const token = generateToken({ userId: user.id, email: user.email });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  async login(input: LoginInput, ipAddress?: string): Promise<AuthResponse> {
    logger.info('Attempting user login', { email: input.email });

    // Find user by email
    const userQuery = `SELECT * FROM "user" WHERE email = $1`;
    const result = await pool.query(userQuery, [input.email.toLowerCase()]);

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0] as User;

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AuthenticationError('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isValidPassword = await comparePassword(input.password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      let lockedUntil = null;

      // Lock account after 5 failed attempts
      if (newFailedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        logger.warn('Account locked due to too many failed attempts', { userId: user.id });
      }

      await pool.query(
        `UPDATE "user" SET failed_login_attempts = $1, locked_until = $2, updated_at = NOW() WHERE id = $3`,
        [newFailedAttempts, lockedUntil, user.id]
      );

      throw new AuthenticationError('Invalid email or password');
    }

    // Reset failed login attempts and update last login
    const updateQuery = `
      UPDATE "user"
      SET failed_login_attempts = 0,
          locked_until = NULL,
          last_login_at = NOW(),
          last_login_ip = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const updatedResult = await pool.query(updateQuery, [user.id, ipAddress || null]);
    const updatedUser = updatedResult.rows[0] as User;

    const token = generateToken({ userId: updatedUser.id, email: updatedUser.email });

    logger.info('User logged in successfully', { userId: updatedUser.id });

    return {
      user: this.toUserResponse(updatedUser),
      token,
    };
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const query = `SELECT * FROM "user" WHERE id = $1`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return this.toUserResponse(result.rows[0] as User);
  }
}

export const authService = new AuthService();
