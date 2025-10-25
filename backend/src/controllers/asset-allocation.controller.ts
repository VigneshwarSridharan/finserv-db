import { Request, Response } from 'express';
import { db } from '../config/database';
import { assetAllocationTargets, portfolioSummary } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response-formatter';
import { AuthRequest } from '../types';

/**
 * Get asset allocation targets vs current allocation
 */
export async function getAssetAllocation(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Get allocation targets
  const targets = await db.select()
    .from(assetAllocationTargets)
    .where(
      and(
        eq(assetAllocationTargets.user_id, userId),
        eq(assetAllocationTargets.is_active, true)
      )
    );

  // Get current portfolio summary for actual allocation
  const currentAllocation = await db.select()
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId));

  // Calculate total portfolio value
  const totalValue = currentAllocation.reduce((sum, item) => sum + Number(item.current_value), 0);

  // Map targets with current values
  const allocationComparison = targets.map(target => {
    const current = currentAllocation.find(c => 
      c.asset_type.toLowerCase().includes(target.asset_type.toLowerCase())
    );
    
    const currentValue = current ? Number(current.current_value) : 0;
    const currentPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
    const variance = currentPercentage - Number(target.target_percentage);
    const isWithinTolerance = Math.abs(variance) <= Number(target.tolerance_band);

    return {
      ...target,
      current_value: currentValue,
      current_percentage: currentPercentage,
      variance_percentage: variance,
      is_within_tolerance: isWithinTolerance,
      rebalance_required: !isWithinTolerance
    };
  });

  return sendSuccess(res, {
    total_portfolio_value: totalValue,
    allocations: allocationComparison
  }, 'Asset allocation retrieved successfully');
}

/**
 * Get rebalancing suggestions
 */
export async function getRebalanceSuggestions(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Get allocation targets
  const targets = await db.select()
    .from(assetAllocationTargets)
    .where(
      and(
        eq(assetAllocationTargets.user_id, userId),
        eq(assetAllocationTargets.is_active, true)
      )
    );

  // Get current portfolio summary
  const currentAllocation = await db.select()
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId));

  // Calculate total portfolio value
  const totalValue = currentAllocation.reduce((sum, item) => sum + Number(item.current_value), 0);

  // Generate rebalancing suggestions
  const suggestions = targets
    .map(target => {
      const current = currentAllocation.find(c => 
        c.asset_type.toLowerCase().includes(target.asset_type.toLowerCase())
      );
      
      const currentValue = current ? Number(current.current_value) : 0;
      const currentPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      const targetPercentage = Number(target.target_percentage);
      const variance = currentPercentage - targetPercentage;
      const isWithinTolerance = Math.abs(variance) <= Number(target.tolerance_band);

      if (isWithinTolerance) {
        return null;
      }

      const targetValue = (targetPercentage / 100) * totalValue;
      const amountToAdjust = targetValue - currentValue;
      const action = amountToAdjust > 0 ? 'buy' : 'sell';

      return {
        asset_type: target.asset_type,
        current_value: currentValue,
        current_percentage: currentPercentage,
        target_percentage: targetPercentage,
        target_value: targetValue,
        variance_percentage: variance,
        amount_to_adjust: Math.abs(amountToAdjust),
        action,
        priority: Math.abs(variance) > Number(target.tolerance_band) * 2 ? 'high' : 'medium'
      };
    })
    .filter(s => s !== null);

  return sendSuccess(res, {
    total_portfolio_value: totalValue,
    rebalance_required: suggestions.length > 0,
    suggestions
  }, 'Rebalancing suggestions generated successfully');
}

/**
 * Create allocation target
 */
export async function createAllocationTarget(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    asset_type,
    target_percentage,
    tolerance_band
  } = req.body;

  const [newTarget] = await db.insert(assetAllocationTargets)
    .values({
      user_id: userId,
      asset_type,
      target_percentage,
      tolerance_band: tolerance_band || '5.00'
    })
    .returning();

  return sendCreated(res, newTarget, 'Allocation target created successfully');
}

/**
 * Update allocation target
 */
export async function updateAllocationTarget(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(assetAllocationTargets)
    .set({
      ...req.body,
      updated_at: new Date()
    })
    .where(
      and(
        eq(assetAllocationTargets.allocation_id, Number(id)),
        eq(assetAllocationTargets.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Allocation target not found');
  }

  return sendSuccess(res, updated, 'Allocation target updated successfully');
}

/**
 * Delete allocation target
 */
export async function deleteAllocationTarget(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(assetAllocationTargets)
    .where(
      and(
        eq(assetAllocationTargets.allocation_id, Number(id)),
        eq(assetAllocationTargets.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Allocation target not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Allocation target deleted successfully');
}

