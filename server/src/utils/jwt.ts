import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT token for user
 * @param userId User ID
 * @param email User email
 * @returns JWT token string
 */
export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
