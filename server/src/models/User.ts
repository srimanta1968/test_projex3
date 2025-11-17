export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  status: 'pending_verification' | 'active' | 'suspended' | 'deactivated';
  password_hash: string;
  email_verified: boolean;
  email_verified_at?: Date;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  preferences?: Record<string, any>;
  last_login_at?: Date;
  last_login_ip?: string;
  failed_login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
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
  preferences?: Record<string, any>;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
