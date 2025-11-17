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
  preferences?: Record<string, unknown>;
  last_login_at?: Date;
  last_login_ip?: string;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    status: user.status,
    email_verified: user.email_verified,
    two_factor_enabled: user.two_factor_enabled,
    created_at: user.created_at,
  };
}
