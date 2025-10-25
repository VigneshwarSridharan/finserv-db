import { Request, Response } from 'express';
import { db } from '../config/database';
import { assetCategories, assetSubcategories } from '../db/schema';
import { eq, and, like, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildSortClause, combineFilters, buildFilterCondition } from '../utils/query-helpers';

/**
 * Get all asset categories with optional filtering
 */
export async function listAssetCategories(req: Request, res: Response) {
  const { page, limit, sortBy, sortOrder, category_type, search, is_active } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters
  const filters = combineFilters([
    buildFilterCondition(assetCategories.category_type, category_type as string),
    buildFilterCondition(assetCategories.is_active, is_active === 'true'),
    search ? like(assetCategories.category_name, `%${search}%`) : undefined
  ]);

  // Build sort
  const sortClause = buildSortClause(
    { sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' },
    {
      category_name: assetCategories.category_name,
      category_type: assetCategories.category_type,
      created_at: assetCategories.created_at
    },
    assetCategories.category_name
  );

  // Query with count
  const [items, countResult] = await Promise.all([
    db.select()
      .from(assetCategories)
      .where(filters)
      .orderBy(sortClause!)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(assetCategories)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  return sendPaginated(res, items, pagination, 'Asset categories retrieved successfully');
}

/**
 * Get asset category by ID with subcategories
 */
export async function getAssetCategoryById(req: Request, res: Response) {
  const { id } = req.params;

  const [category] = await db.select()
    .from(assetCategories)
    .where(eq(assetCategories.category_id, Number(id)))
    .limit(1);

  if (!category) {
    return sendNotFound(res, 'Asset category not found');
  }

  // Get subcategories
  const subcategories = await db.select()
    .from(assetSubcategories)
    .where(eq(assetSubcategories.category_id, Number(id)));

  return sendSuccess(res, { ...category, subcategories }, 'Asset category retrieved successfully');
}

/**
 * Create new asset category
 */
export async function createAssetCategory(req: Request, res: Response) {
  const { category_name, category_type, description, is_active } = req.body;

  const [newCategory] = await db.insert(assetCategories)
    .values({
      category_name,
      category_type,
      description,
      is_active: is_active ?? true
    })
    .returning();

  return sendCreated(res, newCategory, 'Asset category created successfully');
}

/**
 * Update asset category
 */
export async function updateAssetCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { category_name, category_type, description, is_active } = req.body;

  const [updated] = await db.update(assetCategories)
    .set({
      category_name,
      category_type,
      description,
      is_active
    })
    .where(eq(assetCategories.category_id, Number(id)))
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Asset category not found');
  }

  return sendSuccess(res, updated, 'Asset category updated successfully');
}

/**
 * Delete asset category
 */
export async function deleteAssetCategory(req: Request, res: Response) {
  const { id } = req.params;

  const [deleted] = await db.delete(assetCategories)
    .where(eq(assetCategories.category_id, Number(id)))
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Asset category not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Asset category deleted successfully');
}

/**
 * Get all subcategories for a category
 */
export async function listSubcategories(req: Request, res: Response) {
  const { categoryId } = req.params;

  const subcategories = await db.select()
    .from(assetSubcategories)
    .where(eq(assetSubcategories.category_id, Number(categoryId)));

  return sendSuccess(res, subcategories, 'Subcategories retrieved successfully');
}

/**
 * Create subcategory
 */
export async function createSubcategory(req: Request, res: Response) {
  const { categoryId } = req.params;
  const { subcategory_name, description, is_active } = req.body;

  const [newSubcategory] = await db.insert(assetSubcategories)
    .values({
      category_id: Number(categoryId),
      subcategory_name,
      description,
      is_active: is_active ?? true
    })
    .returning();

  return sendCreated(res, newSubcategory, 'Subcategory created successfully');
}

/**
 * Update subcategory
 */
export async function updateSubcategory(req: Request, res: Response) {
  const { categoryId, subcategoryId } = req.params;
  const { subcategory_name, description, is_active } = req.body;

  const [updated] = await db.update(assetSubcategories)
    .set({
      subcategory_name,
      description,
      is_active
    })
    .where(
      and(
        eq(assetSubcategories.subcategory_id, Number(subcategoryId)),
        eq(assetSubcategories.category_id, Number(categoryId))
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Subcategory not found');
  }

  return sendSuccess(res, updated, 'Subcategory updated successfully');
}

/**
 * Delete subcategory
 */
export async function deleteSubcategory(req: Request, res: Response) {
  const { categoryId, subcategoryId } = req.params;

  const [deleted] = await db.delete(assetSubcategories)
    .where(
      and(
        eq(assetSubcategories.subcategory_id, Number(subcategoryId)),
        eq(assetSubcategories.category_id, Number(categoryId))
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Subcategory not found');
  }

  return sendSuccess(res, { id: Number(subcategoryId) }, 'Subcategory deleted successfully');
}

