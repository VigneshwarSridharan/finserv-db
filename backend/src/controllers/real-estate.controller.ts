import { Request, Response } from 'express';
import { db } from '../config/database';
import { realEstateDetails, userAssets } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response-formatter';
import { AuthRequest } from '../types';

/**
 * Get real estate details for an asset
 */
export async function getRealEstateDetails(req: AuthRequest, res: Response) {
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
    .from(realEstateDetails)
    .where(eq(realEstateDetails.asset_id, Number(assetId)))
    .limit(1);

  if (!details) {
    return sendNotFound(res, 'Real estate details not found');
  }

  return sendSuccess(res, details, 'Real estate details retrieved successfully');
}

/**
 * Add real estate details to an asset
 */
export async function addRealEstateDetails(req: AuthRequest, res: Response) {
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
    property_type,
    property_address,
    city,
    state,
    pincode,
    area_sqft,
    built_up_area_sqft,
    year_built,
    floors,
    bedrooms,
    bathrooms,
    parking_spaces,
    registration_number,
    registration_date,
    property_tax_number,
    maintenance_charges,
    rental_income,
    rental_yield,
    occupancy_status
  } = req.body;

  const [newDetails] = await db.insert(realEstateDetails)
    .values({
      asset_id: Number(assetId),
      property_type,
      property_address,
      city,
      state,
      pincode,
      area_sqft,
      built_up_area_sqft,
      year_built,
      floors,
      bedrooms,
      bathrooms,
      parking_spaces,
      registration_number,
      registration_date,
      property_tax_number,
      maintenance_charges,
      rental_income,
      rental_yield,
      occupancy_status
    })
    .returning();

  return sendCreated(res, newDetails, 'Real estate details added successfully');
}

/**
 * Update real estate details
 */
export async function updateRealEstateDetails(req: AuthRequest, res: Response) {
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

  const [updated] = await db.update(realEstateDetails)
    .set(req.body)
    .where(eq(realEstateDetails.asset_id, Number(assetId)))
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Real estate details not found');
  }

  return sendSuccess(res, updated, 'Real estate details updated successfully');
}

/**
 * Delete real estate details
 */
export async function deleteRealEstateDetails(req: AuthRequest, res: Response) {
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

  const [deleted] = await db.delete(realEstateDetails)
    .where(eq(realEstateDetails.asset_id, Number(assetId)))
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Real estate details not found');
  }

  return sendSuccess(res, { asset_id: Number(assetId) }, 'Real estate details deleted successfully');
}

