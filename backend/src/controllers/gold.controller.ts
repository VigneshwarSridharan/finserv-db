import { Request, Response } from 'express';
import { db } from '../config/database';
import { goldDetails, userAssets } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response-formatter';
import { AuthRequest } from '../types';

/**
 * Get gold details for an asset
 */
export async function getGoldDetails(req: AuthRequest, res: Response) {
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

  const [details] = await db.select()
    .from(goldDetails)
    .where(eq(goldDetails.asset_id, Number(assetId)))
    .limit(1);

  if (!details) {
    return sendNotFound(res, 'Gold details not found');
  }

  return sendSuccess(res, details, 'Gold details retrieved successfully');
}

/**
 * Add gold details to an asset
 */
export async function addGoldDetails(req: AuthRequest, res: Response) {
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
    gold_type,
    purity,
    weight_grams,
    making_charges,
    wastage_charges,
    hallmark_certificate,
    jeweler_name,
    purchase_bill_number,
    current_gold_rate_per_gram
  } = req.body;

  const [newDetails] = await db.insert(goldDetails)
    .values({
      asset_id: Number(assetId),
      gold_type,
      purity,
      weight_grams,
      making_charges,
      wastage_charges,
      hallmark_certificate,
      jeweler_name,
      purchase_bill_number,
      current_gold_rate_per_gram
    })
    .returning();

  return sendCreated(res, newDetails, 'Gold details added successfully');
}

/**
 * Update gold details
 */
export async function updateGoldDetails(req: AuthRequest, res: Response) {
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

  const [updated] = await db.update(goldDetails)
    .set(req.body)
    .where(eq(goldDetails.asset_id, Number(assetId)))
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Gold details not found');
  }

  return sendSuccess(res, updated, 'Gold details updated successfully');
}

/**
 * Delete gold details
 */
export async function deleteGoldDetails(req: AuthRequest, res: Response) {
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

  const [deleted] = await db.delete(goldDetails)
    .where(eq(goldDetails.asset_id, Number(assetId)))
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Gold details not found');
  }

  return sendSuccess(res, { asset_id: Number(assetId) }, 'Gold details deleted successfully');
}

