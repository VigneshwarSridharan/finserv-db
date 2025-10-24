import { Request } from 'express';

// User types
export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateDTO {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

// Portfolio Summary types
export interface PortfolioSummary {
  summary_id: number;
  user_id: number;
  asset_type: AssetType;
  total_investment: string;
  current_value: string;
  unrealized_pnl: string;
  realized_pnl: string;
  total_pnl: string;
  percentage_of_portfolio: string;
  last_updated: Date;
}

export type AssetType = 
  | 'securities' 
  | 'fixed_deposits' 
  | 'recurring_deposits' 
  | 'gold' 
  | 'real_estate' 
  | 'other_assets';

export interface PortfolioCreateDTO {
  asset_type: AssetType;
  total_investment: number;
  current_value: number;
  unrealized_pnl?: number;
  realized_pnl?: number;
  total_pnl?: number;
  percentage_of_portfolio?: number;
}

export interface PortfolioUpdateDTO {
  asset_type?: AssetType;
  total_investment?: number;
  current_value?: number;
  unrealized_pnl?: number;
  realized_pnl?: number;
  total_pnl?: number;
  percentage_of_portfolio?: number;
}

// JWT types
export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

// Express Request with user
export interface AuthRequest extends Request {
  user?: JWTPayload;
  body: any;
  params: any;
  query: any;
  headers: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  token: string;
}

