import { query } from '../config/database';
import {
  User,
  CreateUserDTO,
  LoginDTO,
  UserResponseDTO,
  AuthResponseDTO,
  toUserResponse,
} from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Authentication service - handles user registration, login, and profile management
 */
export class AuthService {
  /**
   * Register a new user
   * @param data - User registration data
   * @returns Auth response with user and token
   */
  async register(data: CreateUserDTO): Promise<AuthResponseDTO> {
    // Check if email already exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Insert user into database
    const result = await query<User>(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.email.toLowerCase(), hashedPassword]
    );

    const user = result.rows[0];

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: toUserResponse(user),
      token,
    };
  }

  /**
   * Login user with email and password
   * @param data - Login credentials
   * @returns Auth response with user and token
   */
  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    // Find user by email
    const user = await this.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: toUserResponse(user),
      token,
    };
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User response DTO
   */
  async getUserById(id: string): Promise<UserResponseDTO> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return toUserResponse(result.rows[0]);
  }

  /**
   * Find user by email (internal use)
   * @param email - User email
   * @returns User or null
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update user profile
   * @param id - User ID
   * @param data - Update data
   * @returns Updated user response
   */
  async updateProfile(
    id: string,
    data: { name?: string; preferences?: string }
  ): Promise<UserResponseDTO> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.preferences !== undefined) {
      updates.push(`preferences = $${paramIndex++}`);
      values.push(data.preferences);
    }

    if (updates.length === 0) {
      throw new BadRequestError('No update data provided', 'NO_UPDATE_DATA');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query<User>(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    logger.info('User profile updated', { userId: id });

    return toUserResponse(result.rows[0]);
  }

  /**
   * Change user password
   * @param id - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect', 'INVALID_PASSWORD');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await query(
      `UPDATE users
       SET password = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hashedPassword, id]
    );

    logger.info('User password changed', { userId: id });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
