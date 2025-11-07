import { Response } from 'express';
import { eq, and, gte, lte, or, desc, asc, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { 
  bondRepayments, 
  userSecurityHoldings, 
  securities,
  bondDetails
} from '../db/schemas/brokers-securities.schema';
import { 
  AuthRequest, 
  BondRepaymentCreateDTO, 
  BondRepaymentUpdateDTO,
  BondRepaymentScheduleDTO
} from '../types';
import { ApiError } from '../middleware/errorHandler';
import { 
  parsePagination, 
  getPaginationMeta, 
  buildSortClause, 
  combineFilters,
  buildDateRangeFilter
} from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated, sendNotFound } from '../utils/response-formatter';
import {
  generateAndSaveRepaymentSchedule,
  updatePaymentStatus
} from '../services/bond-repayments.service';
import logger from '../utils/logger';

/**
 * Get all bond repayments with filters
 */
export async function getAllBondRepayments(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      holding_id,
      security_id,
      repayment_type,
      payment_status,
      from_date,
      to_date
    } = req.query as any;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Build filters - always filter by user_id
    const filters = [eq(bondRepayments.user_id, userId)];

    if (holding_id) {
      filters.push(eq(bondRepayments.holding_id, parseInt(holding_id)));
    }

    if (security_id) {
      filters.push(eq(bondRepayments.security_id, parseInt(security_id)));
    }

    if (repayment_type) {
      filters.push(eq(bondRepayments.repayment_type, repayment_type));
    }

    if (payment_status) {
      filters.push(eq(bondRepayments.payment_status, payment_status));
    }

    // Date range filter
    if (from_date || to_date) {
      const dateFilter = buildDateRangeFilter(
        bondRepayments.scheduled_date,
        from_date,
        to_date
      );
      if (dateFilter) {
        filters.push(dateFilter);
      }
    }

    const whereClause = combineFilters(filters);

    // Build sort clause
    const allowedSortFields = {
      scheduled_date: bondRepayments.scheduled_date,
      scheduled_amount: bondRepayments.scheduled_amount,
      repayment_type: bondRepayments.repayment_type,
      payment_status: bondRepayments.payment_status,
      created_at: bondRepayments.created_at
    };
    
    const sortClause = buildSortClause(
      { sortBy, sortOrder },
      allowedSortFields,
      bondRepayments.scheduled_date
    );

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bondRepayments)
      .where(whereClause);
    
    const totalItems = Number(countResult[0]?.count || 0);

    // Get paginated data
    const query = db
      .select()
      .from(bondRepayments)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);
    
    if (sortClause) {
      query.orderBy(sortClause);
    } else {
      query.orderBy(asc(bondRepayments.scheduled_date));
    }

    const repayments = await query;

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, repayments, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get bond repayment by ID
 */
export async function getBondRepaymentById(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const repaymentId = parseInt(req.params.repaymentId);

    if (isNaN(repaymentId)) {
      throw new ApiError(400, 'Invalid repayment ID');
    }

    const [repayment] = await db
      .select()
      .from(bondRepayments)
      .where(
        and(
          eq(bondRepayments.repayment_id, repaymentId),
          eq(bondRepayments.user_id, userId)
        )
      )
      .limit(1);

    if (!repayment) {
      return sendNotFound(res, 'Bond repayment not found');
    }

    return sendSuccess(res, repayment, 'Bond repayment retrieved successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Get all repayments for a specific holding
 */
export async function getRepaymentsByHolding(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const holdingId = parseInt(req.params.holdingId);

    if (isNaN(holdingId)) {
      throw new ApiError(400, 'Invalid holding ID');
    }

    // Verify holding belongs to user
    const [holding] = await db
      .select()
      .from(userSecurityHoldings)
      .where(
        and(
          eq(userSecurityHoldings.holding_id, holdingId),
          eq(userSecurityHoldings.user_id, userId)
        )
      )
      .limit(1);

    if (!holding) {
      throw new ApiError(404, 'Holding not found');
    }

    const repayments = await db
      .select()
      .from(bondRepayments)
      .where(
        and(
          eq(bondRepayments.holding_id, holdingId),
          eq(bondRepayments.user_id, userId)
        )
      )
      .orderBy(asc(bondRepayments.scheduled_date));

    return sendSuccess(res, repayments, 'Repayments retrieved successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Get all repayments for a specific security
 */
export async function getRepaymentsBySecurity(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const securityId = parseInt(req.params.securityId);

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    const repayments = await db
      .select()
      .from(bondRepayments)
      .where(
        and(
          eq(bondRepayments.security_id, securityId),
          eq(bondRepayments.user_id, userId)
        )
      )
      .orderBy(asc(bondRepayments.scheduled_date));

    return sendSuccess(res, repayments, 'Repayments retrieved successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Create bond repayment record
 */
export async function createBondRepayment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const repaymentData: BondRepaymentCreateDTO = req.body;

    // Verify holding belongs to user
    const [holding] = await db
      .select()
      .from(userSecurityHoldings)
      .where(
        and(
          eq(userSecurityHoldings.holding_id, repaymentData.holding_id),
          eq(userSecurityHoldings.user_id, userId),
          eq(userSecurityHoldings.security_id, repaymentData.security_id)
        )
      )
      .limit(1);

    if (!holding) {
      throw new ApiError(404, 'Holding not found or does not belong to user');
    }

    // Determine payment status if not provided
    let paymentStatus: 'scheduled' | 'paid' | 'overdue' | 'missed' = repaymentData.payment_status || 'scheduled';
    
    if (repaymentData.actual_payment_date) {
      paymentStatus = 'paid';
    } else {
      const scheduledDate = new Date(repaymentData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scheduledDate.setHours(0, 0, 0, 0);
      const daysPastDue = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPastDue > 30) {
        paymentStatus = 'missed';
      } else if (daysPastDue > 0) {
        paymentStatus = 'overdue';
      }
    }

    const [newRepayment] = await db
      .insert(bondRepayments)
      .values({
        user_id: userId,
        holding_id: repaymentData.holding_id,
        security_id: repaymentData.security_id,
        repayment_type: repaymentData.repayment_type,
        scheduled_date: repaymentData.scheduled_date,
        scheduled_amount: repaymentData.scheduled_amount.toString(),
        actual_payment_date: repaymentData.actual_payment_date || null,
        actual_amount: repaymentData.actual_amount ? repaymentData.actual_amount.toString() : null,
        payment_status: paymentStatus,
        coupon_period_start: repaymentData.coupon_period_start || null,
        coupon_period_end: repaymentData.coupon_period_end || null,
        notes: repaymentData.notes || null
      })
      .returning();

    return sendCreated(res, newRepayment, 'Bond repayment created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Generate repayment schedule from bond details
 */
export async function generateRepaymentSchedule(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const scheduleDTO: BondRepaymentScheduleDTO = req.body;

    // Verify holding belongs to user
    const [holding] = await db
      .select()
      .from(userSecurityHoldings)
      .where(
        and(
          eq(userSecurityHoldings.holding_id, scheduleDTO.holding_id),
          eq(userSecurityHoldings.user_id, userId),
          eq(userSecurityHoldings.security_id, scheduleDTO.security_id)
        )
      )
      .limit(1);

    if (!holding) {
      throw new ApiError(404, 'Holding not found or does not belong to user');
    }

    // Verify bond details exist
    const [bond] = await db
      .select()
      .from(bondDetails)
      .where(eq(bondDetails.security_id, scheduleDTO.security_id))
      .limit(1);

    if (!bond) {
      throw new ApiError(404, 'Bond details not found for this security');
    }

    const createdCount = await generateAndSaveRepaymentSchedule(scheduleDTO, userId);

    return sendCreated(
      res,
      { created_count: createdCount },
      `Repayment schedule generated successfully. Created ${createdCount} repayment records.`
    );
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      throw new ApiError(409, error.message);
    }
    throw error;
  }
}

/**
 * Update bond repayment
 */
export async function updateBondRepayment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const repaymentId = parseInt(req.params.repaymentId);
    const updateData: BondRepaymentUpdateDTO = req.body;

    if (isNaN(repaymentId)) {
      throw new ApiError(400, 'Invalid repayment ID');
    }

    // Check if repayment exists and belongs to user
    const [existing] = await db
      .select()
      .from(bondRepayments)
      .where(
        and(
          eq(bondRepayments.repayment_id, repaymentId),
          eq(bondRepayments.user_id, userId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Bond repayment not found');
    }

    // Determine payment status if actual_payment_date is being set
    let paymentStatus = updateData.payment_status || existing.payment_status;
    
    if (updateData.actual_payment_date) {
      paymentStatus = 'paid';
    } else if (updateData.payment_status) {
      paymentStatus = updateData.payment_status;
    } else if (!existing.actual_payment_date) {
      // Auto-update status based on dates if not manually set
      const scheduledDate = new Date(updateData.scheduled_date || existing.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scheduledDate.setHours(0, 0, 0, 0);
      const daysPastDue = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPastDue > 30) {
        paymentStatus = 'missed';
      } else if (daysPastDue > 0) {
        paymentStatus = 'overdue';
      } else {
        paymentStatus = 'scheduled';
      }
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date(),
      payment_status: paymentStatus
    };

    if (updateData.scheduled_date !== undefined) updateValues.scheduled_date = updateData.scheduled_date;
    if (updateData.scheduled_amount !== undefined) updateValues.scheduled_amount = updateData.scheduled_amount.toString();
    if (updateData.actual_payment_date !== undefined) {
      updateValues.actual_payment_date = updateData.actual_payment_date || null;
      if (updateData.actual_payment_date) {
        updateValues.payment_status = 'paid';
      }
    }
    if (updateData.actual_amount !== undefined) updateValues.actual_amount = updateData.actual_amount ? updateData.actual_amount.toString() : null;
    if (updateData.coupon_period_start !== undefined) updateValues.coupon_period_start = updateData.coupon_period_start || null;
    if (updateData.coupon_period_end !== undefined) updateValues.coupon_period_end = updateData.coupon_period_end || null;
    if (updateData.notes !== undefined) updateValues.notes = updateData.notes || null;

    const [updatedRepayment] = await db
      .update(bondRepayments)
      .set(updateValues)
      .where(eq(bondRepayments.repayment_id, repaymentId))
      .returning();

    // Update payment status if needed
    await updatePaymentStatus(repaymentId);

    return sendSuccess(res, updatedRepayment, 'Bond repayment updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete bond repayment
 */
export async function deleteBondRepayment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const repaymentId = parseInt(req.params.repaymentId);

    if (isNaN(repaymentId)) {
      throw new ApiError(400, 'Invalid repayment ID');
    }

    // Check if repayment exists and belongs to user
    const [existing] = await db
      .select()
      .from(bondRepayments)
      .where(
        and(
          eq(bondRepayments.repayment_id, repaymentId),
          eq(bondRepayments.user_id, userId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Bond repayment not found');
    }

    await db
      .delete(bondRepayments)
      .where(eq(bondRepayments.repayment_id, repaymentId));

    return sendSuccess(res, null, 'Bond repayment deleted successfully');
  } catch (error) {
    throw error;
  }
}

