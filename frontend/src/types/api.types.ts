// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  error?: string;
  details?: ValidationError[];
  statusCode?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface SearchParams {
  search?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// User Types
export interface User {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  // Additional profile fields
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

// Generic ID parameter
export interface IdParam {
  id: string | number;
}


