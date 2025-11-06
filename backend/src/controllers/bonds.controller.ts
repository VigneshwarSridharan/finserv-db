import { Response } from 'express';
import { eq, and, ilike, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../config/database';
import { bondDetails, securities } from '../db/schema';
import { AuthRequest, BondDetailCreateDTO, BondDetailUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { 
  parsePagination, 
  getPaginationMeta, 
  buildSortClause, 
  combineFilters 
} from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated, sendNotFound } from '../utils/response-formatter';

/**
 * Get all bonds with security info joined
 */
export async function getAllBonds(req: AuthRequest, res: Response) {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      issuer,
      bond_type,
      credit_rating,
      search
    } = req.query as any;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Build filters
    const filters = [];
    
    if (issuer) {
      filters.push(ilike(bondDetails.issuer, `%${issuer}%`));
    }
    
    if (bond_type) {
      filters.push(eq(bondDetails.bond_type, bond_type));
    }
    
    if (credit_rating) {
      filters.push(eq(bondDetails.credit_rating, credit_rating));
    }

    if (search) {
      filters.push(
        ilike(bondDetails.issuer, `%${search}%`)
      );
    }

    const whereClause = combineFilters(filters);

    // Build sort clause
    const allowedSortFields = {
      issuer: bondDetails.issuer,
      maturity_date: bondDetails.maturity_date,
      coupon_rate: bondDetails.coupon_rate,
      bond_type: bondDetails.bond_type,
      created_at: bondDetails.created_at
    };
    
    const sortClause = buildSortClause(
      { sortBy, sortOrder },
      allowedSortFields,
      bondDetails.maturity_date
    );

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bondDetails)
      .where(whereClause);
    
    const totalItems = Number(countResult[0]?.count || 0);

    // Get paginated data with security info
    const query = db
      .select({
        bond: bondDetails,
        security: securities
      })
      .from(bondDetails)
      .innerJoin(securities, eq(bondDetails.security_id, securities.security_id))
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);
    
    if (sortClause) {
      query.orderBy(sortClause);
    }

    const bondsList = await query;

    // Transform the data
    const transformedBonds = bondsList.map(({ bond, security }) => ({
      ...bond,
      security
    }));

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, transformedBonds, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get bond details by security_id
 */
export async function getBondDetails(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    const [bond] = await db
      .select({
        bond: bondDetails,
        security: securities
      })
      .from(bondDetails)
      .innerJoin(securities, eq(bondDetails.security_id, securities.security_id))
      .where(eq(bondDetails.security_id, securityId))
      .limit(1);

    if (!bond) {
      throw new ApiError(404, 'Bond details not found');
    }

    const result = {
      ...bond.bond,
      security: bond.security
    };

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create bond details
 */
export async function createBondDetails(req: AuthRequest, res: Response) {
  try {
    const bondData: BondDetailCreateDTO = req.body;

    // Verify security exists and is of type 'bond'
    const [security] = await db
      .select()
      .from(securities)
      .where(eq(securities.security_id, bondData.security_id))
      .limit(1);

    if (!security) {
      throw new ApiError(404, 'Security not found');
    }

    if (security.security_type !== 'bond') {
      throw new ApiError(400, 'Security must be of type "bond"');
    }

    // Check if bond details already exist for this security
    const existing = await db
      .select()
      .from(bondDetails)
      .where(eq(bondDetails.security_id, bondData.security_id))
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, 'Bond details already exist for this security');
    }

    // Validate coupon_rate if provided
    if (bondData.coupon_rate !== undefined) {
      if (bondData.coupon_rate < 0 || bondData.coupon_rate > 100) {
        throw new ApiError(400, 'Coupon rate must be between 0 and 100');
      }
    }

    // Validate yield_to_maturity if provided
    if (bondData.yield_to_maturity !== undefined) {
      if (bondData.yield_to_maturity < 0 || bondData.yield_to_maturity > 100) {
        throw new ApiError(400, 'Yield to maturity must be between 0 and 100');
      }
    }

    // Create bond details
    const newBond = await db
      .insert(bondDetails)
      .values({
        security_id: bondData.security_id,
        issuer: bondData.issuer,
        coupon_rate: bondData.coupon_rate ? bondData.coupon_rate.toString() : null,
        maturity_date: bondData.maturity_date,
        coupon_payment_frequency: bondData.coupon_payment_frequency,
        bond_type: bondData.bond_type,
        credit_rating: bondData.credit_rating,
        yield_to_maturity: bondData.yield_to_maturity ? bondData.yield_to_maturity.toString() : null,
        issue_date: bondData.issue_date,
        next_coupon_date: bondData.next_coupon_date,
        day_count_convention: bondData.day_count_convention
      })
      .returning();

    return sendCreated(res, newBond[0], 'Bond details created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update bond details
 */
export async function updateBondDetails(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);
    const updateData: BondDetailUpdateDTO = req.body;

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    // Check if bond details exist
    const [existing] = await db
      .select()
      .from(bondDetails)
      .where(eq(bondDetails.security_id, securityId))
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Bond details not found');
    }

    // Validate coupon_rate if provided
    if (updateData.coupon_rate !== undefined) {
      if (updateData.coupon_rate < 0 || updateData.coupon_rate > 100) {
        throw new ApiError(400, 'Coupon rate must be between 0 and 100');
      }
    }

    // Validate yield_to_maturity if provided
    if (updateData.yield_to_maturity !== undefined) {
      if (updateData.yield_to_maturity < 0 || updateData.yield_to_maturity > 100) {
        throw new ApiError(400, 'Yield to maturity must be between 0 and 100');
      }
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.issuer !== undefined) updateValues.issuer = updateData.issuer;
    if (updateData.coupon_rate !== undefined) updateValues.coupon_rate = updateData.coupon_rate.toString();
    if (updateData.maturity_date !== undefined) updateValues.maturity_date = updateData.maturity_date;
    if (updateData.coupon_payment_frequency !== undefined) updateValues.coupon_payment_frequency = updateData.coupon_payment_frequency;
    if (updateData.bond_type !== undefined) updateValues.bond_type = updateData.bond_type;
    if (updateData.credit_rating !== undefined) updateValues.credit_rating = updateData.credit_rating;
    if (updateData.yield_to_maturity !== undefined) updateValues.yield_to_maturity = updateData.yield_to_maturity.toString();
    if (updateData.issue_date !== undefined) updateValues.issue_date = updateData.issue_date;
    if (updateData.next_coupon_date !== undefined) updateValues.next_coupon_date = updateData.next_coupon_date;
    if (updateData.day_count_convention !== undefined) updateValues.day_count_convention = updateData.day_count_convention;

    // Update bond details
    const updated = await db
      .update(bondDetails)
      .set(updateValues)
      .where(eq(bondDetails.security_id, securityId))
      .returning();

    return sendSuccess(res, updated[0], 'Bond details updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete bond details
 */
export async function deleteBondDetails(req: AuthRequest, res: Response) {
  try {
    const securityId = parseInt(req.params.securityId);

    if (isNaN(securityId)) {
      throw new ApiError(400, 'Invalid security ID');
    }

    // Check if bond details exist
    const [existing] = await db
      .select()
      .from(bondDetails)
      .where(eq(bondDetails.security_id, securityId))
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'Bond details not found');
    }

    // Delete bond details
    await db
      .delete(bondDetails)
      .where(eq(bondDetails.security_id, securityId));

    return sendSuccess(res, null, 'Bond details deleted successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Get bonds by issuer
 */
export async function getBondsByIssuer(req: AuthRequest, res: Response) {
  try {
    const { issuer } = req.params;
    const { page, limit } = req.query as any;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Get bonds filtered by issuer
    const bondsList = await db
      .select({
        bond: bondDetails,
        security: securities
      })
      .from(bondDetails)
      .innerJoin(securities, eq(bondDetails.security_id, securities.security_id))
      .where(ilike(bondDetails.issuer, `%${issuer}%`))
      .limit(pageSize)
      .offset(offset)
      .orderBy(bondDetails.maturity_date);

    const transformedBonds = bondsList.map(({ bond, security }) => ({
      ...bond,
      security
    }));

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bondDetails)
      .where(ilike(bondDetails.issuer, `%${issuer}%`));
    
    const totalItems = Number(countResult[0]?.count || 0);
    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, transformedBonds, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get bonds by maturity date range
 */
export async function getBondsByMaturity(req: AuthRequest, res: Response) {
  try {
    const { from, to } = req.query as any;

    if (!from || !to) {
      throw new ApiError(400, 'Both "from" and "to" query parameters are required');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
    }

    const { page, limit } = req.query as any;
    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Get bonds filtered by maturity date range
    const bondsList = await db
      .select({
        bond: bondDetails,
        security: securities
      })
      .from(bondDetails)
      .innerJoin(securities, eq(bondDetails.security_id, securities.security_id))
      .where(
        and(
          gte(bondDetails.maturity_date, from),
          lte(bondDetails.maturity_date, to)
        )
      )
      .limit(pageSize)
      .offset(offset)
      .orderBy(bondDetails.maturity_date);

    const transformedBonds = bondsList.map(({ bond, security }) => ({
      ...bond,
      security
    }));

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bondDetails)
      .where(
        and(
          gte(bondDetails.maturity_date, from),
          lte(bondDetails.maturity_date, to)
        )
      );
    
    const totalItems = Number(countResult[0]?.count || 0);
    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, transformedBonds, pagination);
  } catch (error) {
    throw error;
  }
}

