/**
 * User interface matching database schema
 */
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  status: string;
  password_hash: string;
  email_verified: boolean;
  email_verified_at?: Date;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  preferences?: any;
  last_login_at?: Date;
  last_login_ip?: string;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User DTO (without sensitive data)
 */
export interface UserDTO {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at?: Date;
  created_at: Date;
}

/**
 * User registration input
 */
export interface RegisterInput {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
  date_of_birth?: Date;
}

/**
 * User login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Convert User to UserDTO (remove sensitive fields)
 */
export function userToDTO(user: User): UserDTO {
  const {
    password_hash,
    two_factor_secret,
    failed_login_attempts,
    locked_until,
    last_login_ip,
    preferences,
    ...dto
  } = user;
  return dto;
}
