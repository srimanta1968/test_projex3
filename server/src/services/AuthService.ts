import { query } from '../config/database';
import { User, CreateUserInput, LoginInput, AuthResponse, toUserDTO } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Authentication service for user management
 */
export class AuthService {
  /**
   * Register a new user
   * @param input User registration data
   * @returns Auth response with user and token
   */
  async register(input: CreateUserInput): Promise<AuthResponse> {
    const { email, password, name } = input;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.message);
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user into database
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email.toLowerCase().trim(), passwordHash, name.trim()]
    );

    const user = result.rows[0];
    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
      user: toUserDTO(user),
      token,
    };
  }

  /**
   * Authenticate user login
   * @param input Login credentials
   * @returns Auth response with user and token
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login timestamp
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    // Generate token
    const token = generateToken(user.id, user.email);

    // Fetch updated user
    const updatedUser = await this.findById(user.id);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return {
      user: toUserDTO(updatedUser),
      token,
    };
  }

  /**
   * Find user by ID
   * @param id User ID
   * @returns User or null
   */
  async findById(id: string): Promise<User | null> {
    const result = await query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   * @param email User email
   * @returns User or null
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  }

  /**
   * Get user profile by ID
   * @param id User ID
   * @returns User DTO
   */
  async getProfile(id: string): Promise<AuthResponse['user']> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toUserDTO(user);
  }

  /**
   * Update user password
   * @param userId User ID
   * @param currentPassword Current password
   * @param newPassword New password
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.message);
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);

    logger.info('User password updated', { userId });
  }
}

export const authService = new AuthService();
export default authService;
