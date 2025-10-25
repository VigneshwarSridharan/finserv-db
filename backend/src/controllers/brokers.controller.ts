import { Response } from 'express';
import { eq, and, ilike, or, sql, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { brokers } from '../db/schema';
import { AuthRequest, BrokerCreateDTO, BrokerUpdateDTO, BrokerQueryParams } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { 
  parsePagination, 
  getPaginationMeta, 
  buildSortClause, 
  combineFilters, 
  buildFilterCondition 
} from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated, sendList } from '../utils/response-formatter';

/**
 * Get all brokers with filtering, pagination, and sorting
 */
export async function getAllBrokers(req: AuthRequest, res: Response) {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      broker_type,
      is_active,
      search
    } = req.query as unknown as BrokerQueryParams;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined 
    });

    // Build filters
    const filters = [];
    
    if (broker_type) {
      filters.push(eq(brokers.broker_type, broker_type as any));
    }
    
    if (is_active !== undefined) {
      filters.push(eq(brokers.is_active, is_active === 'true'));
    }
    
    if (search) {
      filters.push(
        or(
          ilike(brokers.broker_name, `%${search}%`),
          ilike(brokers.broker_code, `%${search}%`)
        )
      );
    }

    const whereClause = combineFilters(filters);

    // Build sort clause
    const allowedSortFields = {
      broker_name: brokers.broker_name,
      broker_code: brokers.broker_code,
      broker_type: brokers.broker_type,
      created_at: brokers.created_at
    };
    
    const sortClause = buildSortClause(
      { sortBy, sortOrder },
      allowedSortFields,
      brokers.created_at
    );

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(brokers)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data
    const query = db
      .select()
      .from(brokers)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);
    
    if (sortClause) {
      query.orderBy(sortClause);
    }

    const brokersList = await query;

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, brokersList, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get broker by ID
 */
export async function getBrokerById(req: AuthRequest, res: Response) {
  try {
    const brokerId = parseInt(req.params.id);

    if (isNaN(brokerId)) {
      throw new ApiError(400, 'Invalid broker ID');
    }

    const broker = await db
      .select()
      .from(brokers)
      .where(eq(brokers.broker_id, brokerId))
      .limit(1);

    if (broker.length === 0) {
      throw new ApiError(404, 'Broker not found');
    }

    return sendSuccess(res, broker[0]);
  } catch (error) {
    throw error;
  }
}

/**
 * Create new broker
 */
export async function createBroker(req: AuthRequest, res: Response) {
  try {
    const brokerData: BrokerCreateDTO = req.body;

    // Check if broker code already exists
    const existing = await db
      .select()
      .from(brokers)
      .where(eq(brokers.broker_code, brokerData.broker_code))
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, `Broker with code '${brokerData.broker_code}' already exists`);
    }

    // Create broker
    const newBroker = await db
      .insert(brokers)
      .values({
        broker_name: brokerData.broker_name,
        broker_code: brokerData.broker_code,
        broker_type: brokerData.broker_type,
        website: brokerData.website,
        contact_email: brokerData.contact_email,
        contact_phone: brokerData.contact_phone,
        address: brokerData.address,
        city: brokerData.city,
        state: brokerData.state,
        country: brokerData.country || 'India'
      })
      .returning();

    return sendCreated(res, newBroker[0], 'Broker created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update broker
 */
export async function updateBroker(req: AuthRequest, res: Response) {
  try {
    const brokerId = parseInt(req.params.id);
    const updateData: BrokerUpdateDTO = req.body;

    if (isNaN(brokerId)) {
      throw new ApiError(400, 'Invalid broker ID');
    }

    // Check if broker exists
    const existing = await db
      .select()
      .from(brokers)
      .where(eq(brokers.broker_id, brokerId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Broker not found');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.broker_name !== undefined) updateValues.broker_name = updateData.broker_name;
    if (updateData.broker_type !== undefined) updateValues.broker_type = updateData.broker_type;
    if (updateData.website !== undefined) updateValues.website = updateData.website;
    if (updateData.contact_email !== undefined) updateValues.contact_email = updateData.contact_email;
    if (updateData.contact_phone !== undefined) updateValues.contact_phone = updateData.contact_phone;
    if (updateData.address !== undefined) updateValues.address = updateData.address;
    if (updateData.city !== undefined) updateValues.city = updateData.city;
    if (updateData.state !== undefined) updateValues.state = updateData.state;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update broker
    const updated = await db
      .update(brokers)
      .set(updateValues)
      .where(eq(brokers.broker_id, brokerId))
      .returning();

    return sendSuccess(res, updated[0], 'Broker updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete broker
 */
export async function deleteBroker(req: AuthRequest, res: Response) {
  try {
    const brokerId = parseInt(req.params.id);

    if (isNaN(brokerId)) {
      throw new ApiError(400, 'Invalid broker ID');
    }

    // Check if broker exists
    const existing = await db
      .select()
      .from(brokers)
      .where(eq(brokers.broker_id, brokerId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Broker not found');
    }

    // Delete broker
    await db
      .delete(brokers)
      .where(eq(brokers.broker_id, brokerId));

    return sendSuccess(res, null, 'Broker deleted successfully');
  } catch (error) {
    throw error;
  }
}

