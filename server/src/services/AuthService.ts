import { pool } from '../config/database';
import { User, UserDTO, CreateUserDTO, LoginDTO, AuthResponse, toUserDTO } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   * @param data - User registration data
   * @returns Auth response with user and token
   */
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.message);
    }

    // Check if email already exists
    const existingEmail = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      [data.email]
    );
    if (existingEmail.rows.length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await pool.query(
      'SELECT id FROM "user" WHERE username = $1',
      [data.username]
    );
    if (existingUsername.rows.length > 0) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user
    const result = await pool.query<User>(
      `INSERT INTO "user" (
        email, username, first_name, last_name, password_hash, phone, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [data.email, data.username, data.first_name, data.last_name, passwordHash, data.phone || null, 'active']
    );

    const user = result.rows[0];
    logger.info(`New user registered: ${user.email}`);

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
      user: toUserDTO(user),
      token,
    };
  }

  /**
   * Authenticate a user
   * @param data - Login credentials
   * @returns Auth response with user and token
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const result = await pool.query<User>(
      'SELECT * FROM "user" WHERE email = $1',
      [data.email]
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
    const isValidPassword = await comparePassword(data.password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed login attempts
      await pool.query(
        `UPDATE "user"
         SET failed_login_attempts = failed_login_attempts + 1,
             locked_until = CASE
               WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
               ELSE locked_until
             END,
             updated_at = NOW()
         WHERE id = $1`,
        [user.id]
      );
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed attempts and update last login
    await pool.query(
      `UPDATE "user"
       SET failed_login_attempts = 0,
           locked_until = NULL,
           last_login_at = NOW(),
           last_login_ip = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id, null] // IP address would come from request
    );

    logger.info(`User logged in: ${user.email}`);

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
      user: toUserDTO(user),
      token,
    };
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User DTO
   */
  async getUserById(userId: string): Promise<UserDTO> {
    const result = await pool.query<User>(
      'SELECT * FROM "user" WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return toUserDTO(result.rows[0]);
  }
}

export const authService = new AuthService();
