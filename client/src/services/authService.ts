import api from './api';
import { User, AuthResponse, ApiResponse, LoginCredentials, RegisterData } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get user');
  },

  async updateProfile(data: Partial<{ name: string; phone: string }>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/me', data);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update profile');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  saveAuth(auth: AuthResponse): void {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
  },
};

export default authService;
