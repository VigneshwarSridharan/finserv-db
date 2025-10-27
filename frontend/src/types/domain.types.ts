// Portfolio Types
export interface Portfolio {
  summary_id: number;
  user_id: number;
  asset_type: string;
  total_investment: string;
  current_value: string;
  unrealized_pnl: string;
  realized_pnl: string;
  total_pnl: string;
  percentage_of_portfolio: string;
  last_updated: string;
}

export interface CreatePortfolioRequest {
  asset_type: string;
  total_investment: number;
  current_value: number;
  unrealized_pnl?: number;
  realized_pnl?: number;
  total_pnl?: number;
  percentage_of_portfolio?: number;
}

export interface UpdatePortfolioRequest {
  total_investment?: number;
  current_value?: number;
  unrealized_pnl?: number;
  realized_pnl?: number;
  total_pnl?: number;
  percentage_of_portfolio?: number;
}

// Broker Types
export interface Broker {
  broker_id: number;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBrokerRequest {
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

// Security Types
export interface Security {
  security_id: number;
  symbol: string;
  security_name: string;
  security_type: string;
  exchange?: string;
  sector?: string;
  isin?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateSecurityRequest {
  symbol: string;
  security_name: string;
  security_type: string;
  exchange?: string;
  sector?: string;
  isin?: string;
}

// Security Price Types
export interface SecurityPrice {
  price_id: number;
  security_id: number;
  price_date: string;
  open_price?: string;
  high_price?: string;
  low_price?: string;
  close_price: string;
  volume?: string;
  created_at: string;
}

export interface CreatePriceRequest {
  security_id: number;
  price_date: string;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price: number;
  volume?: number;
}

// Broker Account Types
export interface BrokerAccount {
  account_id: number;
  user_id: number;
  broker_id: number;
  account_number: string;
  account_type?: string;
  is_active: boolean;
  opened_date?: string;
  created_at: string;
}

export interface CreateBrokerAccountRequest {
  broker_id: number;
  account_number: string;
  account_type?: string;
  opened_date?: string;
}

// Security Holding Types
export interface SecurityHolding {
  user_id: number;
  user_name: string;
  broker_name: string;
  account_number: string;
  symbol: string;
  security_name: string;
  security_type: string;
  exchange: string;
  sector: string;
  quantity: string;
  average_price: string;
  current_price: string;
  total_investment: string;
  current_value: string;
  unrealized_pnl: string;
  return_percentage: string;
  first_purchase_date: string;
  last_purchase_date: string;
}

// Security Transaction Types
export interface SecurityTransaction {
  transaction_id: number;
  user_id: number;
  username: string;
  user_name: string;
  email: string;
  broker_name: string;
  broker_code: string;
  account_number: string;
  account_type: string;
  symbol: string;
  security_name: string;
  security_type: string;
  exchange: string;
  sector: string;
  industry: string;
  isin: string;
  transaction_type: string;
  transaction_date: string;
  quantity: string;
  price: string;
  total_amount: string;
  brokerage: string;
  taxes: string;
  other_charges: string;
  net_amount: string;
  effective_price_per_unit: string;
  total_charges: string;
  charges_percentage: string;
  current_avg_price: string;
  notes?: string;
}

export interface CreateTransactionRequest {
  account_id: number;
  security_id: number;
  transaction_type: 'buy' | 'sell' | 'dividend' | 'bonus' | 'split';
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

// Bank Types
export interface Bank {
  bank_id: number;
  bank_name: string;
  bank_code: string;
  bank_type: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankRequest {
  bank_name: string;
  bank_code: string;
  bank_type: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Bank Account Types
export interface BankAccount {
  account_id: number;
  user_id: number;
  bank_id: number;
  account_number: string;
  account_type: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'nro' | 'nre';
  account_name?: string;
  ifsc_code?: string;
  branch_name?: string;
  is_active: boolean;
  opened_date?: string;
  created_at: string;
  updated_at: string;
  bank?: Bank;
}

export interface CreateBankAccountRequest {
  bank_id: number;
  account_number: string;
  account_type: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'nro' | 'nre';
  account_name?: string;
  ifsc_code?: string;
  branch_name?: string;
  opened_date?: string;
}

// Fixed Deposit Types
export interface FixedDeposit {
  fd_id: number;
  user_id: number;
  account_id: number;
  fd_number: string;
  principal_amount: string;
  interest_rate: string;
  start_date: string;
  maturity_date: string;
  tenure_months: number;
  maturity_amount?: string;
  interest_payout_frequency?: string;
  auto_renewal: boolean;
  premature_withdrawal_allowed: boolean;
  premature_penalty_rate?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFixedDepositRequest {
  account_id: number;
  fd_number: string;
  principal_amount: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  tenure_months: number;
  maturity_amount?: number;
  interest_payout_frequency?: string;
  auto_renewal?: boolean;
  premature_withdrawal_allowed?: boolean;
  premature_penalty_rate?: number;
}

// Recurring Deposit Types
export interface RecurringDeposit {
  rd_id: number;
  user_id: number;
  account_id: number;
  rd_number: string;
  monthly_installment: string;
  interest_rate: string;
  start_date: string;
  maturity_date: string;
  tenure_months: number;
  maturity_amount?: string;
  installment_day: number;
  auto_debit: boolean;
  premature_closure_allowed: boolean;
  premature_penalty_rate?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // View-specific fields (from v_recurring_deposits)
  user_name?: string;
  bank_name?: string;
  account_number?: string;
  status?: string;
  days_to_maturity?: number;
  paid_installments?: number;
  total_installments?: number;
}

export interface CreateRecurringDepositRequest {
  account_id: number;
  rd_number: string;
  monthly_installment: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  tenure_months: number;
  installment_day: number;
  auto_debit?: boolean;
  premature_closure_allowed?: boolean;
  premature_penalty_rate?: number;
}

// Asset Types
export interface Asset {
  asset_id: number;
  user_id: number;
  category_id: number;
  subcategory_id?: number;
  asset_name: string;
  description?: string;
  purchase_date?: string;
  purchase_price: string;
  current_value?: string;
  quantity?: string;
  unit?: string;
  location?: string;
  storage_location?: string;
  insurance_policy_number?: string;
  insurance_company?: string;
  insurance_amount?: string;
  insurance_expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    category_id: number;
    category_name: string;
    category_type: 'precious_metal' | 'real_estate' | 'commodity' | 'collectible' | 'other';
  };
  subcategory?: {
    subcategory_id: number;
    subcategory_name: string;
  };
  returns?: number;
  returns_percentage?: number;
}

export interface CreateAssetRequest {
  category_id: number;
  subcategory_id?: number;
  asset_name: string;
  description?: string;
  purchase_date?: string;
  purchase_price: number;
  current_value?: number;
  quantity?: number;
  unit?: string;
  location?: string;
  storage_location?: string;
  insurance_policy_number?: string;
  insurance_company?: string;
  insurance_amount?: number;
  insurance_expiry_date?: string;
}

// Asset Category Types
export interface AssetCategory {
  category_id: number;
  category_name: string;
  category_type: 'precious_metal' | 'real_estate' | 'commodity' | 'collectible' | 'other';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateAssetCategoryRequest {
  category_name: string;
  category_type: 'precious_metal' | 'real_estate' | 'commodity' | 'collectible' | 'other';
  description?: string;
  is_active?: boolean;
}

// Portfolio Goal Types
export interface PortfolioGoal {
  goal_id: number;
  user_id: number;
  goal_name: string;
  goal_type: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  is_achieved: boolean;
  achieved_date?: string;
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  remaining_amount?: number;
}

export interface CreateGoalRequest {
  goal_name: string;
  goal_type: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

// Asset Allocation Types
export interface AssetAllocation {
  allocation_id: number;
  user_id: number;
  asset_type: string;
  target_percentage: string;
  current_percentage?: string;
  created_at: string;
}

export interface CreateAllocationRequest {
  asset_type: string;
  target_percentage: number;
}

// Portfolio Alert Types
export interface PortfolioAlert {
  alert_id: number;
  user_id: number;
  alert_type: 'price_alert' | 'allocation_alert' | 'maturity_alert' | 'goal_alert' | 'performance_alert';
  alert_name: string;
  alert_condition: string;
  alert_threshold?: string;
  is_triggered: boolean;
  triggered_at?: string;
  is_active: boolean;
  created_at: string;
  // Legacy fields for backward compatibility (remove if not needed)
  condition_type?: string;
  threshold_value?: string;
  current_value?: string;
}

export interface CreateAlertRequest {
  alert_type: 'price_alert' | 'allocation_alert' | 'maturity_alert' | 'goal_alert' | 'performance_alert';
  alert_name: string;
  alert_condition: string;
  alert_threshold?: number;
  is_active?: boolean;
}

// Watchlist Types
export interface WatchlistItem {
  watchlist_id: number;
  user_id: number;
  security_id: number;
  added_date: string;
  target_price?: string;
  notes?: string;
}

export interface CreateWatchlistRequest {
  security_id: number;
  target_price?: number;
  notes?: string;
}

// Portfolio Overview Types
export interface PortfolioOverview {
  overview: {
    total_investment: number;
    total_value: number;
    total_pnl: number;
    return_percentage: number;
    day_change: number;
    day_change_percentage: number;
  };
  asset_breakdown: AssetBreakdown[];
  goals: {
    total_goals: number;
    achieved_goals: number;
    pending_goals: number;
  };
  asset_counts: {
    securities: number;
    fixed_deposits: number;
    recurring_deposits: number;
    other_assets: number;
  };
}

export interface AssetBreakdown {
  asset_type: string;
  investment: number;
  current_value: number;
  pnl: number;
  percentage: number;
}

// Portfolio Dashboard Types
export interface PortfolioDashboard {
  summary: {
    total_investment: number;
    total_value: number;
    total_pnl: number;
    return_percentage: number;
  };
  recent_performance: PerformanceDataPoint[];
  top_gainers: AssetPerformance[];
  top_losers: AssetPerformance[];
  asset_allocation: AllocationItem[];
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
  change: number;
}

export interface AssetPerformance {
  asset_type: string;
  pnl: number;
  return_percentage: number;
}

export interface AllocationItem {
  asset_type: string;
  percentage: number;
  value: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}


