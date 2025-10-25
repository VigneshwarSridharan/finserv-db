import { Request, Response } from 'express';
import { db } from '../config/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sendSuccess, sendNotFound } from '../utils/response-formatter';
import { AuthRequest } from '../types';

/**
 * Get user profile
 */
export async function getUserProfile(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const [user] = await db.select({
    user_id: users.user_id,
    username: users.username,
    email: users.email,
    full_name: users.full_name,
    date_of_birth: users.date_of_birth,
    phone_number: users.phone_number,
    address: users.address,
    city: users.city,
    state: users.state,
    country: users.country,
    pincode: users.pincode,
    pan_number: users.pan_number,
    created_at: users.created_at,
    updated_at: users.updated_at
  })
    .from(users)
    .where(eq(users.user_id, userId))
    .limit(1);

  if (!user) {
    return sendNotFound(res, 'User not found');
  }

  return sendSuccess(res, user, 'User profile retrieved successfully');
}

/**
 * Update user profile
 */
export async function updateUserProfile(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    full_name,
    date_of_birth,
    phone_number,
    address,
    city,
    state,
    country,
    pincode,
    pan_number
  } = req.body;

  const [updated] = await db.update(users)
    .set({
      full_name,
      date_of_birth,
      phone_number,
      address,
      city,
      state,
      country,
      pincode,
      pan_number,
      updated_at: new Date()
    })
    .where(eq(users.user_id, userId))
    .returning({
      user_id: users.user_id,
      username: users.username,
      email: users.email,
      full_name: users.full_name,
      date_of_birth: users.date_of_birth,
      phone_number: users.phone_number,
      address: users.address,
      city: users.city,
      state: users.state,
      country: users.country,
      pincode: users.pincode,
      pan_number: users.pan_number,
      updated_at: users.updated_at
    });

  if (!updated) {
    return sendNotFound(res, 'User not found');
  }

  return sendSuccess(res, updated, 'User profile updated successfully');
}

/**
 * Get user preferences (stored in users table or separate table)
 * For now, returning basic preferences structure
 */
export async function getUserPreferences(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // This is a placeholder - preferences could be stored in a separate table
  // or as JSONB in the users table
  const preferences = {
    user_id: userId,
    theme: 'light',
    currency: 'INR',
    date_format: 'DD/MM/YYYY',
    number_format: 'en-IN',
    notifications: {
      email: true,
      push: true,
      price_alerts: true,
      maturity_alerts: true
    },
    dashboard: {
      default_view: 'overview',
      show_charts: true,
      show_recent_transactions: true
    }
  };

  return sendSuccess(res, preferences, 'User preferences retrieved successfully');
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  
  // This is a placeholder implementation
  // In a real application, preferences would be stored in database
  const preferences = {
    user_id: userId,
    ...req.body,
    updated_at: new Date()
  };

  return sendSuccess(res, preferences, 'User preferences updated successfully');
}

