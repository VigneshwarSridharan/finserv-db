import { Response } from 'express';
import { eq, and, sql, desc, lte } from 'drizzle-orm';
import { db } from '../config/database';
import { fixedDeposits, fdInterestPayments, vFixedDeposits } from '../db/schema';
import { AuthRequest, FixedDepositCreateDTO, FixedDepositUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { parsePagination, getPaginationMeta } from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated, sendList } from '../utils/response-formatter';

/**
 * Get all fixed deposits for authenticated user (with view data)
 */
export async function getFixedDeposits(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { page, limit, status } = req.query;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined 
    });

    // Build filter
    let whereClause = eq(vFixedDeposits.user_id, userId);
    
    if (status) {
      whereClause = and(whereClause, eq(vFixedDeposits.status, status as string)) as any;
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(vFixedDeposits)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data from view
    const fds = await db
      .select()
      .from(vFixedDeposits)
      .where(whereClause)
      .orderBy(desc(vFixedDeposits.start_date))
      .limit(pageSize)
      .offset(offset);

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, fds, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get FD by ID with interest payments
 */
export async function getFixedDepositById(req: AuthRequest, res: Response) {
  try {
    const fdId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(fdId)) {
      throw new ApiError(400, 'Invalid FD ID');
    }

    // Get FD
    const fd = await db
      .select()
      .from(fixedDeposits)
      .where(eq(fixedDeposits.fd_id, fdId))
      .limit(1);

    if (fd.length === 0) {
      throw new ApiError(404, 'Fixed deposit not found');
    }

    // Check ownership
    if (fd[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this fixed deposit');
    }

    // Get interest payments
    const interestPayments = await db
      .select()
      .from(fdInterestPayments)
      .where(eq(fdInterestPayments.fd_id, fdId))
      .orderBy(desc(fdInterestPayments.payment_date));

    const result = {
      ...fd[0],
      interest_payments: interestPayments
    };

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create fixed deposit
 */
export async function createFixedDeposit(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const fdData: FixedDepositCreateDTO = req.body;

    // Verify account belongs to user
    const accountCheck = await db.execute(sql`
      SELECT user_id FROM user_bank_accounts 
      WHERE account_id = ${fdData.account_id} AND user_id = ${userId}
    `);

    if (accountCheck.rows.length === 0) {
      throw new ApiError(404, 'Bank account not found or access denied');
    }

    // Check for duplicate FD number
    const existing = await db
      .select()
      .from(fixedDeposits)
      .where(
        and(
          eq(fixedDeposits.user_id, userId),
          eq(fixedDeposits.account_id, fdData.account_id),
          eq(fixedDeposits.fd_number, fdData.fd_number)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, 'FD with this number already exists for this account');
    }

    // Create FD
    const newFd = await db
      .insert(fixedDeposits)
      .values({
        user_id: userId,
        account_id: fdData.account_id,
        fd_number: fdData.fd_number,
        principal_amount: fdData.principal_amount.toString(),
        interest_rate: fdData.interest_rate.toString(),
        tenure_months: fdData.tenure_months,
        maturity_amount: fdData.maturity_amount?.toString(),
        start_date: fdData.start_date,
        maturity_date: fdData.maturity_date,
        interest_payout_frequency: fdData.interest_payout_frequency || 'maturity',
        auto_renewal: fdData.auto_renewal ?? false,
        premature_withdrawal_allowed: fdData.premature_withdrawal_allowed ?? true,
        premature_penalty_rate: fdData.premature_penalty_rate?.toString() || '1.00'
      })
      .returning();

    return sendCreated(res, newFd[0], 'Fixed deposit created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update fixed deposit
 */
export async function updateFixedDeposit(req: AuthRequest, res: Response) {
  try {
    const fdId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const updateData: FixedDepositUpdateDTO = req.body;

    if (isNaN(fdId)) {
      throw new ApiError(400, 'Invalid FD ID');
    }

    // Check if FD exists and belongs to user
    const existing = await db
      .select()
      .from(fixedDeposits)
      .where(eq(fixedDeposits.fd_id, fdId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Fixed deposit not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this fixed deposit');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.maturity_amount !== undefined) updateValues.maturity_amount = updateData.maturity_amount.toString();
    if (updateData.auto_renewal !== undefined) updateValues.auto_renewal = updateData.auto_renewal;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update FD
    const updated = await db
      .update(fixedDeposits)
      .set(updateValues)
      .where(eq(fixedDeposits.fd_id, fdId))
      .returning();

    return sendSuccess(res, updated[0], 'Fixed deposit updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Close/Delete fixed deposit (premature withdrawal)
 */
export async function closeFixedDeposit(req: AuthRequest, res: Response) {
  try {
    const fdId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(fdId)) {
      throw new ApiError(400, 'Invalid FD ID');
    }

    // Check if FD exists and belongs to user
    const existing = await db
      .select()
      .from(fixedDeposits)
      .where(eq(fixedDeposits.fd_id, fdId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Fixed deposit not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this fixed deposit');
    }

    // Mark as inactive instead of deleting
    await db
      .update(fixedDeposits)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(fixedDeposits.fd_id, fdId));

    return sendSuccess(res, null, 'Fixed deposit closed successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Get interest payment history for an FD
 */
export async function getInterestPayments(req: AuthRequest, res: Response) {
  try {
    const fdId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(fdId)) {
      throw new ApiError(400, 'Invalid FD ID');
    }

    // Verify FD exists and belongs to user
    const fd = await db
      .select()
      .from(fixedDeposits)
      .where(eq(fixedDeposits.fd_id, fdId))
      .limit(1);

    if (fd.length === 0) {
      throw new ApiError(404, 'Fixed deposit not found');
    }

    if (fd[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this fixed deposit');
    }

    // Get interest payments
    const payments = await db
      .select()
      .from(fdInterestPayments)
      .where(eq(fdInterestPayments.fd_id, fdId))
      .orderBy(desc(fdInterestPayments.payment_date));

    return sendList(res, payments);
  } catch (error) {
    throw error;
  }
}

