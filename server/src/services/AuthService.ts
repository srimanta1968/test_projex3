import { query } from '../config/database';
import { User, CreateUserDTO, LoginDTO, UserResponseDTO, toUserResponse, AuthResponse } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  /**
   * Register a new user
   * @param data User registration data
   * @returns AuthResponse with user and token
   */
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await query<User>(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Insert new user
    const result = await query<User>(
      `INSERT INTO users (name, email, phone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.email, data.phone || null, hashedPassword]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email! });

    return {
      user: toUserResponse(user),
      token,
    };
  }

  /**
   * Login a user
   * @param data Login credentials
   * @returns AuthResponse with user and token
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const result = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    // Check password
    if (!user.password) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email! });

    return {
      user: toUserResponse(user),
      token,
    };
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns User response DTO
   */
  async getUserById(userId: string): Promise<UserResponseDTO> {
    const result = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return toUserResponse(result.rows[0]);
  }

  /**
   * Update user profile
   * @param userId User ID
   * @param data Update data
   * @returns Updated user
   */
  async updateUser(userId: string, data: Partial<{ name: string; phone: string }>): Promise<UserResponseDTO> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }

    if (updates.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query<User>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return toUserResponse(result.rows[0]);
  }
}

export const authService = new AuthService();
export default authService;
