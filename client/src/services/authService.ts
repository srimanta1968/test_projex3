import api, { setToken, removeToken } from './api';
import {
  User,
  AuthResponse,
  ApiResponse,
  LoginCredentials,
  RegisterData,
} from '../types';

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

  if (response.data.success && response.data.data) {
    setToken(response.data.data.token);
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Registration failed');
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);

  if (response.data.success && response.data.data) {
    setToken(response.data.data.token);
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Login failed');
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/auth/me');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get user');
}

/**
 * Update user profile
 */
export async function updateProfile(data: { name?: string; preferences?: string }): Promise<User> {
  const response = await api.put<ApiResponse<User>>('/auth/profile', data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to update profile');
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await api.put<ApiResponse<void>>('/auth/password', {
    currentPassword,
    newPassword,
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to change password');
  }
}

/**
 * Logout user
 */
export function logout(): void {
  removeToken();
}

export default {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
};
