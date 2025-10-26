// Asset Types
export const ASSET_TYPES = [
  { value: 'securities', label: 'Securities' },
  { value: 'fixed_deposits', label: 'Fixed Deposits' },
  { value: 'recurring_deposits', label: 'Recurring Deposits' },
  { value: 'gold', label: 'Gold' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other_assets', label: 'Other Assets' },
] as const;

// Security Types
export const SECURITY_TYPES = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'BOND', label: 'Bond' },
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
  { value: 'ETF', label: 'ETF' },
  { value: 'DERIVATIVE', label: 'Derivative' },
] as const;

// Transaction Types
export const TRANSACTION_TYPES = [
  { value: 'BUY', label: 'Buy' },
  { value: 'SELL', label: 'Sell' },
  { value: 'DIVIDEND', label: 'Dividend' },
  { value: 'BONUS', label: 'Bonus' },
  { value: 'SPLIT', label: 'Split' },
] as const;

// Bank Account Types
export const BANK_ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CURRENT', label: 'Current' },
  { value: 'SALARY', label: 'Salary' },
] as const;

// Deposit Status
export const DEPOSIT_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'MATURED', label: 'Matured' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

// Goal Types
export const GOAL_TYPES = [
  { value: 'RETIREMENT', label: 'Retirement' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'EMERGENCY', label: 'Emergency Fund' },
  { value: 'CUSTOM', label: 'Custom' },
] as const;

// Alert Types
export const ALERT_TYPES = [
  { value: 'PRICE_TARGET', label: 'Price Target' },
  { value: 'STOP_LOSS', label: 'Stop Loss' },
  { value: 'MATURITY_DATE', label: 'Maturity Date' },
  { value: 'REBALANCE', label: 'Rebalance' },
] as const;

// Interest Payout Frequency
export const INTEREST_PAYOUT_FREQUENCY = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-Annually' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'ON_MATURITY', label: 'On Maturity' },
] as const;

// Chart Colors
export const CHART_COLORS = [
  '#3182CE', // Blue
  '#38A169', // Green
  '#DD6B20', // Orange
  '#E53E3E', // Red
  '#805AD5', // Purple
  '#D69E2E', // Yellow
  '#319795', // Teal
  '#E53E3E', // Pink
] as const;

// Date Range Presets
export const DATE_RANGE_PRESETS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '1m', label: 'Last Month' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// API
export const API_TIMEOUT = 30000; // 30 seconds

// App Info
export const APP_NAME = 'Portfolio Manager';
export const APP_VERSION = '1.0.0';



