import { query } from '../config/database';
import {
  User,
  CreateUserDTO,
  LoginDTO,
  AuthResponse,
  toUserResponseDTO,
} from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Authentication service for user registration and login
 */
export class AuthService {
  /**
   * Register a new user
   * @param data User registration data
   * @returns Authentication response with user and token
   */
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        'WEAK_PASSWORD'
      );
    }

    // Check if email already exists
    const existingEmail = await query<User>(
      'SELECT id FROM "user" WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (existingEmail.length > 0) {
      throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
    }

    // Check if username already exists
    const existingUsername = await query<User>(
      'SELECT id FROM "user" WHERE username = $1',
      [data.username.toLowerCase()]
    );

    if (existingUsername.length > 0) {
      throw new ConflictError('Username already taken', 'USERNAME_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user
    const insertQuery = `
      INSERT INTO "user" (
        email,
        username,
        first_name,
        last_name,
        phone,
        date_of_birth,
        password_hash,
        status,
        email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.email.toLowerCase(),
      data.username.toLowerCase(),
      data.first_name.trim(),
      data.last_name.trim(),
      data.phone || null,
      data.date_of_birth || null,
      passwordHash,
      'pending_verification',
      false,
    ];

    const [newUser] = await query<User>(insertQuery, values);

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    logger.info(`User registered successfully: ${newUser.email}`);

    // Generate tokens
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const refreshToken = generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    return {
      user: toUserResponseDTO(newUser),
      token,
      refreshToken,
    };
  }

  /**
   * Authenticate user login
   * @param data Login credentials
   * @returns Authentication response with user and token
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const [user] = await query<User>(
      'SELECT * FROM "user" WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedError(
        'Account is temporarily locked. Please try again later.',
        'ACCOUNT_LOCKED'
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed login attempts
      await this.incrementFailedAttempts(user.id, user.failed_login_attempts);
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts and update last login
    await query(
      `UPDATE "user"
       SET failed_login_attempts = 0,
           last_login_at = NOW(),
           locked_until = NULL
       WHERE id = $1`,
      [user.id]
    );

    logger.info(`User logged in: ${user.email}`);

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user: toUserResponseDTO(user),
      token,
      refreshToken,
    };
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: string): Promise<User> {
    const [user] = await query<User>('SELECT * FROM "user" WHERE id = $1', [userId]);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Increment failed login attempts and lock account if necessary
   */
  private async incrementFailedAttempts(userId: string, currentAttempts: number): Promise<void> {
    const newAttempts = currentAttempts + 1;
    let lockedUntil: Date | null = null;

    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      logger.warn(`Account locked due to too many failed attempts: ${userId}`);
    }

    await query(
      `UPDATE "user"
       SET failed_login_attempts = $1,
           locked_until = $2
       WHERE id = $3`,
      [newAttempts, lockedUntil, userId]
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
