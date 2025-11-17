import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload } from '../models/User';
import { UnauthorizedError } from './errors';

/**
 * Generate JWT access token
 * @param payload Token payload
 * @returns Signed JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate JWT refresh token
 * @param payload Token payload
 * @returns Signed refresh token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify and decode JWT token
 * @param token JWT token to verify
 * @returns Decoded payload
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }
    throw new UnauthorizedError('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Decode token without verification (for debugging)
 * @param token JWT token
 * @returns Decoded payload or null
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Check if token is about to expire (within threshold)
 * @param token JWT token
 * @param thresholdSeconds Seconds before expiry to consider as "about to expire"
 * @returns true if token expires within threshold
 */
export const isTokenExpiringSoon = (
  token: string,
  thresholdSeconds: number = 300
): boolean => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;

    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    return expiresIn <= thresholdSeconds;
  } catch {
    return true;
  }
};
