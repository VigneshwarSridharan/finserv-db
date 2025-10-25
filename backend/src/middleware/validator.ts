import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validation schemas
 */

// User registration schema
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  date_of_birth: z.string().optional()
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Portfolio creation schema
export const createPortfolioSchema = z.object({
  asset_type: z.enum([
    'securities',
    'fixed_deposits',
    'recurring_deposits',
    'gold',
    'real_estate',
    'other_assets'
  ]),
  total_investment: z.number().min(0),
  current_value: z.number().min(0),
  unrealized_pnl: z.number().optional().default(0),
  realized_pnl: z.number().optional().default(0),
  total_pnl: z.number().optional().default(0),
  percentage_of_portfolio: z.number().min(0).max(100).optional().default(0)
});

// Portfolio update schema (all fields optional)
export const updatePortfolioSchema = z.object({
  asset_type: z.enum([
    'securities',
    'fixed_deposits',
    'recurring_deposits',
    'gold',
    'real_estate',
    'other_assets'
  ]).optional(),
  total_investment: z.number().min(0).optional(),
  current_value: z.number().min(0).optional(),
  unrealized_pnl: z.number().optional(),
  realized_pnl: z.number().optional(),
  total_pnl: z.number().optional(),
  percentage_of_portfolio: z.number().min(0).max(100).optional()
});

// ==================== Broker Schemas ====================
export const createBrokerSchema = z.object({
  broker_name: z.string().min(1).max(100),
  broker_code: z.string().min(1).max(20),
  broker_type: z.enum(['full_service', 'discount', 'online', 'bank']),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional()
});

export const updateBrokerSchema = z.object({
  broker_name: z.string().min(1).max(100).optional(),
  broker_type: z.enum(['full_service', 'discount', 'online', 'bank']).optional(),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  is_active: z.boolean().optional()
});

// ==================== Security Schemas ====================
export const createSecuritySchema = z.object({
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  security_type: z.enum(['stock', 'bond', 'mutual_fund', 'etf', 'commodity', 'currency']),
  exchange: z.string().min(1).max(50),
  sector: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  market_cap_category: z.enum(['large_cap', 'mid_cap', 'small_cap', 'micro_cap']).optional(),
  isin: z.string().length(12).optional(),
  face_value: z.number().min(0).optional(),
  lot_size: z.number().int().min(1).optional().default(1)
});

export const updateSecuritySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  security_type: z.enum(['stock', 'bond', 'mutual_fund', 'etf', 'commodity', 'currency']).optional(),
  sector: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  market_cap_category: z.enum(['large_cap', 'mid_cap', 'small_cap', 'micro_cap']).optional(),
  face_value: z.number().min(0).optional(),
  lot_size: z.number().int().min(1).optional(),
  is_active: z.boolean().optional()
});

// ==================== Security Price Schemas ====================
export const createSecurityPriceSchema = z.object({
  price_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  open_price: z.number().min(0).optional(),
  high_price: z.number().min(0).optional(),
  low_price: z.number().min(0).optional(),
  close_price: z.number().min(0),
  volume: z.number().int().min(0).optional(),
  adjusted_close: z.number().min(0).optional()
});

// ==================== User Broker Account Schemas ====================
export const createUserBrokerAccountSchema = z.object({
  broker_id: z.number().int().positive(),
  account_number: z.string().min(1).max(50),
  account_type: z.enum(['equity', 'commodity', 'currency', 'derivatives', 'mutual_fund']),
  account_name: z.string().max(100).optional(),
  opened_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const updateUserBrokerAccountSchema = z.object({
  account_name: z.string().max(100).optional(),
  is_active: z.boolean().optional()
});

// ==================== Security Transaction Schemas ====================
export const createSecurityTransactionSchema = z.object({
  account_id: z.number().int().positive(),
  security_id: z.number().int().positive(),
  transaction_type: z.enum(['buy', 'sell', 'bonus', 'split', 'dividend']),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantity: z.number().positive(),
  price: z.number().positive(),
  total_amount: z.number().positive(),
  brokerage: z.number().min(0).optional().default(0),
  taxes: z.number().min(0).optional().default(0),
  other_charges: z.number().min(0).optional().default(0),
  net_amount: z.number().positive(),
  notes: z.string().optional()
});

export const updateSecurityTransactionSchema = z.object({
  transaction_type: z.enum(['buy', 'sell', 'bonus', 'split', 'dividend']).optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  quantity: z.number().positive().optional(),
  price: z.number().positive().optional(),
  total_amount: z.number().positive().optional(),
  brokerage: z.number().min(0).optional(),
  taxes: z.number().min(0).optional(),
  other_charges: z.number().min(0).optional(),
  net_amount: z.number().positive().optional(),
  notes: z.string().optional()
});

// ==================== Bank Schemas ====================
export const createBankSchema = z.object({
  bank_name: z.string().min(1).max(100),
  bank_code: z.string().min(1).max(20),
  bank_type: z.enum(['public', 'private', 'foreign', 'cooperative', 'small_finance', 'payment']),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional()
});

export const updateBankSchema = z.object({
  bank_name: z.string().min(1).max(100).optional(),
  bank_type: z.enum(['public', 'private', 'foreign', 'cooperative', 'small_finance', 'payment']).optional(),
  website: z.string().url().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  is_active: z.boolean().optional()
});

export const createUserBankAccountSchema = z.object({
  bank_id: z.number().int().positive(),
  account_number: z.string().min(1).max(50),
  account_type: z.enum(['savings', 'current', 'fixed_deposit', 'recurring_deposit', 'nro', 'nre']),
  account_name: z.string().max(100).optional(),
  ifsc_code: z.string().length(11).optional(),
  branch_name: z.string().max(100).optional(),
  opened_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const updateUserBankAccountSchema = z.object({
  account_name: z.string().max(100).optional(),
  ifsc_code: z.string().length(11).optional(),
  branch_name: z.string().max(100).optional(),
  is_active: z.boolean().optional()
});

// ==================== Fixed Deposit Schemas ====================
export const createFixedDepositSchema = z.object({
  account_id: z.number().int().positive(),
  fd_number: z.string().min(1).max(50),
  principal_amount: z.number().positive(),
  interest_rate: z.number().positive(),
  tenure_months: z.number().int().positive(),
  maturity_amount: z.number().positive().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maturity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  interest_payout_frequency: z.enum(['monthly', 'quarterly', 'half_yearly', 'yearly', 'maturity']).optional(),
  auto_renewal: z.boolean().optional(),
  premature_withdrawal_allowed: z.boolean().optional(),
  premature_penalty_rate: z.number().min(0).optional()
});

export const updateFixedDepositSchema = z.object({
  maturity_amount: z.number().positive().optional(),
  auto_renewal: z.boolean().optional(),
  is_active: z.boolean().optional()
});

// ==================== Recurring Deposit Schemas ====================
export const createRecurringDepositSchema = z.object({
  account_id: z.number().int().positive(),
  rd_number: z.string().min(1).max(50),
  monthly_installment: z.number().positive(),
  interest_rate: z.number().positive(),
  tenure_months: z.number().int().positive(),
  maturity_amount: z.number().positive().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maturity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  installment_day: z.number().int().min(1).max(31),
  auto_debit: z.boolean().optional(),
  premature_closure_allowed: z.boolean().optional(),
  premature_penalty_rate: z.number().min(0).optional()
});

export const updateRecurringDepositSchema = z.object({
  maturity_amount: z.number().positive().optional(),
  auto_debit: z.boolean().optional(),
  is_active: z.boolean().optional()
});

/**
 * Generic validation middleware factory
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

