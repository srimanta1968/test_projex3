import { pool } from '../config/database';
import { User, CreateUserInput, LoginInput, AuthResponse, toUserDTO } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ValidationError, AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   * @param input User registration data
   * @returns Auth response with user and token
   */
  async register(input: CreateUserInput): Promise<AuthResponse> {
    const { email, password, name } = input;

    // Validate input
    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, name, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, password_hash, name, created_at, updated_at`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

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

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user by email
    const result = await pool.query<User>(
      'SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user.id, user.email);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
      user: toUserDTO(user),
      token,
    };
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User DTO
   */
  async getUserById(userId: string): Promise<User> {
    const result = await pool.query<User>(
      'SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return result.rows[0];
  }
}

export const authService = new AuthService();
export default authService;
