import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Hash a plain text password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcryptRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hash Hashed password
 * @returns true if passwords match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
