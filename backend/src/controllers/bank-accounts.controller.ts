import { Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { userBankAccounts, banks } from '../db/schema';
import { AuthRequest, UserBankAccountCreateDTO, UserBankAccountUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendList } from '../utils/response-formatter';

/**
 * Get all bank accounts for authenticated user
 */
export async function getUserBankAccounts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const accounts = await db
      .select({
        account: userBankAccounts,
        bank: banks
      })
      .from(userBankAccounts)
      .leftJoin(banks, eq(userBankAccounts.bank_id, banks.bank_id))
      .where(eq(userBankAccounts.user_id, userId));

    const formattedAccounts = accounts.map(({ account, bank }) => ({
      ...account,
      bank
    }));

    return sendList(res, formattedAccounts);
  } catch (error) {
    throw error;
  }
}

/**
 * Get bank account by ID
 */
export async function getBankAccountById(req: AuthRequest, res: Response) {
  try {
    const accountId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(accountId)) {
      throw new ApiError(400, 'Invalid account ID');
    }

    const account = await db
      .select({
        account: userBankAccounts,
        bank: banks
      })
      .from(userBankAccounts)
      .leftJoin(banks, eq(userBankAccounts.bank_id, banks.bank_id))
      .where(eq(userBankAccounts.account_id, accountId))
      .limit(1);

    if (account.length === 0) {
      throw new ApiError(404, 'Bank account not found');
    }

    // Check ownership
    if (account[0].account.user_id !== userId) {
      throw new ApiError(403, 'Access denied to this account');
    }

    const result = {
      ...account[0].account,
      bank: account[0].bank
    };

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create bank account
 */
export async function createBankAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const accountData: UserBankAccountCreateDTO = req.body;

    // Verify bank exists
    const bank = await db
      .select()
      .from(banks)
      .where(eq(banks.bank_id, accountData.bank_id))
      .limit(1);

    if (bank.length === 0) {
      throw new ApiError(404, 'Bank not found');
    }

    // Check for duplicate account
    const existing = await db
      .select()
      .from(userBankAccounts)
      .where(
        and(
          eq(userBankAccounts.user_id, userId),
          eq(userBankAccounts.bank_id, accountData.bank_id),
          eq(userBankAccounts.account_number, accountData.account_number)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, 'This bank account already exists');
    }

    // Create account
    const newAccount = await db
      .insert(userBankAccounts)
      .values({
        user_id: userId,
        bank_id: accountData.bank_id,
        account_number: accountData.account_number,
        account_type: accountData.account_type,
        account_name: accountData.account_name,
        ifsc_code: accountData.ifsc_code,
        branch_name: accountData.branch_name,
        opened_date: accountData.opened_date
      })
      .returning();

    return sendCreated(res, newAccount[0], 'Bank account created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update bank account
 */
export async function updateBankAccount(req: AuthRequest, res: Response) {
  try {
    const accountId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const updateData: UserBankAccountUpdateDTO = req.body;

    if (isNaN(accountId)) {
      throw new ApiError(400, 'Invalid account ID');
    }

    // Check if account exists and belongs to user
    const existing = await db
      .select()
      .from(userBankAccounts)
      .where(eq(userBankAccounts.account_id, accountId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Bank account not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this account');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.account_name !== undefined) updateValues.account_name = updateData.account_name;
    if (updateData.ifsc_code !== undefined) updateValues.ifsc_code = updateData.ifsc_code;
    if (updateData.branch_name !== undefined) updateValues.branch_name = updateData.branch_name;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update account
    const updated = await db
      .update(userBankAccounts)
      .set(updateValues)
      .where(eq(userBankAccounts.account_id, accountId))
      .returning();

    return sendSuccess(res, updated[0], 'Bank account updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete bank account
 */
export async function deleteBankAccount(req: AuthRequest, res: Response) {
  try {
    const accountId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(accountId)) {
      throw new ApiError(400, 'Invalid account ID');
    }

    // Check if account exists and belongs to user
    const existing = await db
      .select()
      .from(userBankAccounts)
      .where(eq(userBankAccounts.account_id, accountId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Bank account not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this account');
    }

    // Delete account
    await db
      .delete(userBankAccounts)
      .where(eq(userBankAccounts.account_id, accountId));

    return sendSuccess(res, null, 'Bank account deleted successfully');
  } catch (error) {
    throw error;
  }
}

