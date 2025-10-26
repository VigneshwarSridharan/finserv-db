import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number')
  .optional();

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

export const positiveNumberSchema = z.number().positive('Must be a positive number');

export const percentageSchema = z.number().min(0, 'Must be at least 0').max(100, 'Must be at most 100');

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: emailSchema,
  password: passwordSchema,
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  date_of_birth: z.string().optional(),
});

// Profile validation schemas
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  phone: phoneSchema,
  date_of_birth: z.string().optional(),
});

export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// Transaction validation schemas
export const transactionSchema = z.object({
  account_id: z.number().positive('Please select an account'),
  security_id: z.number().positive('Please select a security'),
  transaction_type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT']),
  transaction_date: dateSchema,
  quantity: positiveNumberSchema,
  price_per_unit: positiveNumberSchema,
  brokerage_fee: z.number().nonnegative('Must be non-negative').optional(),
  stt: z.number().nonnegative('Must be non-negative').optional(),
  other_charges: z.number().nonnegative('Must be non-negative').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});



