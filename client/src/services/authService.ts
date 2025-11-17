import api, { ApiResponse } from './api';

/**
 * User interface from API
 */
export interface User {
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
 * Authentication response
 */
export interface AuthData {
  user: User;
  token: string;
}

/**
 * Register request data
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Login request data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthData> {
  const response = await api.post<ApiResponse<AuthData>>('/auth/register', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Registration failed');
  }
  return response.data.data;
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthData> {
  const response = await api.post<ApiResponse<AuthData>>('/auth/login', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Login failed');
  }
  return response.data.data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Failed to get user profile');
  }
  return response.data.data.user;
}

/**
 * Update user password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const response = await api.put<ApiResponse<null>>('/auth/password', {
    currentPassword,
    newPassword,
  });
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update password');
  }
}
