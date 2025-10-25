import { Response } from 'express';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { banks } from '../db/schema';
import { AuthRequest, BankCreateDTO, BankUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { parsePagination, getPaginationMeta, combineFilters } from '../utils/query-helpers';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response-formatter';

/**
 * Get all banks with filtering and pagination
 */
export async function getAllBanks(req: AuthRequest, res: Response) {
  try {
    const { page, limit, bank_type, search, is_active } = req.query;

    const { offset, limit: pageSize, page: currentPage } = parsePagination({ 
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined 
    });

    // Build filters
    const filters = [];
    
    if (bank_type) {
      filters.push(eq(banks.bank_type, bank_type as any));
    }
    
    if (is_active !== undefined) {
      filters.push(eq(banks.is_active, is_active === 'true'));
    }
    
    if (search) {
      filters.push(
        or(
          ilike(banks.bank_name, `%${search}%`),
          ilike(banks.bank_code, `%${search}%`)
        )
      );
    }

    const whereClause = combineFilters(filters);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(banks)
      .where(whereClause);
    
    const totalItems = Number(countResult[0].count);

    // Get paginated data
    const banksList = await db
      .select()
      .from(banks)
      .where(whereClause)
      .orderBy(desc(banks.created_at))
      .limit(pageSize)
      .offset(offset);

    const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

    return sendPaginated(res, banksList, pagination);
  } catch (error) {
    throw error;
  }
}

/**
 * Get bank by ID
 */
export async function getBankById(req: AuthRequest, res: Response) {
  try {
    const bankId = parseInt(req.params.id);

    if (isNaN(bankId)) {
      throw new ApiError(400, 'Invalid bank ID');
    }

    const bank = await db
      .select()
      .from(banks)
      .where(eq(banks.bank_id, bankId))
      .limit(1);

    if (bank.length === 0) {
      throw new ApiError(404, 'Bank not found');
    }

    return sendSuccess(res, bank[0]);
  } catch (error) {
    throw error;
  }
}

/**
 * Create new bank
 */
export async function createBank(req: AuthRequest, res: Response) {
  try {
    const bankData: BankCreateDTO = req.body;

    // Check if bank code already exists
    const existing = await db
      .select()
      .from(banks)
      .where(eq(banks.bank_code, bankData.bank_code))
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, `Bank with code '${bankData.bank_code}' already exists`);
    }

    // Create bank
    const newBank = await db
      .insert(banks)
      .values({
        bank_name: bankData.bank_name,
        bank_code: bankData.bank_code,
        bank_type: bankData.bank_type,
        website: bankData.website,
        contact_email: bankData.contact_email,
        contact_phone: bankData.contact_phone,
        address: bankData.address,
        city: bankData.city,
        state: bankData.state,
        country: bankData.country || 'India'
      })
      .returning();

    return sendCreated(res, newBank[0], 'Bank created successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Update bank
 */
export async function updateBank(req: AuthRequest, res: Response) {
  try {
    const bankId = parseInt(req.params.id);
    const updateData: BankUpdateDTO = req.body;

    if (isNaN(bankId)) {
      throw new ApiError(400, 'Invalid bank ID');
    }

    // Check if bank exists
    const existing = await db
      .select()
      .from(banks)
      .where(eq(banks.bank_id, bankId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Bank not found');
    }

    // Build update object
    const updateValues: any = {
      updated_at: new Date()
    };

    if (updateData.bank_name !== undefined) updateValues.bank_name = updateData.bank_name;
    if (updateData.bank_type !== undefined) updateValues.bank_type = updateData.bank_type;
    if (updateData.website !== undefined) updateValues.website = updateData.website;
    if (updateData.contact_email !== undefined) updateValues.contact_email = updateData.contact_email;
    if (updateData.contact_phone !== undefined) updateValues.contact_phone = updateData.contact_phone;
    if (updateData.is_active !== undefined) updateValues.is_active = updateData.is_active;

    // Update bank
    const updated = await db
      .update(banks)
      .set(updateValues)
      .where(eq(banks.bank_id, bankId))
      .returning();

    return sendSuccess(res, updated[0], 'Bank updated successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete bank
 */
export async function deleteBank(req: AuthRequest, res: Response) {
  try {
    const bankId = parseInt(req.params.id);

    if (isNaN(bankId)) {
      throw new ApiError(400, 'Invalid bank ID');
    }

    // Check if bank exists
    const existing = await db
      .select()
      .from(banks)
      .where(eq(banks.bank_id, bankId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Bank not found');
    }

    // Delete bank
    await db
      .delete(banks)
      .where(eq(banks.bank_id, bankId));

    return sendSuccess(res, null, 'Bank deleted successfully');
  } catch (error) {
    throw error;
  }
}

