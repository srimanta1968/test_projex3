import api, { ApiResponse, AuthResponse, RegisterData, LoginData, User } from './api';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    if (response.data.success && response.data.data) {
      const { token, user, refreshToken } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Registration failed');
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    if (response.data.success && response.data.data) {
      const { token, user, refreshToken } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Login failed');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    if (response.data.success && response.data.data) {
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error('Failed to get user data');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/api/auth/profile', data);
    if (response.data.success && response.data.data) {
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error('Failed to update profile');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.post<ApiResponse<null>>('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to change password');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    }
  },

  getStoredUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
