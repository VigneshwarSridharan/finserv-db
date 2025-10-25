import { Response } from 'express';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { securityPrices, securities } from '../db/schema';
import { AuthRequest, SecurityPriceCreateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { parsePagination, getPaginationMeta, buildDateRangeFilter } from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response-formatter';
import { validateBulkItems, processBulkOperation, BulkOperationResult } from '../utils/bulk-processor';
import { createSecurityPriceSchema } from '../middleware/validator';

/**
 * Get price history for a security
 */
export async function getSecurityPrices(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);
    const { page, limit, startDate, endDate } = req.query;

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    // Verify security exists
    const security = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, securityId))
      .limit(1);

    if (security.length === 0) {
      throw new ApiError(404, 'Security not found');
    }

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined 
    });

    // Build filters
    const filters = [eq(securityPrices.security_id, securityId)];
    
    const dateFilter = buildDateRangeFilter(
      securityPrices.price_date,
      startDate as string,
      endDate as string
    );
    
    if (dateFilter) {
      filters.push(dateFilter);
    }

    const whereClause = and(...filters);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(securityPrices)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data
    const prices = await db
      .select()
      .from(securityPrices)
      .where(whereClause)
      .orderBy(desc(securityPrices.price_date))
      .limit(pageSize)
      .offset(offset);

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, prices, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get latest price for a security
 */
export async function getLatestPrice(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    const latestPrice = await db
      .select()
      .from(securityPrices)
      .where(eq(securityPrices.security_id, securityId))
      .orderBy(desc(securityPrices.price_date))
      .limit(1);

    if (latestPrice.length === 0) {
      throw new ApiError(404, 'No price data available for this security');
    }

    return sendSuccess(res, latestPrice[0]);
  } catch (error) {
    throw error;
  }
}

/**
 * Add single security price
 */
export async function addSecurityPrice(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);
    const priceData: SecurityPriceCreateDTO = req.body;

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    // Verify security exists
    const security = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, securityId))
      .limit(1);

    if (security.length === 0) {
      throw new ApiError(404, 'Security not found');
    }

    // Check if price already exists for this date
    const existing = await db
      .select()
      .from(securityPrices)
      .where(
        and(
          eq(securityPrices.security_id, securityId),
          eq(securityPrices.price_date, priceData.price_date)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, `Price already exists for date ${priceData.price_date}`);
    }

    // Create price entry
    const newPrice = await db
      .insert(securityPrices)
      .values({
        security_id: securityId,
        price_date: priceData.price_date,
        open_price: priceData.open_price?.toString(),
        high_price: priceData.high_price?.toString(),
        low_price: priceData.low_price?.toString(),
        close_price: priceData.close_price.toString(),
        volume: priceData.volume,
        adjusted_close: priceData.adjusted_close?.toString()
      })
      .returning();

    return sendCreated(res, newPrice[0], 'Price added successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk upload security prices
 */
export async function bulkUploadPrices(req: AuthRequest, res: Response) {
  try {
    const { prices } = req.body;

    if (!Array.isArray(prices) || prices.length === 0) {
      throw new ApiError(400, 'prices array is required and must not be empty');
    }

    // Validate all items
    const { valid, validatedItems, errors } = validateBulkItems(
      prices,
      createSecurityPriceSchema.extend({
        security_id: require('zod').z.number().int().positive()
      }),
      { maxItems: 1000 }
    );

    if (!valid) {
      throw new ApiError(400, 'Validation failed', errors);
    }

    // Process bulk operation
    const result: BulkOperationResult<any> = await processBulkOperation(
      validatedItems,
      async (priceData, index) => {
        // Check if security exists
        const security = await db
          .select()
          .from(securities)
          .where(eq(securities.security_id, priceData.security_id))
          .limit(1);

        if (security.length === 0) {
          throw new Error(`Security ID ${priceData.security_id} not found`);
        }

        // Check for duplicates
        const existing = await db
          .select()
          .from(securityPrices)
          .where(
            and(
              eq(securityPrices.security_id, priceData.security_id),
              eq(securityPrices.price_date, priceData.price_date)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          throw new Error(`Price already exists for security ${priceData.security_id} on ${priceData.price_date}`);
        }

        // Insert price
        const inserted = await db
          .insert(securityPrices)
          .values({
            security_id: priceData.security_id,
            price_date: priceData.price_date,
            open_price: priceData.open_price?.toString(),
            high_price: priceData.high_price?.toString(),
            low_price: priceData.low_price?.toString(),
            close_price: priceData.close_price.toString(),
            volume: priceData.volume,
            adjusted_close: priceData.adjusted_close?.toString()
          })
          .returning();

        return inserted[0];
      },
      { continueOnError: true }
    );

    return res.status(result.success ? 200 : 207).json({
      success: result.success,
      message: `Processed ${result.totalItems} items: ${result.successCount} succeeded, ${result.failureCount} failed`,
      data: result
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update security price
 */
export async function updateSecurityPrice(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);
    const priceId = parseInt(req.params.priceId);
    const updateData: Partial<SecurityPriceCreateDTO> = req.body;

    if (isNaN(securityId) || isNaN(priceId)) {
      throw new ApiError(400, 'Invalid security ID or price ID');
    }

    // Check if price exists
    const existing = await db
      .select()
      .from(securityPrices)
      .where(
        and(
          eq(securityPrices.price_id, priceId),
          eq(securityPrices.security_id, securityId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Price record not found');
    }

    // Build update object
    const updateValues: any = {};

    if (updateData.open_price !== undefined) updateValues.open_price = updateData.open_price.toString();
    if (updateData.high_price !== undefined) updateValues.high_price = updateData.high_price.toString();
    if (updateData.low_price !== undefined) updateValues.low_price = updateData.low_price.toString();
    if (updateData.close_price !== undefined) updateValues.close_price = updateData.close_price.toString();
    if (updateData.volume !== undefined) updateValues.volume = updateData.volume;
    if (updateData.adjusted_close !== undefined) updateValues.adjusted_close = updateData.adjusted_close.toString();

    // Update price
    const updated = await db
      .update(securityPrices)
      .set(updateValues)
      .where(eq(securityPrices.price_id, priceId))
      .returning();

    return sendSuccess(res, updated[0], 'Price updated successfully');
  } catch (error) {
    throw error;
  }
}

