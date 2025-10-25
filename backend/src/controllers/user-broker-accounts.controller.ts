import { Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { userBrokerAccounts, brokers } from '../db/schema';
import { AuthRequest, UserBrokerAccountCreateDTO, UserBrokerAccountUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendList } from '../utils/response-formatter';

/**
 * Get all broker accounts for authenticated user
 */
export async function getUserBrokerAccounts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const accounts = await db
      .select({
        account: userBrokerAccounts,
        broker: brokers
      })
      .from(userBrokerAccounts)
      .leftJoin(brokers, eq(userBrokerAccounts.broker_id, brokers.broker_id))
      .where(eq(userBrokerAccounts.user_id, userId));

    const formattedAccounts = accounts.map(({ account, broker }) => ({
      ...account,
      broker
    }));

    return sendList(res, formattedAccounts);
  } catch (error) {
    throw error;
  }
}

/**
 * Get broker account by ID
 */
export async function getBrokerAccountById(req: AuthRequest, res: Response) {
  try {
    const accountId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(accountId)) {
      throw new ApiError(400, 'Invalid account ID');
    }

    const account = await db
      .select({
        account: userBrokerAccounts,
        broker: brokers
      })
      .from(userBrokerAccounts)
      .leftJoin(brokers, eq(userBrokerAccounts.broker_id, brokers.broker_id))
      .where(eq(userBrokerAccounts.account_id, accountId))
      .limit(1);

    if (account.length === 0) {
      throw new ApiError(404, 'Broker account not found');
    }

    // Check ownership
    if (account[0].account.user_id !== userId) {
      throw new ApiError(403, 'Access denied to this account');
    }

    const result = {
      ...account[0].account,
      broker: account[0].broker
    };

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create broker account
 */
export async function createBrokerAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const accountData: UserBrokerAccountCreateDTO = req.body;

    // Verify broker exists
    const broker = await db
      .select()
      .from(brokers)
      .where(eq(brokers.broker_id, accountData.broker_id))
      .limit(1);

    if (broker.length === 0) {
      throw new ApiError(404, 'Broker not found');
    }

    // Check for duplicate account
    const existing = await db
      .select()
      .from(userBrokerAccounts)
      .where(
        and(
          eq(userBrokerAccounts.user_id, userId),
          eq(userBrokerAccounts.broker_id, accountData.broker_id),
          eq(userBrokerAccounts.account_number, accountData.account_number)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, 'This broker account already exists');
    }

    // Create account
    const newAccount = await db
      .insert(userBrokerAccounts)
      .values({
        user_id: userId,
        broker_id: accountData.broker_id,
        account_number: accountData.account_number,
        account_type: accountData.account_type,
        account_name: accountData.account_name,
        opened_date: accountData.opened_date
      })
      .returning();

    return sendCreated(res, newAccount[0], 'Broker account created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update broker account
 */
export async function updateBrokerAccount(req: AuthRequest, res: Response) {
  try {
    const accountId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const updateData: UserBrokerAccountUpdateDTO = req.body;

    if (isNaN(accountId)) {
      throw new ApiError(400, 'Invalid account ID');
    }

    // Check if account exists and belongs to user
    const existing = await db
      .select()
      .from(userBrokerAccounts)
      .where(eq(userBrokerAccounts.account_id, accountId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Broker account not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this account');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.account_name !== undefined) updateValues.account_name = updateData.account_name;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update account
    const updated = await db
      .update(userBrokerAccounts)
      .set(updateValues)
      .where(eq(userBrokerAccounts.account_id, accountId))
      .returning();

    return sendSuccess(res, updated[0], 'Broker account updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete broker account
 */
export async function deleteBrokerAccount(req: AuthRequest, res: Response) {
  try {
    const accountId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(accountId)) {
      throw new ApiError(400, 'Invalid account ID');
    }

    // Check if account exists and belongs to user
    const existing = await db
      .select()
      .from(userBrokerAccounts)
      .where(eq(userBrokerAccounts.account_id, accountId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Broker account not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this account');
    }

    // Delete account
    await db
      .delete(userBrokerAccounts)
      .where(eq(userBrokerAccounts.account_id, accountId));

    return sendSuccess(res, null, 'Broker account deleted successfully');
  } catch (error) {
    throw error;
  }
}

