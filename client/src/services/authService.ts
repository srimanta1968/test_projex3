import { api } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  preferences?: Record<string, any>;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterInput {
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

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/register', input);
    return response.data.data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/login', input);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ status: string; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },
};
