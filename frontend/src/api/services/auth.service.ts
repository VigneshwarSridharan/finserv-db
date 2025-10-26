import { api } from '../client';
import type { AuthResponse, LoginRequest, RegisterRequest, ApiResponse } from '../../types/api.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;


