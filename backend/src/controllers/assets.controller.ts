import { Request, Response } from 'express';
import { db } from '../config/database';
import { userAssets, assetCategories, assetSubcategories, realEstateDetails, goldDetails } from '../db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated, sendNoContent } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildSortClause, combineFilters, buildFilterCondition, buildDateRangeFilter } from '../utils/query-helpers';
import { AuthRequest } from '../types';

/**
 * List user assets with filtering, sorting, and pagination
 */
export async function listAssets(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { page, limit, sortBy, sortOrder, category_id, subcategory_id, is_active, start_date, end_date } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters - only add filter if parameter is provided
  const filters = combineFilters([
    eq(userAssets.user_id, userId),
    category_id ? buildFilterCondition(userAssets.category_id, Number(category_id)) : undefined,
    subcategory_id ? buildFilterCondition(userAssets.subcategory_id, Number(subcategory_id)) : undefined,
    is_active !== undefined ? buildFilterCondition(userAssets.is_active, is_active === 'true') : undefined,
    buildDateRangeFilter(userAssets.purchase_date, start_date as string, end_date as string)
  ]);

  // Build sort
  const sortClause = buildSortClause(
    { sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' },
    {
      asset_name: userAssets.asset_name,
      purchase_date: userAssets.purchase_date,
      purchase_price: userAssets.purchase_price,
      current_value: userAssets.current_value,
      created_at: userAssets.created_at
    },
    userAssets.created_at
  );

  // Query with joins to get category info
  const [items, countResult] = await Promise.all([
    db.select({
      asset: userAssets,
      category: {
        category_id: assetCategories.category_id,
        category_name: assetCategories.category_name,
        category_type: assetCategories.category_type
      },
      subcategory: {
        subcategory_id: assetSubcategories.subcategory_id,
        subcategory_name: assetSubcategories.subcategory_name
      }
    })
      .from(userAssets)
      .leftJoin(assetCategories, eq(userAssets.category_id, assetCategories.category_id))
      .leftJoin(assetSubcategories, eq(userAssets.subcategory_id, assetSubcategories.subcategory_id))
      .where(filters)
      .orderBy(sortClause!)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(userAssets)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  // Calculate returns for each asset
  const assetsWithReturns = items.map(item => {
    const purchasePrice = Number(item.asset.purchase_price);
    const currentValue = item.asset.current_value ? Number(item.asset.current_value) : purchasePrice;
    const returns = currentValue - purchasePrice;
    const returnsPercentage = purchasePrice > 0 ? (returns / purchasePrice) * 100 : 0;

    return {
      ...item.asset,
      category: item.category,
      subcategory: item.subcategory,
      returns,
      returns_percentage: returnsPercentage
    };
  });

  return sendPaginated(res, assetsWithReturns, pagination, 'Assets retrieved successfully');
}

/**
 * Get asset by ID with all details
 */
export async function getAssetById(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [result] = await db.select({
    asset: userAssets,
    category: assetCategories,
    subcategory: assetSubcategories
  })
    .from(userAssets)
    .leftJoin(assetCategories, eq(userAssets.category_id, assetCategories.category_id))
    .leftJoin(assetSubcategories, eq(userAssets.subcategory_id, assetSubcategories.subcategory_id))
    .where(
      and(
        eq(userAssets.asset_id, Number(id)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!result) {
    return sendNotFound(res, 'Asset not found');
  }

  // Get additional details if available
  const [realEstate] = await db.select()
    .from(realEstateDetails)
    .where(eq(realEstateDetails.asset_id, Number(id)))
    .limit(1);

  const [gold] = await db.select()
    .from(goldDetails)
    .where(eq(goldDetails.asset_id, Number(id)))
    .limit(1);

  // Calculate returns
  const purchasePrice = Number(result.asset.purchase_price);
  const currentValue = result.asset.current_value ? Number(result.asset.current_value) : purchasePrice;
  const returns = currentValue - purchasePrice;
  const returnsPercentage = purchasePrice > 0 ? (returns / purchasePrice) * 100 : 0;

  return sendSuccess(res, {
    ...result.asset,
    category: result.category,
    subcategory: result.subcategory,
    real_estate_details: realEstate || null,
    gold_details: gold || null,
    returns,
    returns_percentage: returnsPercentage
  }, 'Asset retrieved successfully');
}

/**
 * Create new asset
 */
export async function createAsset(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const {
    category_id,
    subcategory_id,
    asset_name,
    description,
    purchase_date,
    purchase_price,
    current_value,
    quantity,
    unit,
    location,
    storage_location,
    insurance_policy_number,
    insurance_company,
    insurance_amount,
    insurance_expiry_date,
    is_active
  } = req.body;

  const [newAsset] = await db.insert(userAssets)
    .values({
      user_id: userId,
      category_id,
      subcategory_id,
      asset_name,
      description,
      purchase_date,
      purchase_price,
      current_value,
      quantity,
      unit,
      location,
      storage_location,
      insurance_policy_number,
      insurance_company,
      insurance_amount,
      insurance_expiry_date,
      is_active: is_active ?? true
    })
    .returning();

  return sendCreated(res, newAsset, 'Asset created successfully');
}

/**
 * Update asset
 */
export async function updateAsset(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(userAssets)
    .set({
      ...req.body,
      updated_at: new Date()
    })
    .where(
      and(
        eq(userAssets.asset_id, Number(id)),
        eq(userAssets.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Asset not found');
  }

  return sendSuccess(res, updated, 'Asset updated successfully');
}

/**
 * Delete asset
 */
export async function deleteAsset(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(id)),
        eq(userAssets.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Asset not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Asset deleted successfully');
}

/**
 * Get asset summary statistics
 */
export async function getAssetsSummary(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const summary = await db.select({
    total_assets: sql<number>`count(*)::int`,
    total_investment: sql<string>`sum(${userAssets.purchase_price})`,
    total_current_value: sql<string>`sum(coalesce(${userAssets.current_value}, ${userAssets.purchase_price}))`,
    category_count: sql<number>`count(distinct ${userAssets.category_id})::int`
  })
    .from(userAssets)
    .where(
      and(
        eq(userAssets.user_id, userId),
        eq(userAssets.is_active, true)
      )
    );

  const totalInvestment = Number(summary[0]?.total_investment || 0);
  const totalCurrentValue = Number(summary[0]?.total_current_value || 0);
  const totalReturns = totalCurrentValue - totalInvestment;
  const returnsPercentage = totalInvestment > 0 ? (totalReturns / totalInvestment) * 100 : 0;

  // Get category-wise breakdown
  const categoryBreakdown = await db.select({
    category_id: assetCategories.category_id,
    category_name: assetCategories.category_name,
    category_type: assetCategories.category_type,
    asset_count: sql<number>`count(${userAssets.asset_id})::int`,
    total_investment: sql<string>`sum(${userAssets.purchase_price})`,
    total_current_value: sql<string>`sum(coalesce(${userAssets.current_value}, ${userAssets.purchase_price}))`
  })
    .from(userAssets)
    .leftJoin(assetCategories, eq(userAssets.category_id, assetCategories.category_id))
    .where(
      and(
        eq(userAssets.user_id, userId),
        eq(userAssets.is_active, true)
      )
    )
    .groupBy(assetCategories.category_id, assetCategories.category_name, assetCategories.category_type);

  return sendSuccess(res, {
    summary: {
      total_assets: summary[0]?.total_assets || 0,
      total_investment: totalInvestment,
      total_current_value: totalCurrentValue,
      total_returns: totalReturns,
      returns_percentage: returnsPercentage,
      category_count: summary[0]?.category_count || 0
    },
    category_breakdown: categoryBreakdown.map(cat => ({
      ...cat,
      returns: Number(cat.total_current_value) - Number(cat.total_investment),
      returns_percentage: Number(cat.total_investment) > 0 
        ? ((Number(cat.total_current_value) - Number(cat.total_investment)) / Number(cat.total_investment)) * 100 
        : 0
    }))
  }, 'Asset summary retrieved successfully');
}

