import { Response } from 'express';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response-formatter';
import { MarketDataService } from '../services/market-data.service';
import { asyncHandler } from '../utils/async-handler';

const marketDataService = new MarketDataService();

/**
 * Fetch LTP for a symbol without saving to database
 * Supports optional query parameter 'type' to specify 'bond' or 'equity' (default: 'equity')
 */
export const fetchLTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const symbol = req.params.symbol?.toUpperCase();
  const securityType = (req.query.type as string)?.toLowerCase() || 'equity';

  if (!symbol) {
    throw new ApiError(400, 'Symbol parameter is required');
  }

  let marketData;
  if (securityType === 'bond') {
    marketData = await marketDataService.fetchNSEBond(symbol);
  } else {
    marketData = await marketDataService.fetchNSELTP(symbol);
  }

  return sendSuccess(res, marketData, `LTP fetched successfully for ${symbol}`);
});

/**
 * Fetch LTP for a bond symbol without saving to database
 */
export const fetchBondLTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const symbol = req.params.symbol?.toUpperCase();

  if (!symbol) {
    throw new ApiError(400, 'Symbol parameter is required');
  }

  const marketData = await marketDataService.fetchNSEBond(symbol);

  return sendSuccess(res, marketData, `Bond LTP fetched successfully for ${symbol}`);
});

/**
 * Fetch and update LTP for a security in the database
 */
export const updateSecurityLTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const securityId = parseInt(req.params.securityId);

  if (isNaN(securityId)) {
    throw new ApiError(400, 'Invalid security ID');
  }

  await marketDataService.updateSecurityLTP(securityId);

  return sendSuccess(res, { securityId }, 'Security LTP updated successfully');
});

/**
 * Batch update LTP for multiple securities
 */
export const batchUpdateLTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { securityIds } = req.body;

  if (!Array.isArray(securityIds) || securityIds.length === 0) {
    throw new ApiError(400, 'securityIds array is required and must not be empty');
  }

  // Validate all IDs are numbers
  const invalidIds = securityIds.filter(id => typeof id !== 'number' || isNaN(id));
  if (invalidIds.length > 0) {
    throw new ApiError(400, `Invalid security IDs: ${invalidIds.join(', ')}`);
  }

  // Limit batch size to prevent abuse
  if (securityIds.length > 50) {
    throw new ApiError(400, 'Batch size cannot exceed 50 securities');
  }

  const result = await marketDataService.batchUpdateLTP(securityIds);

  return sendSuccess(res, result, `Batch update completed: ${result.success} succeeded, ${result.failed} failed`);
});


