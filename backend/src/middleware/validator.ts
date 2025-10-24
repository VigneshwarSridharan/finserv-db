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

