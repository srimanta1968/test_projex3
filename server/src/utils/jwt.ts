import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JWTPayload } from '../models/User';
import { AuthenticationError } from './errors';
import logger from './logger';

/**
 * Generate a JWT token for a user
 * @param payload User data to encode in token
 * @returns JWT token string
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'banking-portal',
    audience: 'banking-portal-users',
  });
};

/**
 * Generate a refresh token
 * @param userId User ID
 * @returns Refresh token string
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'banking-portal',
  });
};

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded payload
 * @throws AuthenticationError if token is invalid
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'banking-portal',
      audience: 'banking-portal-users',
    });

    if (typeof decoded === 'string') {
      throw new AuthenticationError('Invalid token format');
    }

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { expiredAt: error.expiredAt });
      throw new AuthenticationError('Token has expired');
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { error: error.message });
      throw new AuthenticationError('Invalid token');
    }

    throw error;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
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
 * Decode token without verification (for debugging)
 * @param token JWT token string
 * @returns Decoded payload or null
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token);
    return decoded as JWTPayload | null;
  } catch {
    return null;
  }
};
