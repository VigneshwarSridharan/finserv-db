import { Response } from 'express';
import { eq, and, sql, desc, sum } from 'drizzle-orm';
import { db } from '../config/database';
import { 
  securityTransactions, 
  userSecurityHoldings, 
  userBrokerAccounts, 
  securities,
  vSecurityTransactions 
} from '../db/schema';
import { AuthRequest, SecurityTransactionCreateDTO, SecurityTransactionUpdateDTO, TransactionQueryParams } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { 
  parsePagination, 
  getPaginationMeta, 
  buildSortClause, 
  combineFilters, 
  buildDateRangeFilter 
} from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response-formatter';
import { validateBulkItems, processBulkOperation, BulkOperationResult } from '../utils/bulk-processor';
import { createSecurityTransactionSchema } from '../middleware/validator';

/**
 * Helper function to update or create holding after transaction
 */
async function updateHoldingForTransaction(
  userId: number,
  accountId: number,
  securityId: number,
  transactionType: string,
  quantity: number,
  price: number,
  transactionDate: string
) {
  // Get existing holding
  const existing = await db
    .select()
    .from(userSecurityHoldings)
    .where(
      and(
        eq(userSecurityHoldings.user_id, userId),
        eq(userSecurityHoldings.account_id, accountId),
        eq(userSecurityHoldings.security_id, securityId)
      )
    )
    .limit(1);

  if (transactionType === 'buy' || transactionType === 'bonus') {
    if (existing.length === 0) {
      // Create new holding
      await db.insert(userSecurityHoldings).values({
        user_id: userId,
        account_id: accountId,
        security_id: securityId,
        quantity: quantity.toString(),
        average_price: price.toString(),
        current_price: price.toString(),
        first_purchase_date: transactionDate,
        last_purchase_date: transactionDate
      });
    } else {
      // Update existing holding
      const currentQty = parseFloat(existing[0].quantity || '0');
      const currentAvgPrice = parseFloat(existing[0].average_price || '0');
      const newQty = currentQty + quantity;
      const newAvgPrice = ((currentQty * currentAvgPrice) + (quantity * price)) / newQty;

      await db
        .update(userSecurityHoldings)
        .set({
          quantity: newQty.toString(),
          average_price: newAvgPrice.toString(),
          last_purchase_date: transactionDate,
          updated_at: new Date()
        })
        .where(eq(userSecurityHoldings.holding_id, existing[0].holding_id));
    }
  } else if (transactionType === 'sell') {
    if (existing.length > 0) {
      const currentQty = parseFloat(existing[0].quantity || '0');
      const newQty = currentQty - quantity;

      if (newQty <= 0) {
        // Delete holding if quantity becomes zero or negative
        await db
          .delete(userSecurityHoldings)
          .where(eq(userSecurityHoldings.holding_id, existing[0].holding_id));
      } else {
        // Update quantity
        await db
          .update(userSecurityHoldings)
          .set({
            quantity: newQty.toString(),
            updated_at: new Date()
          })
          .where(eq(userSecurityHoldings.holding_id, existing[0].holding_id));
      }
    }
  }
}

/**
 * Get all security transactions with filtering and pagination
 */
export async function getSecurityTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      transaction_type,
      account_id,
      security_id,
      startDate,
      endDate
    } = req.query as unknown as TransactionQueryParams;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Build filters
    const filters = [eq(vSecurityTransactions.user_id, userId)];
    
    if (transaction_type) {
      filters.push(eq(vSecurityTransactions.transaction_type, transaction_type as any));
    }
    
    if (account_id) {
      filters.push(sql`${vSecurityTransactions.account_number} IN (
        SELECT account_number FROM user_broker_accounts WHERE account_id = ${parseInt(account_id)}
      )`);
    }
    
    if (security_id) {
      filters.push(sql`${vSecurityTransactions.symbol} IN (
        SELECT symbol FROM securities WHERE security_id = ${parseInt(security_id)}
      )`);
    }

    const dateFilter = buildDateRangeFilter(
      vSecurityTransactions.transaction_date,
      startDate,
      endDate
    );
    
    if (dateFilter) {
      filters.push(dateFilter);
    }

    const whereClause = combineFilters(filters);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(vSecurityTransactions)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data
    const transactions = await db
      .select()
      .from(vSecurityTransactions)
      .where(whereClause)
      .orderBy(desc(vSecurityTransactions.transaction_date))
      .limit(pageSize)
      .offset(offset);

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, transactions, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get transaction by ID with view data
 */
export async function getTransactionById(req: AuthRequest, res: Response) {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(transactionId)) {
      throw new ApiError(400, 'Invalid transaction ID');
    }

    // Get from base table first to check ownership
    const transaction = await db
      .select()
      .from(securityTransactions)
      .where(eq(securityTransactions.transaction_id, transactionId))
      .limit(1);

    if (transaction.length === 0) {
      throw new ApiError(404, 'Transaction not found');
    }

    // Check ownership
    if (transaction[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this transaction');
    }

    // Get from view for enriched data
    const transactionView = await db
      .select()
      .from(vSecurityTransactions)
      .where(eq(vSecurityTransactions.transaction_id, transactionId))
      .limit(1);

    if (transactionView.length > 0) {
      return sendSuccess(res, transactionView[0]);
    }

    return sendSuccess(res, transaction[0]);
  } catch (error) {
    throw error;
  }
}

/**
 * Create single security transaction
 */
export async function createSecurityTransaction(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const transactionData: SecurityTransactionCreateDTO = req.body;

    // Verify account belongs to user
    const account = await db
      .select()
      .from(userBrokerAccounts)
      .where(
        and(
          eq(userBrokerAccounts.account_id, transactionData.account_id),
          eq(userBrokerAccounts.user_id, userId)
        )
      )
      .limit(1);

    if (account.length === 0) {
      throw new ApiError(404, 'Account not found or access denied');
    }

    // Verify security exists
    const security = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, transactionData.security_id))
      .limit(1);

    if (security.length === 0) {
      throw new ApiError(404, 'Security not found');
    }

    // Create transaction
    const newTransaction = await db
      .insert(securityTransactions)
      .values({
        user_id: userId,
        account_id: transactionData.account_id,
        security_id: transactionData.security_id,
        transaction_type: transactionData.transaction_type,
        transaction_date: transactionData.transaction_date,
        quantity: transactionData.quantity.toString(),
        price: transactionData.price.toString(),
        total_amount: transactionData.total_amount.toString(),
        brokerage: transactionData.brokerage?.toString() || '0',
        taxes: transactionData.taxes?.toString() || '0',
        other_charges: transactionData.other_charges?.toString() || '0',
        net_amount: transactionData.net_amount.toString(),
        notes: transactionData.notes
      })
      .returning();

    // Update holdings
    await updateHoldingForTransaction(
      userId,
      transactionData.account_id,
      transactionData.security_id,
      transactionData.transaction_type,
      transactionData.quantity,
      transactionData.price,
      transactionData.transaction_date
    );

    return sendCreated(res, newTransaction[0], 'Transaction created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk import security transactions
 */
export async function bulkImportTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new ApiError(400, 'transactions array is required and must not be empty');
    }

    // Validate all items
    const { valid, validatedItems, errors } = validateBulkItems(
      transactions,
      createSecurityTransactionSchema,
      { maxItems: 1000 }
    );

    if (!valid) {
      throw new ApiError(400, 'Validation failed', errors);
    }

    // Process bulk operation
    const result: BulkOperationResult<any> = await processBulkOperation(
      validatedItems,
      async (txnData, index) => {
        // Verify account belongs to user
        const account = await db
          .select()
          .from(userBrokerAccounts)
          .where(
            and(
              eq(userBrokerAccounts.account_id, txnData.account_id),
              eq(userBrokerAccounts.user_id, userId)
            )
          )
          .limit(1);

        if (account.length === 0) {
          throw new Error(`Account ID ${txnData.account_id} not found or access denied`);
        }

        // Verify security exists
        const security = await db
          .select()
          .from(securities)
          .where(eq(securities.security_id, txnData.security_id))
          .limit(1);

        if (security.length === 0) {
          throw new Error(`Security ID ${txnData.security_id} not found`);
        }

        // Create transaction
        const inserted = await db
          .insert(securityTransactions)
          .values({
            user_id: userId,
            account_id: txnData.account_id,
            security_id: txnData.security_id,
            transaction_type: txnData.transaction_type,
            transaction_date: txnData.transaction_date,
            quantity: txnData.quantity.toString(),
            price: txnData.price.toString(),
            total_amount: txnData.total_amount.toString(),
            brokerage: txnData.brokerage?.toString() || '0',
            taxes: txnData.taxes?.toString() || '0',
            other_charges: txnData.other_charges?.toString() || '0',
            net_amount: txnData.net_amount.toString(),
            notes: txnData.notes
          })
          .returning();

        // Update holdings
        await updateHoldingForTransaction(
          userId,
          txnData.account_id,
          txnData.security_id,
          txnData.transaction_type,
          txnData.quantity,
          txnData.price,
          txnData.transaction_date
        );

        return inserted[0];
      },
      { continueOnError: true }
    );

    return res.status(result.success ? 200 : 207).json({
      success: result.success,
      message: `Processed ${result.totalItems} transactions: ${result.successCount} succeeded, ${result.failureCount} failed`,
      data: result
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update security transaction
 */
export async function updateSecurityTransaction(req: AuthRequest, res: Response) {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const updateData: SecurityTransactionUpdateDTO = req.body;

    if (isNaN(transactionId)) {
      throw new ApiError(400, 'Invalid transaction ID');
    }

    // Check if transaction exists and belongs to user
    const existing = await db
      .select()
      .from(securityTransactions)
      .where(eq(securityTransactions.transaction_id, transactionId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Transaction not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this transaction');
    }

    // Build update object
    const updateValues: any = {};

    if (updateData.transaction_type !== undefined) updateValues.transaction_type = updateData.transaction_type;
    if (updateData.transaction_date !== undefined) updateValues.transaction_date = updateData.transaction_date;
    if (updateData.quantity !== undefined) updateValues.quantity = updateData.quantity.toString();
    if (updateData.price !== undefined) updateValues.price = updateData.price.toString();
    if (updateData.total_amount !== undefined) updateValues.total_amount = updateData.total_amount.toString();
    if (updateData.brokerage !== undefined) updateValues.brokerage = updateData.brokerage.toString();
    if (updateData.taxes !== undefined) updateValues.taxes = updateData.taxes.toString();
    if (updateData.other_charges !== undefined) updateValues.other_charges = updateData.other_charges.toString();
    if (updateData.net_amount !== undefined) updateValues.net_amount = updateData.net_amount.toString();
    if (updateData.notes !== undefined) updateValues.notes = updateData.notes;

    // Update transaction
    const updated = await db
      .update(securityTransactions)
      .set(updateValues)
      .where(eq(securityTransactions.transaction_id, transactionId))
      .returning();

    return sendSuccess(res, updated[0], 'Transaction updated successfully. Note: Holdings may need manual recalculation.');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete security transaction with holding recalculation
 */
export async function deleteSecurityTransaction(req: AuthRequest, res: Response) {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(transactionId)) {
      throw new ApiError(400, 'Invalid transaction ID');
    }

    // Check if transaction exists and belongs to user
    const existing = await db
      .select()
      .from(securityTransactions)
      .where(eq(securityTransactions.transaction_id, transactionId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Transaction not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this transaction');
    }

    // Delete transaction
    await db
      .delete(securityTransactions)
      .where(eq(securityTransactions.transaction_id, transactionId));

    return sendSuccess(res, null, 'Transaction deleted successfully. Holdings may need recalculation from remaining transactions.');
  } catch (error) {
    throw error;
  }
}

