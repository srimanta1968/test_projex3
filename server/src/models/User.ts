/**
 * User entity interface - matches database schema
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  password: string;
  preferences: string | null;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  reset_password_token: string | null;
  reset_password_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * User data for registration
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

/**
 * User data for login
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * User response (without sensitive data)
 */
export interface UserResponseDTO {
  id: string;
  name: string | null;
  email: string;
  preferences: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * User update data
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  preferences?: string;
}

/**
 * Authentication response with token
 */
export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Convert User to UserResponseDTO (strip sensitive data)
 */
export function toUserResponse(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    email_verified: user.email_verified ?? false,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
