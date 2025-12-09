/**
 * User Model - TypeScript interfaces matching the database schema
 * Table: users (from user-defined-schemas.sql)
 */

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert a User to UserResponseDTO (excludes password)
 */
export function toUserResponse(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export interface AuthResponse {
  user: UserResponseDTO;
  token: string;
}
