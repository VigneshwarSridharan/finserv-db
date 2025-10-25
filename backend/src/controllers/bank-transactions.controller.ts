import { Response } from 'express';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { bankTransactions, userBankAccounts } from '../db/schema';
import { AuthRequest, BankTransactionCreateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { parsePagination, getPaginationMeta, buildDateRangeFilter, combineFilters } from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response-formatter';
import { validateBulkItems, processBulkOperation, BulkOperationResult } from '../utils/bulk-processor';
import { z } from 'zod';

const bankTransactionSchema = z.object({
  account_id: z.number().int().positive(),
  transaction_type: z.enum(['fd_creation', 'fd_interest', 'fd_maturity', 'rd_installment', 'rd_maturity', 'transfer', 'withdrawal', 'deposit']),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number(),
  balance_after: z.number().optional(),
  reference_number: z.string().max(100).optional(),
  description: z.string().optional(),
  related_fd_id: z.number().int().optional(),
  related_rd_id: z.number().int().optional()
});

/**
 * Get all bank transactions for authenticated user
 */
export async function getBankTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { page, limit, transaction_type, startDate, endDate, account_id } = req.query;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined 
    });

    // Build filters
    const filters = [eq(bankTransactions.user_id, userId)];
    
    if (transaction_type) {
      filters.push(eq(bankTransactions.transaction_type, transaction_type as any));
    }
    
    if (account_id) {
      filters.push(eq(bankTransactions.account_id, parseInt(account_id as string)));
    }

    const dateFilter = buildDateRangeFilter(
      bankTransactions.transaction_date,
      startDate as string,
      endDate as string
    );
    
    if (dateFilter) {
      filters.push(dateFilter);
    }

    const whereClause = combineFilters(filters);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bankTransactions)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data
    const transactions = await db
      .select()
      .from(bankTransactions)
      .where(whereClause)
      .orderBy(desc(bankTransactions.transaction_date))
      .limit(pageSize)
      .offset(offset);

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, transactions, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get transaction by ID
 */
export async function getBankTransactionById(req: AuthRequest, res: Response) {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(transactionId)) {
      throw new ApiError(400, 'Invalid transaction ID');
    }

    const transaction = await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.transaction_id, transactionId))
      .limit(1);

    if (transaction.length === 0) {
      throw new ApiError(404, 'Transaction not found');
    }

    if (transaction[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this transaction');
    }

    return sendSuccess(res, transaction[0]);
  } catch (error) {
    throw error;
  }
}

/**
 * Create bank transaction
 */
export async function createBankTransaction(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const transactionData: BankTransactionCreateDTO = req.body;

    // Verify account belongs to user
    const account = await db
      .select()
      .from(userBankAccounts)
      .where(
        and(
          eq(userBankAccounts.account_id, transactionData.account_id),
          eq(userBankAccounts.user_id, userId)
        )
      )
      .limit(1);

    if (account.length === 0) {
      throw new ApiError(404, 'Bank account not found or access denied');
    }

    // Create transaction
    const newTransaction = await db
      .insert(bankTransactions)
      .values({
        user_id: userId,
        account_id: transactionData.account_id,
        transaction_type: transactionData.transaction_type,
        transaction_date: transactionData.transaction_date,
        amount: transactionData.amount.toString(),
        balance_after: transactionData.balance_after?.toString(),
        reference_number: transactionData.reference_number,
        description: transactionData.description,
        related_fd_id: transactionData.related_fd_id,
        related_rd_id: transactionData.related_rd_id
      })
      .returning();

    return sendCreated(res, newTransaction[0], 'Bank transaction created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk import bank transactions
 */
export async function bulkImportBankTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new ApiError(400, 'transactions array is required and must not be empty');
    }

    // Validate all items
    const { valid, validatedItems, errors } = validateBulkItems(
      transactions,
      bankTransactionSchema,
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
          .from(userBankAccounts)
          .where(
            and(
              eq(userBankAccounts.account_id, txnData.account_id),
              eq(userBankAccounts.user_id, userId)
            )
          )
          .limit(1);

        if (account.length === 0) {
          throw new Error(`Account ID ${txnData.account_id} not found or access denied`);
        }

        // Create transaction
        const inserted = await db
          .insert(bankTransactions)
          .values({
            user_id: userId,
            account_id: txnData.account_id,
            transaction_type: txnData.transaction_type,
            transaction_date: txnData.transaction_date,
            amount: txnData.amount.toString(),
            balance_after: txnData.balance_after?.toString(),
            reference_number: txnData.reference_number,
            description: txnData.description,
            related_fd_id: txnData.related_fd_id,
            related_rd_id: txnData.related_rd_id
          })
          .returning();

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

