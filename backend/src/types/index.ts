import { Request } from 'express';

// ==================== User Types ====================
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

export interface UserProfileDTO {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  pan_number?: string;
  aadhar_number?: string;
  occupation?: string;
  annual_income?: number;
  risk_profile?: 'conservative' | 'moderate' | 'aggressive';
}

export interface UserPreferencesDTO {
  currency?: string;
  timezone?: string;
  notification_email?: boolean;
  notification_sms?: boolean;
  notification_push?: boolean;
  portfolio_view?: 'consolidated' | 'broker_wise' | 'asset_wise';
}

// ==================== Portfolio Summary Types ====================
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

// ==================== Broker & Securities Types ====================
export interface BrokerCreateDTO {
  broker_name: string;
  broker_code: string;
  broker_type: 'full_service' | 'discount' | 'online' | 'bank';
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface BrokerUpdateDTO {
  broker_name?: string;
  broker_type?: 'full_service' | 'discount' | 'online' | 'bank';
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
}

export interface SecurityCreateDTO {
  symbol: string;
  name: string;
  security_type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'commodity' | 'currency';
  exchange: string;
  sector?: string;
  industry?: string;
  market_cap_category?: 'large_cap' | 'mid_cap' | 'small_cap' | 'micro_cap';
  isin?: string;
  face_value?: number;
  lot_size?: number;
}

export interface SecurityUpdateDTO {
  name?: string;
  security_type?: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'commodity' | 'currency';
  sector?: string;
  industry?: string;
  market_cap_category?: 'large_cap' | 'mid_cap' | 'small_cap' | 'micro_cap';
  face_value?: number;
  lot_size?: number;
  is_active?: boolean;
}

export interface SecurityPriceCreateDTO {
  price_date: string;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price: number;
  volume?: number;
  adjusted_close?: number;
}

export interface UserBrokerAccountCreateDTO {
  broker_id: number;
  account_number: string;
  account_type: 'equity' | 'commodity' | 'currency' | 'derivatives' | 'mutual_fund';
  account_name?: string;
  opened_date?: string;
}

export interface UserBrokerAccountUpdateDTO {
  account_name?: string;
  is_active?: boolean;
}

export interface SecurityTransactionCreateDTO {
  account_id: number;
  security_id: number;
  transaction_type: 'buy' | 'sell' | 'bonus' | 'split' | 'dividend';
  transaction_date: string;
  quantity: number;
  price: number;
  total_amount: number;
  brokerage?: number;
  taxes?: number;
  other_charges?: number;
  net_amount: number;
  notes?: string;
}

export interface SecurityTransactionUpdateDTO {
  transaction_type?: 'buy' | 'sell' | 'bonus' | 'split' | 'dividend';
  transaction_date?: string;
  quantity?: number;
  price?: number;
  total_amount?: number;
  brokerage?: number;
  taxes?: number;
  other_charges?: number;
  net_amount?: number;
  notes?: string;
}

// ==================== Bank & Deposits Types ====================
export interface BankCreateDTO {
  bank_name: string;
  bank_code: string;
  bank_type: 'public' | 'private' | 'foreign' | 'cooperative' | 'small_finance' | 'payment';
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface BankUpdateDTO {
  bank_name?: string;
  bank_type?: 'public' | 'private' | 'foreign' | 'cooperative' | 'small_finance' | 'payment';
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

export interface UserBankAccountCreateDTO {
  bank_id: number;
  account_number: string;
  account_type: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'nro' | 'nre';
  account_name?: string;
  ifsc_code?: string;
  branch_name?: string;
  opened_date?: string;
}

export interface UserBankAccountUpdateDTO {
  account_name?: string;
  ifsc_code?: string;
  branch_name?: string;
  is_active?: boolean;
}

export interface FixedDepositCreateDTO {
  account_id: number;
  fd_number: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  maturity_amount?: number;
  start_date: string;
  maturity_date: string;
  interest_payout_frequency?: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'maturity';
  auto_renewal?: boolean;
  premature_withdrawal_allowed?: boolean;
  premature_penalty_rate?: number;
}

export interface FixedDepositUpdateDTO {
  maturity_amount?: number;
  auto_renewal?: boolean;
  is_active?: boolean;
}

export interface RecurringDepositCreateDTO {
  account_id: number;
  rd_number: string;
  monthly_installment: number;
  interest_rate: number;
  tenure_months: number;
  maturity_amount?: number;
  start_date: string;
  maturity_date: string;
  installment_day: number;
  auto_debit?: boolean;
  premature_closure_allowed?: boolean;
  premature_penalty_rate?: number;
}

export interface RecurringDepositUpdateDTO {
  maturity_amount?: number;
  auto_debit?: boolean;
  is_active?: boolean;
}

export interface BankTransactionCreateDTO {
  account_id: number;
  transaction_type: 'fd_creation' | 'fd_interest' | 'fd_maturity' | 'rd_installment' | 'rd_maturity' | 'transfer' | 'withdrawal' | 'deposit';
  transaction_date: string;
  amount: number;
  balance_after?: number;
  reference_number?: string;
  description?: string;
  related_fd_id?: number;
  related_rd_id?: number;
}

// ==================== Asset Types ====================
export interface AssetCategoryCreateDTO {
  category_name: string;
  category_type: 'precious_metal' | 'real_estate' | 'commodity' | 'collectible' | 'other';
  description?: string;
}

export interface UserAssetCreateDTO {
  category_id: number;
  subcategory_id?: number;
  asset_name: string;
  description?: string;
  purchase_date: string;
  purchase_price: number;
  current_value?: number;
  quantity: number;
  unit: string;
  location?: string;
  storage_location?: string;
  insurance_policy_number?: string;
  insurance_company?: string;
  insurance_amount?: number;
  insurance_expiry_date?: string;
}

export interface UserAssetUpdateDTO {
  asset_name?: string;
  description?: string;
  current_value?: number;
  quantity?: number;
  location?: string;
  storage_location?: string;
  insurance_policy_number?: string;
  insurance_company?: string;
  insurance_amount?: number;
  insurance_expiry_date?: string;
  is_active?: boolean;
}

export interface RealEstateDetailCreateDTO {
  property_type: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'land';
  property_address: string;
  city: string;
  state: string;
  pincode?: string;
  area_sqft?: number;
  built_up_area_sqft?: number;
  year_built?: number;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  registration_number?: string;
  registration_date?: string;
  property_tax_number?: string;
  maintenance_charges?: number;
  rental_income?: number;
  rental_yield?: number;
  occupancy_status?: 'self_occupied' | 'rented' | 'vacant' | 'under_construction';
}

export interface GoldDetailCreateDTO {
  gold_type: 'jewelry' | 'coins' | 'bars' | 'etf' | 'mutual_fund';
  purity: '18K' | '22K' | '24K' | '999' | '995' | '916';
  weight_grams: number;
  making_charges?: number;
  wastage_charges?: number;
  hallmark_certificate?: string;
  jeweler_name?: string;
  purchase_bill_number?: string;
  current_gold_rate_per_gram?: number;
}

export interface AssetValuationCreateDTO {
  valuation_date: string;
  valuation_amount: number;
  valuation_method: 'market_price' | 'appraisal' | 'index_based' | 'manual';
  valuation_source?: string;
  notes?: string;
}

export interface AssetTransactionCreateDTO {
  asset_id: number;
  transaction_type: 'purchase' | 'sale' | 'transfer' | 'gift' | 'inheritance' | 'valuation_update';
  transaction_date: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  transaction_fees?: number;
  net_amount: number;
  counterparty?: string;
  transaction_reference?: string;
  notes?: string;
}

// ==================== Portfolio Feature Types ====================
export interface PortfolioGoalCreateDTO {
  goal_name: string;
  goal_type: 'retirement' | 'education' | 'house_purchase' | 'marriage' | 'vacation' | 'emergency_fund' | 'other';
  target_amount: number;
  current_amount?: number;
  target_date: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface PortfolioGoalUpdateDTO {
  goal_name?: string;
  target_amount?: number;
  current_amount?: number;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
  is_achieved?: boolean;
  notes?: string;
}

export interface AssetAllocationTargetCreateDTO {
  asset_type: 'equity' | 'debt' | 'gold' | 'real_estate' | 'cash' | 'other';
  target_percentage: number;
  tolerance_band?: number;
}

export interface AssetAllocationTargetUpdateDTO {
  target_percentage?: number;
  current_percentage?: number;
  tolerance_band?: number;
  is_active?: boolean;
}

export interface PortfolioAlertCreateDTO {
  alert_type: 'price_alert' | 'allocation_alert' | 'maturity_alert' | 'goal_alert' | 'performance_alert';
  alert_name: string;
  alert_condition: string;
  alert_threshold?: number;
}

export interface PortfolioAlertUpdateDTO {
  alert_name?: string;
  alert_condition?: string;
  alert_threshold?: number;
  is_active?: boolean;
}

export interface WatchlistCreateDTO {
  security_id: number;
  target_price?: number;
  notes?: string;
}

export interface WatchlistUpdateDTO {
  target_price?: number;
  notes?: string;
}

export interface PortfolioReportGenerateDTO {
  report_type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  report_period_start: string;
  report_period_end: string;
}

// ==================== Query Parameter Types ====================
export interface PaginationQueryParams {
  page?: string;
  limit?: string;
}

export interface SortQueryParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQueryParams {
  startDate?: string;
  endDate?: string;
}

export interface BrokerQueryParams extends PaginationQueryParams, SortQueryParams {
  broker_type?: string;
  is_active?: string;
  search?: string;
}

export interface SecurityQueryParams extends PaginationQueryParams, SortQueryParams {
  security_type?: string;
  exchange?: string;
  sector?: string;
  search?: string;
}

export interface TransactionQueryParams extends PaginationQueryParams, SortQueryParams, DateRangeQueryParams {
  transaction_type?: string;
  account_id?: string;
  security_id?: string;
}

// ==================== JWT & Auth Types ====================
export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  body: any;
  params: any;
  query: any;
  headers: any;
}

// ==================== API Response Types ====================
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

