import { Response } from 'express';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { recurringDeposits, rdInstallments, vRecurringDeposits } from '../db/schema';
import { AuthRequest, RecurringDepositCreateDTO, RecurringDepositUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { parsePagination, getPaginationMeta } from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated, sendList } from '../utils/response-formatter';

/**
 * Get all recurring deposits for authenticated user (with view data)
 */
export async function getRecurringDeposits(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { page, limit, status } = req.query;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined 
    });

    // Build filter
    let whereClause = eq(vRecurringDeposits.user_id, userId);
    
    if (status) {
      whereClause = and(whereClause, eq(vRecurringDeposits.status, status as string)) as any;
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(vRecurringDeposits)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data from view
    const rds = await db
      .select()
      .from(vRecurringDeposits)
      .where(whereClause)
      .orderBy(desc(vRecurringDeposits.start_date))
      .limit(pageSize)
      .offset(offset);

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, rds, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get RD by ID with installments
 */
export async function getRecurringDepositById(req: AuthRequest, res: Response) {
  try {
    const rdId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(rdId)) {
      throw new ApiError(400, 'Invalid RD ID');
    }

    // Get RD
    const rd = await db
      .select()
      .from(recurringDeposits)
      .where(eq(recurringDeposits.rd_id, rdId))
      .limit(1);

    if (rd.length === 0) {
      throw new ApiError(404, 'Recurring deposit not found');
    }

    // Check ownership
    if (rd[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this recurring deposit');
    }

    // Get installments
    const installments = await db
      .select()
      .from(rdInstallments)
      .where(eq(rdInstallments.rd_id, rdId))
      .orderBy(desc(rdInstallments.due_date));

    const result = {
      ...rd[0],
      installments
    };

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create recurring deposit
 */
export async function createRecurringDeposit(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const rdData: RecurringDepositCreateDTO = req.body;

    // Verify account belongs to user
    const accountCheck = await db.execute(sql`
      SELECT user_id FROM user_bank_accounts 
      WHERE account_id = ${rdData.account_id} AND user_id = ${userId}
    `);

    if (accountCheck.rows.length === 0) {
      throw new ApiError(404, 'Bank account not found or access denied');
    }

    // Check for duplicate RD number
    const existing = await db
      .select()
      .from(recurringDeposits)
      .where(
        and(
          eq(recurringDeposits.user_id, userId),
          eq(recurringDeposits.account_id, rdData.account_id),
          eq(recurringDeposits.rd_number, rdData.rd_number)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, 'RD with this number already exists for this account');
    }

    // Create RD
    const newRd = await db
      .insert(recurringDeposits)
      .values({
        user_id: userId,
        account_id: rdData.account_id,
        rd_number: rdData.rd_number,
        monthly_installment: rdData.monthly_installment.toString(),
        interest_rate: rdData.interest_rate.toString(),
        tenure_months: rdData.tenure_months,
        maturity_amount: rdData.maturity_amount?.toString(),
        start_date: rdData.start_date,
        maturity_date: rdData.maturity_date,
        installment_day: rdData.installment_day,
        auto_debit: rdData.auto_debit ?? true,
        premature_closure_allowed: rdData.premature_closure_allowed ?? true,
        premature_penalty_rate: rdData.premature_penalty_rate?.toString() || '1.00'
      })
      .returning();

    return sendCreated(res, newRd[0], 'Recurring deposit created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update recurring deposit
 */
export async function updateRecurringDeposit(req: AuthRequest, res: Response) {
  try {
    const rdId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const updateData: RecurringDepositUpdateDTO = req.body;

    if (isNaN(rdId)) {
      throw new ApiError(400, 'Invalid RD ID');
    }

    // Check if RD exists and belongs to user
    const existing = await db
      .select()
      .from(recurringDeposits)
      .where(eq(recurringDeposits.rd_id, rdId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Recurring deposit not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this recurring deposit');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.maturity_amount !== undefined) updateValues.maturity_amount = updateData.maturity_amount.toString();
    if (updateData.auto_debit !== undefined) updateValues.auto_debit = updateData.auto_debit;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update RD
    const updated = await db
      .update(recurringDeposits)
      .set(updateValues)
      .where(eq(recurringDeposits.rd_id, rdId))
      .returning();

    return sendSuccess(res, updated[0], 'Recurring deposit updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Close/Delete recurring deposit
 */
export async function closeRecurringDeposit(req: AuthRequest, res: Response) {
  try {
    const rdId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(rdId)) {
      throw new ApiError(400, 'Invalid RD ID');
    }

    // Check if RD exists and belongs to user
    const existing = await db
      .select()
      .from(recurringDeposits)
      .where(eq(recurringDeposits.rd_id, rdId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Recurring deposit not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this recurring deposit');
    }

    // Mark as inactive
    await db
      .update(recurringDeposits)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(recurringDeposits.rd_id, rdId));

    return sendSuccess(res, null, 'Recurring deposit closed successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Get installment history for an RD
 */
export async function getInstallments(req: AuthRequest, res: Response) {
  try {
    const rdId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(rdId)) {
      throw new ApiError(400, 'Invalid RD ID');
    }

    // Verify RD exists and belongs to user
    const rd = await db
      .select()
      .from(recurringDeposits)
      .where(eq(recurringDeposits.rd_id, rdId))
      .limit(1);

    if (rd.length === 0) {
      throw new ApiError(404, 'Recurring deposit not found');
    }

    if (rd[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this recurring deposit');
    }

    // Get installments
    const installments = await db
      .select()
      .from(rdInstallments)
      .where(eq(rdInstallments.rd_id, rdId))
      .orderBy(desc(rdInstallments.due_date));

    return sendList(res, installments);
  } catch (error) {
    throw error;
  }
}

/**
 * Record installment payment
 */
export async function payInstallment(req: AuthRequest, res: Response) {
  try {
    const rdId = parseInt(req.params.id);
    const installmentId = parseInt(req.params.installmentId);
    const userId = req.user!.userId;

    if (isNaN(rdId) || isNaN(installmentId)) {
      throw new ApiError(400, 'Invalid RD ID or installment ID');
    }

    // Verify RD exists and belongs to user
    const rd = await db
      .select()
      .from(recurringDeposits)
      .where(eq(recurringDeposits.rd_id, rdId))
      .limit(1);

    if (rd.length === 0) {
      throw new ApiError(404, 'Recurring deposit not found');
    }

    if (rd[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this recurring deposit');
    }

    // Get installment
    const installment = await db
      .select()
      .from(rdInstallments)
      .where(
        and(
          eq(rdInstallments.rd_id, rdId),
          eq(rdInstallments.installment_id, installmentId)
        )
      )
      .limit(1);

    if (installment.length === 0) {
      throw new ApiError(404, 'Installment not found');
    }

    // Update installment status
    const updated = await db
      .update(rdInstallments)
      .set({
        paid_amount: installment[0].installment_amount,
        paid_date: new Date().toISOString().split('T')[0],
        payment_status: 'paid'
      })
      .where(eq(rdInstallments.installment_id, installmentId))
      .returning();

    return sendSuccess(res, updated[0], 'Installment payment recorded successfully');
  } catch (error) {
    throw error;
  }
}

