import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token
 * @param payload Token payload containing userId and email
 * @returns Signed JWT token
 */
export function generateToken(payload: { userId: string; email: string }): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as any);
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @returns Decoded token payload
 * @throws UnauthorizedError if token is invalid
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as TokenPayload;
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
}

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
