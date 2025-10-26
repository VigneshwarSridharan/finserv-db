import { api } from '../client';
import type { ApiResponse, UserProfile, UpdateProfileRequest, UpdatePasswordRequest } from '../../types/api.types';

export const userService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return api.get<UserProfile>('/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    return api.put<UserProfile>('/profile', data);
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<ApiResponse<void>> => {
    return api.put<void>('/profile/password', data);
  },

  getPreferences: async (): Promise<ApiResponse<any>> => {
    return api.get<any>('/profile/preferences');
  },

  updatePreferences: async (data: any): Promise<ApiResponse<any>> => {
    return api.put<any>('/profile/preferences', data);
  },
};

export default userService;


