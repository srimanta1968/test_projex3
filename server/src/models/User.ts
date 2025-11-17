/**
 * User entity interface matching database schema
 */
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: Date | null;
  status: UserStatus;
  password_hash: string;
  email_verified: boolean;
  email_verified_at: Date | null;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  preferences: UserPreferences | null;
  last_login_at: Date | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * User status types
 */
export type UserStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated';

/**
 * User preferences structure
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  currency?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  [key: string]: unknown;
}

/**
 * DTO for user registration
 */
export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

/**
 * DTO for user login
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * User response without sensitive data
 */
export interface UserResponseDTO {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: Date | null;
  status: UserStatus;
  email_verified: boolean;
  two_factor_enabled: boolean;
  preferences: UserPreferences | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: UserResponseDTO;
  token: string;
  refreshToken?: string;
}

/**
 * Convert User to UserResponseDTO (remove sensitive fields)
 */
export const toUserResponseDTO = (user: User): UserResponseDTO => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    date_of_birth: user.date_of_birth,
    status: user.status,
    email_verified: user.email_verified,
    two_factor_enabled: user.two_factor_enabled,
    preferences: user.preferences,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}
