/**
 * User entity interface representing database record
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
  email_verified: boolean;
}

/**
 * User data transfer object (without sensitive data)
 */
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  isActive: boolean;
  emailVerified: boolean;
}

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Input for user login
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Authentication response with user and token
 */
export interface AuthResponse {
  user: UserDTO;
  token: string;
}

/**
 * Transform database User to DTO
 * @param user Database user record
 * @returns User DTO without sensitive data
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
    lastLogin: user.last_login ? user.last_login.toISOString() : null,
    isActive: user.is_active,
    emailVerified: user.email_verified,
  };
}
