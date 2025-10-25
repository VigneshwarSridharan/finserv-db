import { Response } from 'express';
import { eq, and, ilike, or, sql, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { securities, securityPrices } from '../db/schema';
import { AuthRequest, SecurityCreateDTO, SecurityUpdateDTO, SecurityQueryParams } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { 
  parsePagination, 
  getPaginationMeta, 
  buildSortClause, 
  combineFilters 
} from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response-formatter';

/**
 * Get all securities with filtering, pagination, and sorting
 */
export async function getAllSecurities(req: AuthRequest, res: Response) {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      security_type,
      exchange,
      sector,
      search
    } = req.query as unknown as SecurityQueryParams;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Build filters
    const filters = [];
    
    if (security_type) {
      filters.push(eq(securities.security_type, security_type as any));
    }
    
    if (exchange) {
      filters.push(eq(securities.exchange, exchange));
    }
    
    if (sector) {
      filters.push(eq(securities.sector, sector));
    }
    
    if (search) {
      filters.push(
        or(
          ilike(securities.symbol, `%${search}%`),
          ilike(securities.name, `%${search}%`),
          ilike(securities.isin, `%${search}%`)
        )
      );
    }

    const whereClause = combineFilters(filters);

    // Build sort clause
    const allowedSortFields = {
      symbol: securities.symbol,
      name: securities.name,
      security_type: securities.security_type,
      exchange: securities.exchange,
      sector: securities.sector,
      created_at: securities.created_at
    };
    
    const sortClause = buildSortClause(
      { sortBy, sortOrder },
      allowedSortFields,
      securities.created_at
    );

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(securities)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data
    const query = db
      .select()
      .from(securities)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);
    
    if (sortClause) {
      query.orderBy(sortClause);
    }

    const securitiesList = await query;

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, securitiesList, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Search securities by symbol or name
 */
export async function searchSecurities(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ApiError(400, 'Search query parameter "q" is required');
    }

    const searchResults = await db
      .select()
      .from(securities)
      .where(
        or(
          ilike(securities.symbol, `%${q}%`),
          ilike(securities.name, `%${q}%`),
          ilike(securities.isin, `%${q}%`)
        )
      )
      .limit(20);

    return sendSuccess(res, searchResults);
  } catch (error) {
    throw error;
  }
}

/**
 * Get security by ID with latest price
 */
export async function getSecurityById(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.id);

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    const security = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, securityId))
      .limit(1);

    if (security.length === 0) {
      throw new ApiError(404, 'Security not found');
    }

    // Get latest price
    const latestPrice = await db
      .select()
      .from(securityPrices)
      .where(eq(securityPrices.security_id, securityId))
      .orderBy(desc(securityPrices.price_date))
      .limit(1);

    const result = {
      ...security[0],
      latest_price: latestPrice.length > 0 ? latestPrice[0] : null
    };

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create new security
 */
export async function createSecurity(req: AuthRequest, res: Response) {
  try {
    const securityData: SecurityCreateDTO = req.body;

    // Check if security already exists with same symbol and exchange
    const existing = await db
      .select()
      .from(securities)
      .where(
        and(
          eq(securities.symbol, securityData.symbol),
          eq(securities.exchange, securityData.exchange)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, `Security with symbol '${securityData.symbol}' already exists on exchange '${securityData.exchange}'`);
    }

    // Check ISIN uniqueness if provided
    if (securityData.isin) {
      const existingIsin = await db
        .select()
        .from(securities)
        .where(eq(securities.isin, securityData.isin))
        .limit(1);

      if (existingIsin.length > 0) {
        throw new ApiError(409, `Security with ISIN '${securityData.isin}' already exists`);
      }
    }

    // Create security
    const newSecurity = await db
      .insert(securities)
      .values({
        symbol: securityData.symbol,
        name: securityData.name,
        security_type: securityData.security_type,
        exchange: securityData.exchange,
        sector: securityData.sector,
        industry: securityData.industry,
        market_cap_category: securityData.market_cap_category,
        isin: securityData.isin,
        face_value: securityData.face_value ? securityData.face_value.toString() : null,
        lot_size: securityData.lot_size || 1
      })
      .returning();

    return sendCreated(res, newSecurity[0], 'Security created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update security
 */
export async function updateSecurity(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.id);
    const updateData: SecurityUpdateDTO = req.body;

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    // Check if security exists
    const existing = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, securityId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Security not found');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.security_type !== undefined) updateValues.security_type = updateData.security_type;
    if (updateData.sector !== undefined) updateValues.sector = updateData.sector;
    if (updateData.industry !== undefined) updateValues.industry = updateData.industry;
    if (updateData.market_cap_category !== undefined) updateValues.market_cap_category = updateData.market_cap_category;
    if (updateData.face_value !== undefined) updateValues.face_value = updateData.face_value.toString();
    if (updateData.lot_size !== undefined) updateValues.lot_size = updateData.lot_size;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update security
    const updated = await db
      .update(securities)
      .set(updateValues)
      .where(eq(securities.security_id, securityId))
      .returning();

    return sendSuccess(res, updated[0], 'Security updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete security
 */
export async function deleteSecurity(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.id);

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    // Check if security exists
    const existing = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, securityId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Security not found');
    }

    // Delete security
    await db
      .delete(securities)
      .where(eq(securities.security_id, securityId));

    return sendSuccess(res, null, 'Security deleted successfully');
  } catch (error) {
    throw error;
  }
}

