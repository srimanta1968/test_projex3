import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dataService from '../config/database';
import emailService from '../config/email';
import type { User, RegisterUserRequest, AuthenticatedUser } from '../types';

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_EXPIRES_HOURS = 24;

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = $1';
    return dataService.queryOne<User>(sql, [email.toLowerCase()]);
  },

  async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = $1';
    return dataService.queryOne<User>(sql, [id]);
  },

  async findByVerificationToken(token: string): Promise<User | null> {
    const sql = `
      SELECT * FROM users
      WHERE email_verification_token = $1
      AND email_verification_expires > NOW()
    `;
    return dataService.queryOne<User>(sql, [token]);
  },

  async register(data: RegisterUserRequest): Promise<{ user: AuthenticatedUser; verificationToken: string }> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + VERIFICATION_TOKEN_EXPIRES_HOURS);

    const sql = `
      INSERT INTO users (
        id, name, email, phone, password_hash,
        email_verified, email_verification_token, email_verification_expires,
        phone_verified, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, name, email, phone, email_verified, phone_verified, created_at
    `;

    const rows = await dataService.query<AuthenticatedUser & { created_at: Date }>(sql, [
      uuidv4(),
      data.name,
      data.email.toLowerCase(),
      data.phone,
      passwordHash,
      false,
      verificationToken,
      verificationExpires,
      false,
    ]);

    const user = rows[0];

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        email_verified: false,
        phone_verified: false,
      },
      verificationToken,
    };
  },

  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.email_verified) {
      throw new Error('Email already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + VERIFICATION_TOKEN_EXPIRES_HOURS);

    const sql = `
      UPDATE users
      SET email_verification_token = $1,
          email_verification_expires = $2,
          updated_at = NOW()
      WHERE id = $3
    `;

    await dataService.execute(sql, [verificationToken, verificationExpires, user.id]);

    const emailSent = await emailService.sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await this.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    const sql = `
      UPDATE users
      SET email_verified = true,
          email_verification_token = NULL,
          email_verification_expires = NULL,
          updated_at = NOW()
      WHERE id = $1
    `;

    await dataService.execute(sql, [user.id]);
  },

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  },
};

export default userService;
