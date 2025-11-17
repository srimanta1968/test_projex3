import api, { ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Registration failed');
  }

  const authData = response.data.data;

  // Store token and user data
  localStorage.setItem('token', authData.token);
  localStorage.setItem('user', JSON.stringify(authData.user));

  if (authData.refreshToken) {
    localStorage.setItem('refreshToken', authData.refreshToken);
  }

  return authData;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Login failed');
  }

  const authData = response.data.data;

  // Store token and user data
  localStorage.setItem('token', authData.token);
  localStorage.setItem('user', JSON.stringify(authData.user));

  if (authData.refreshToken) {
    localStorage.setItem('refreshToken', authData.refreshToken);
  }

  return authData;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API call failed:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Get current user from API
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to get user');
  }

  return response.data.data.user;
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  return !!(token && user);
};
