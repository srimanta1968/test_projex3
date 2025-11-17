import { query } from '../config/database';
import {
  User,
  CreateUserDTO,
  LoginDTO,
  UserResponseDTO,
  AuthResponse,
  toUserResponseDTO,
} from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
  NotFoundError,
} from '../utils/errors';
import logger from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        passwordValidation.errors.map((msg) => ({ field: 'password', message: msg }))
      );
    }

    // Check if email already exists
    const existingEmail = await query('SELECT id FROM "user" WHERE email = $1', [data.email]);
    if (existingEmail.rows.length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await query('SELECT id FROM "user" WHERE username = $1', [
      data.username,
    ]);
    if (existingUsername.rows.length > 0) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user into database
    const result = await query<User>(
      `INSERT INTO "user" (
        email, username, first_name, last_name, password_hash, phone, date_of_birth
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        data.email,
        data.username,
        data.first_name,
        data.last_name,
        passwordHash,
        data.phone || null,
        data.date_of_birth || null,
      ]
    );

    const user = result.rows[0];
    logger.info('User registered', { userId: user.id, email: user.email });

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = generateRefreshToken(user.id);

    return {
      user: toUserResponseDTO(user),
      token,
      refreshToken,
    };
  }

  /**
   * Login a user
   */
  async login(data: LoginDTO, ipAddress?: string): Promise<AuthResponse> {
    // Find user by email
    const result = await query<User>('SELECT * FROM "user" WHERE email = $1', [data.email]);

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AuthenticationError('Account is temporarily locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      let lockUntil: Date | null = null;

      // Lock account after 5 failed attempts for 15 minutes
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        logger.warn('Account locked due to failed attempts', {
          userId: user.id,
          attempts: newFailedAttempts,
        });
      }

      await query(
        'UPDATE "user" SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
        [newFailedAttempts, lockUntil, user.id]
      );

      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is active
    if (user.status === 'suspended' || user.status === 'deactivated') {
      throw new AuthenticationError('Account is not active');
    }

    // Reset failed attempts and update last login
    await query(
      `UPDATE "user" SET
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login_at = NOW(),
        last_login_ip = $1
      WHERE id = $2`,
      [ipAddress || null, user.id]
    );

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Update user with new login info
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login_at = new Date();
    user.last_login_ip = ipAddress || null;

    return {
      user: toUserResponseDTO(user),
      token,
      refreshToken,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDTO> {
    const result = await query<User>('SELECT * FROM "user" WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return toUserResponseDTO(result.rows[0]);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: Partial<User>): Promise<UserResponseDTO> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCounter = 1;

    const allowedFields = [
      'first_name',
      'last_name',
      'phone',
      'date_of_birth',
      'preferences',
    ];

    for (const field of allowedFields) {
      if (data[field as keyof User] !== undefined) {
        updates.push(`${field} = $${paramCounter}`);
        values.push(data[field as keyof User]);
        paramCounter++;
      }
    }

    if (updates.length === 0) {
      return this.getUserById(userId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query<User>(
      `UPDATE "user" SET ${updates.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    logger.info('User updated', { userId });
    return toUserResponseDTO(result.rows[0]);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const result = await query<User>('SELECT * FROM "user" WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const user = result.rows[0];

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        passwordValidation.errors.map((msg) => ({ field: 'newPassword', message: msg }))
      );
    }

    // Hash and update password
    const newPasswordHash = await hashPassword(newPassword);
    await query('UPDATE "user" SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newPasswordHash,
      userId,
    ]);

    logger.info('Password changed', { userId });
  }
}

export const authService = new AuthService();
