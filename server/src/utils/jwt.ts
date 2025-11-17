import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthenticationError } from './errors';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Token verification failed');
  }
}

export function extractTokenFromHeader(authHeader?: string): string {
  if (!authHeader) {
    throw new AuthenticationError('No authorization header provided');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Invalid authorization header format');
  }

  const token = authHeader.substring(7);
  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  return token;
}
