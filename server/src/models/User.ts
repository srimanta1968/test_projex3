/**
 * User model interfaces based on the banking-portal-schema
 * Maps to the "user" table in PostgreSQL
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

export type UserStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated'
  | 'locked';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  currency?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  dashboard?: {
    defaultView?: string;
    refreshInterval?: number;
  };
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  preferences?: UserPreferences;
}

export interface LoginDTO {
  email: string;
  password: string;
}

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
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: UserResponseDTO;
  token: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

// Transform database row to UserResponseDTO (excludes sensitive data)
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
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};
