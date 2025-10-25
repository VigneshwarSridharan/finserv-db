import { Request, Response } from 'express';
import { db } from '../config/database';
import { assetValuations, userAssets } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildDateRangeFilter, combineFilters } from '../utils/query-helpers';
import { AuthRequest } from '../types';

/**
 * Get valuation history for an asset
 */
export async function getAssetValuations(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { assetId } = req.params;
  const { page, limit, start_date, end_date } = req.query;

  // Verify asset ownership
  const [asset] = await db.select()
    .from(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(assetId)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!asset) {
    return sendNotFound(res, 'Asset not found');
  }

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters
  const filters = combineFilters([
    eq(assetValuations.asset_id, Number(assetId)),
    buildDateRangeFilter(assetValuations.valuation_date, start_date as string, end_date as string)
  ]);

  // Query valuations
  const [items, countResult] = await Promise.all([
    db.select()
      .from(assetValuations)
      .where(filters)
      .orderBy(desc(assetValuations.valuation_date))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(assetValuations)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  return sendPaginated(res, items, pagination, 'Asset valuations retrieved successfully');
}

/**
 * Get latest valuation for an asset
 */
export async function getLatestValuation(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { assetId } = req.params;

  // Verify asset ownership
  const [asset] = await db.select()
    .from(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(assetId)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!asset) {
    return sendNotFound(res, 'Asset not found');
  }

  const [latestValuation] = await db.select()
    .from(assetValuations)
    .where(eq(assetValuations.asset_id, Number(assetId)))
    .orderBy(desc(assetValuations.valuation_date))
    .limit(1);

  if (!latestValuation) {
    return sendNotFound(res, 'No valuations found for this asset');
  }

  return sendSuccess(res, latestValuation, 'Latest valuation retrieved successfully');
}

/**
 * Add a new valuation
 */
export async function addValuation(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { assetId } = req.params;

  // Verify asset ownership
  const [asset] = await db.select()
    .from(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(assetId)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!asset) {
    return sendNotFound(res, 'Asset not found');
  }

  const {
    valuation_date,
    valuation_amount,
    valuation_method,
    valuation_source,
    notes
  } = req.body;

  const [newValuation] = await db.insert(assetValuations)
    .values({
      asset_id: Number(assetId),
      valuation_date,
      valuation_amount,
      valuation_method,
      valuation_source,
      notes
    })
    .returning();

  // Update asset current_value
  await db.update(userAssets)
    .set({ current_value: valuation_amount })
    .where(eq(userAssets.asset_id, Number(assetId)));

  return sendCreated(res, newValuation, 'Valuation added successfully');
}

/**
 * Update a valuation
 */
export async function updateValuation(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { assetId, valuationId } = req.params;

  // Verify asset ownership
  const [asset] = await db.select()
    .from(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(assetId)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!asset) {
    return sendNotFound(res, 'Asset not found');
  }

  const [updated] = await db.update(assetValuations)
    .set(req.body)
    .where(
      and(
        eq(assetValuations.valuation_id, Number(valuationId)),
        eq(assetValuations.asset_id, Number(assetId))
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Valuation not found');
  }

  return sendSuccess(res, updated, 'Valuation updated successfully');
}

/**
 * Delete a valuation
 */
export async function deleteValuation(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { assetId, valuationId } = req.params;

  // Verify asset ownership
  const [asset] = await db.select()
    .from(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(assetId)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!asset) {
    return sendNotFound(res, 'Asset not found');
  }

  const [deleted] = await db.delete(assetValuations)
    .where(
      and(
        eq(assetValuations.valuation_id, Number(valuationId)),
        eq(assetValuations.asset_id, Number(assetId))
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Valuation not found');
  }

  return sendSuccess(res, { id: Number(valuationId) }, 'Valuation deleted successfully');
}

