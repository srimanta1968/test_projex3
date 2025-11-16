import api from './api';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: UserDTO }> {
    const response = await api.get<{ user: UserDTO }>('/auth/me');
    return response.data;
  },
};

export default authService;
