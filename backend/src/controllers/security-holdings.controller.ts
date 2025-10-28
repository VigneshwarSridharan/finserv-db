import { Response } from 'express';
import { eq, and, sql, sum, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { userSecurityHoldings, vSecurityHoldings, securityTransactions } from '../db/schema';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess, sendList } from '../utils/response-formatter';

/**
 * Get all security holdings for authenticated user (with view data)
 */
export async function getSecurityHoldings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // Fetch from view which includes calculated P&L and returns
    const holdings = await db
      .select()
      .from(vSecurityHoldings)
      .where(eq(vSecurityHoldings.user_id, userId));

    return sendList(res, holdings);
  } catch (error) {
    throw error;
  }
}

/**
 * Get holding by ID with details
 */
export async function getHoldingById(req: AuthRequest, res: Response) {
  try {
    const holdingId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(holdingId)) {
      throw new ApiError(400, 'Invalid holding ID');
    }

    // Get from base table first to check ownership
    const holding = await db
      .select()
      .from(userSecurityHoldings)
      .where(eq(userSecurityHoldings.holding_id, holdingId))
      .limit(1);

    if (holding.length === 0) {
      throw new ApiError(404, 'Holding not found');
    }

    // Check ownership
    if (holding[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this holding');
    }

    // Get from view for enriched data
    const holdingView = await db
      .select()
      .from(vSecurityHoldings)
      .where(
        and(
          eq(vSecurityHoldings.user_id, userId),
          sql`${vSecurityHoldings.user_id} IN (
            SELECT user_id FROM user_security_holdings WHERE holding_id = ${holdingId}
          )`
        )
      )
      .limit(1);

    if (holdingView.length > 0) {
      return sendSuccess(res, holdingView[0]);
    }

    return sendSuccess(res, holding[0]);
  } catch (error) {
    throw error;
  }
}

/**
 * Get holdings summary aggregated by sector/type
 */
export async function getHoldingsSummary(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { groupBy = 'sector' } = req.query;

    let groupByField: any;
    if (groupBy === 'sector') {
      groupByField = vSecurityHoldings.sector;
    } else if (groupBy === 'security_type') {
      groupByField = vSecurityHoldings.security_type;
    } else if (groupBy === 'exchange') {
      groupByField = vSecurityHoldings.exchange;
    } else {
      groupByField = vSecurityHoldings.sector;
    }

    const summary = await db
      .select({
        group: groupByField,
        total_investment: sql<string>`SUM(CAST(${vSecurityHoldings.total_investment} AS NUMERIC))`,
        current_value: sql<string>`SUM(CAST(${vSecurityHoldings.current_value} AS NUMERIC))`,
        unrealized_pnl: sql<string>`SUM(CAST(${vSecurityHoldings.unrealized_pnl} AS NUMERIC))`,
        count: sql<number>`COUNT(*)`
      })
      .from(vSecurityHoldings)
      .where(eq(vSecurityHoldings.user_id, userId))
      .groupBy(groupByField);

    return sendSuccess(res, summary);
  } catch (error) {
    throw error;
  }
}

/**
 * Update current price for a holding
 */
export async function updateHoldingCurrentPrice(req: AuthRequest, res: Response) {
  try {
    const holdingId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const { current_price } = req.body;

    if (isNaN(holdingId)) {
      throw new ApiError(400, 'Invalid holding ID');
    }

    if (!current_price || current_price <= 0) {
      throw new ApiError(400, 'Valid current_price is required');
    }

    // Check if holding exists and belongs to user
    const existing = await db
      .select()
      .from(userSecurityHoldings)
      .where(eq(userSecurityHoldings.holding_id, holdingId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Holding not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this holding');
    }

    // Update current price (calculated fields will be updated via generated columns)
    const updated = await db
      .update(userSecurityHoldings)
      .set({
        current_price: current_price.toString(),
        updated_at: new Date()
      })
      .where(eq(userSecurityHoldings.holding_id, holdingId))
      .returning();

    return sendSuccess(res, updated[0], 'Current price updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete holding
 */
export async function deleteHolding(req: AuthRequest, res: Response) {
  try {
    const holdingId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(holdingId)) {
      throw new ApiError(400, 'Invalid holding ID');
    }

    // Check if holding exists and belongs to user
    const existing = await db
      .select()
      .from(userSecurityHoldings)
      .where(eq(userSecurityHoldings.holding_id, holdingId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Holding not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this holding');
    }

    // Delete holding
    await db
      .delete(userSecurityHoldings)
      .where(eq(userSecurityHoldings.holding_id, holdingId));

    return sendSuccess(res, null, 'Holding deleted successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Get all transactions for a specific holding
 */
export async function getHoldingTransactions(req: AuthRequest, res: Response) {
  try {
    const holdingId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(holdingId)) {
      throw new ApiError(400, 'Invalid holding ID');
    }

    // First, verify the holding exists and belongs to the user
    const holding = await db
      .select()
      .from(userSecurityHoldings)
      .where(eq(userSecurityHoldings.holding_id, holdingId))
      .limit(1);

    if (holding.length === 0) {
      throw new ApiError(404, 'Holding not found');
    }

    if (holding[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this holding');
    }

    // Get all transactions for this holding (matching user, account, and security)
    const transactions = await db
      .select()
      .from(securityTransactions)
      .where(
        and(
          eq(securityTransactions.user_id, holding[0].user_id),
          eq(securityTransactions.account_id, holding[0].account_id),
          eq(securityTransactions.security_id, holding[0].security_id)
        )
      )
      .orderBy(desc(securityTransactions.transaction_date));

    return sendList(res, transactions);
  } catch (error) {
    throw error;
  }
}

