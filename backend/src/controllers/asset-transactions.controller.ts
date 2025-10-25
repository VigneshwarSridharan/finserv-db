import { Request, Response } from 'express';
import { db } from '../config/database';
import { assetTransactions, userAssets } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated, sendBadRequest } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildSortClause, combineFilters, buildFilterCondition, buildDateRangeFilter } from '../utils/query-helpers';
import { validateBulkItems, processBulkOperation, BulkOperationResult } from '../utils/bulk-processor';
import { z } from 'zod';
import { AuthRequest } from '../types';

// Validation schema for asset transaction
const assetTransactionSchema = z.object({
  asset_id: z.number().int().positive(),
  transaction_type: z.enum(['purchase', 'sale', 'transfer', 'gift', 'inheritance', 'valuation_update']),
  transaction_date: z.string(),
  quantity: z.string().or(z.number()),
  price_per_unit: z.string().or(z.number()),
  total_amount: z.string().or(z.number()),
  transaction_fees: z.string().or(z.number()).optional(),
  net_amount: z.string().or(z.number()),
  counterparty: z.string().optional(),
  transaction_reference: z.string().optional(),
  notes: z.string().optional()
});

/**
 * List asset transactions with filtering and pagination
 */
export async function listAssetTransactions(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { page, limit, sortBy, sortOrder, asset_id, transaction_type, start_date, end_date } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters
  const filters = combineFilters([
    eq(assetTransactions.user_id, userId),
    buildFilterCondition(assetTransactions.asset_id, asset_id ? Number(asset_id) : undefined),
    buildFilterCondition(assetTransactions.transaction_type, transaction_type as string),
    buildDateRangeFilter(assetTransactions.transaction_date, start_date as string, end_date as string)
  ]);

  // Build sort
  const sortClause = buildSortClause(
    { sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' },
    {
      transaction_date: assetTransactions.transaction_date,
      total_amount: assetTransactions.total_amount,
      created_at: assetTransactions.created_at
    },
    assetTransactions.transaction_date
  );

  // Query with asset info
  const [items, countResult] = await Promise.all([
    db.select({
      transaction: assetTransactions,
      asset: {
        asset_id: userAssets.asset_id,
        asset_name: userAssets.asset_name
      }
    })
      .from(assetTransactions)
      .leftJoin(userAssets, eq(assetTransactions.asset_id, userAssets.asset_id))
      .where(filters)
      .orderBy(sortClause!)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(assetTransactions)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  const formattedItems = items.map(item => ({
    ...item.transaction,
    asset: item.asset
  }));

  return sendPaginated(res, formattedItems, pagination, 'Asset transactions retrieved successfully');
}

/**
 * Get asset transaction by ID
 */
export async function getAssetTransactionById(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [result] = await db.select({
    transaction: assetTransactions,
    asset: userAssets
  })
    .from(assetTransactions)
    .leftJoin(userAssets, eq(assetTransactions.asset_id, userAssets.asset_id))
    .where(
      and(
        eq(assetTransactions.transaction_id, Number(id)),
        eq(assetTransactions.user_id, userId)
      )
    )
    .limit(1);

  if (!result) {
    return sendNotFound(res, 'Asset transaction not found');
  }

  return sendSuccess(res, {
    ...result.transaction,
    asset: result.asset
  }, 'Asset transaction retrieved successfully');
}

/**
 * Create single asset transaction
 */
export async function createAssetTransaction(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    asset_id,
    transaction_type,
    transaction_date,
    quantity,
    price_per_unit,
    total_amount,
    transaction_fees,
    net_amount,
    counterparty,
    transaction_reference,
    notes
  } = req.body;

  // Verify asset ownership
  const [asset] = await db.select()
    .from(userAssets)
    .where(
      and(
        eq(userAssets.asset_id, Number(asset_id)),
        eq(userAssets.user_id, userId)
      )
    )
    .limit(1);

  if (!asset) {
    return sendNotFound(res, 'Asset not found');
  }

  const [newTransaction] = await db.insert(assetTransactions)
    .values({
      user_id: userId,
      asset_id,
      transaction_type,
      transaction_date,
      quantity,
      price_per_unit,
      total_amount,
      transaction_fees: transaction_fees || '0',
      net_amount,
      counterparty,
      transaction_reference,
      notes
    })
    .returning();

  return sendCreated(res, newTransaction, 'Asset transaction created successfully');
}

/**
 * Update asset transaction
 */
export async function updateAssetTransaction(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(assetTransactions)
    .set(req.body)
    .where(
      and(
        eq(assetTransactions.transaction_id, Number(id)),
        eq(assetTransactions.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Asset transaction not found');
  }

  return sendSuccess(res, updated, 'Asset transaction updated successfully');
}

/**
 * Delete asset transaction
 */
export async function deleteAssetTransaction(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(assetTransactions)
    .where(
      and(
        eq(assetTransactions.transaction_id, Number(id)),
        eq(assetTransactions.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Asset transaction not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Asset transaction deleted successfully');
}

/**
 * Bulk import asset transactions
 */
export async function bulkImportAssetTransactions(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { transactions } = req.body;

  if (!Array.isArray(transactions)) {
    return sendBadRequest(res, 'Transactions must be an array');
  }

  // Validate all transactions
  const validation = validateBulkItems(transactions, assetTransactionSchema, { maxItems: 1000 });

  if (!validation.valid) {
    return sendBadRequest(res, 'Validation failed', validation.errors);
  }

  // Process bulk insert
  const result: BulkOperationResult<any> = await processBulkOperation(
    validation.validatedItems,
    async (transaction) => {
      // Verify asset exists and belongs to user
      const [asset] = await db.select()
        .from(userAssets)
        .where(
          and(
            eq(userAssets.asset_id, transaction.asset_id),
            eq(userAssets.user_id, userId)
          )
        )
        .limit(1);

      if (!asset) {
        throw new Error(`Asset with ID ${transaction.asset_id} not found`);
      }

      const [inserted] = await db.insert(assetTransactions)
        .values({
          user_id: userId,
          ...transaction,
          transaction_fees: transaction.transaction_fees || '0'
        })
        .returning();

      return inserted;
    },
    { continueOnError: true }
  );

  return sendSuccess(res, result, 'Bulk import completed');
}

/**
 * Get transaction summary for an asset
 */
export async function getAssetTransactionSummary(req: AuthRequest, res: Response) {
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

  const summary = await db.select({
    transaction_type: assetTransactions.transaction_type,
    transaction_count: sql<number>`count(*)::int`,
    total_amount: sql<string>`sum(${assetTransactions.total_amount})`,
    total_quantity: sql<string>`sum(${assetTransactions.quantity})`
  })
    .from(assetTransactions)
    .where(
      and(
        eq(assetTransactions.asset_id, Number(assetId)),
        eq(assetTransactions.user_id, userId)
      )
    )
    .groupBy(assetTransactions.transaction_type);

  return sendSuccess(res, summary, 'Transaction summary retrieved successfully');
}

