import { Request, Response } from 'express';
import { db } from '../config/database';
import { userWatchlist, securities, securityPrices } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response-formatter';
import { AuthRequest } from '../types';

/**
 * List watchlist with current prices and target achievement
 */
export async function listWatchlist(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Get watchlist items with security details
  const items = await db.select({
    watchlist: userWatchlist,
    security: securities
  })
    .from(userWatchlist)
    .leftJoin(securities, eq(userWatchlist.security_id, securities.security_id))
    .where(eq(userWatchlist.user_id, userId))
    .orderBy(userWatchlist.added_date);

  // Get latest prices for each security
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const [latestPrice] = await db.select()
        .from(securityPrices)
        .where(eq(securityPrices.security_id, item.watchlist.security_id))
        .orderBy(desc(securityPrices.price_date))
        .limit(1);

      const currentPrice = latestPrice ? Number(latestPrice.close_price) : 0;
      const targetPrice = item.watchlist.target_price ? Number(item.watchlist.target_price) : null;
      
      let targetAchievement = null;
      let targetStatus = null;

      if (targetPrice && currentPrice > 0) {
        targetAchievement = ((currentPrice - targetPrice) / targetPrice) * 100;
        targetStatus = currentPrice >= targetPrice ? 'achieved' : 'pending';
      }

      return {
        ...item.watchlist,
        security: item.security,
        current_price: currentPrice,
        latest_price_date: latestPrice?.price_date || null,
        target_achievement_percentage: targetAchievement,
        target_status: targetStatus
      };
    })
  );

  return sendSuccess(res, enrichedItems, 'Watchlist retrieved successfully');
}

/**
 * Get watchlist item by ID
 */
export async function getWatchlistItemById(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [result] = await db.select({
    watchlist: userWatchlist,
    security: securities
  })
    .from(userWatchlist)
    .leftJoin(securities, eq(userWatchlist.security_id, securities.security_id))
    .where(
      and(
        eq(userWatchlist.watchlist_id, Number(id)),
        eq(userWatchlist.user_id, userId)
      )
    )
    .limit(1);

  if (!result) {
    return sendNotFound(res, 'Watchlist item not found');
  }

  // Get latest price
  const [latestPrice] = await db.select()
    .from(securityPrices)
    .where(eq(securityPrices.security_id, result.watchlist.security_id))
    .orderBy(desc(securityPrices.price_date))
    .limit(1);

  const currentPrice = latestPrice ? Number(latestPrice.close_price) : 0;
  const targetPrice = result.watchlist.target_price ? Number(result.watchlist.target_price) : null;
  
  let targetAchievement = null;
  let targetStatus = null;

  if (targetPrice && currentPrice > 0) {
    targetAchievement = ((currentPrice - targetPrice) / targetPrice) * 100;
    targetStatus = currentPrice >= targetPrice ? 'achieved' : 'pending';
  }

  return sendSuccess(res, {
    ...result.watchlist,
    security: result.security,
    current_price: currentPrice,
    latest_price_date: latestPrice?.price_date || null,
    target_achievement_percentage: targetAchievement,
    target_status: targetStatus
  }, 'Watchlist item retrieved successfully');
}

/**
 * Add security to watchlist
 */
export async function addToWatchlist(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    security_id,
    target_price,
    notes
  } = req.body;

  // Check if already in watchlist
  const [existing] = await db.select()
    .from(userWatchlist)
    .where(
      and(
        eq(userWatchlist.user_id, userId),
        eq(userWatchlist.security_id, security_id)
      )
    )
    .limit(1);

  if (existing) {
    return sendSuccess(res, existing, 'Security already in watchlist');
  }

  const [newItem] = await db.insert(userWatchlist)
    .values({
      user_id: userId,
      security_id,
      target_price,
      notes
    })
    .returning();

  return sendCreated(res, newItem, 'Security added to watchlist successfully');
}

/**
 * Update watchlist item
 */
export async function updateWatchlistItem(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(userWatchlist)
    .set(req.body)
    .where(
      and(
        eq(userWatchlist.watchlist_id, Number(id)),
        eq(userWatchlist.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Watchlist item not found');
  }

  return sendSuccess(res, updated, 'Watchlist item updated successfully');
}

/**
 * Remove from watchlist
 */
export async function removeFromWatchlist(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(userWatchlist)
    .where(
      and(
        eq(userWatchlist.watchlist_id, Number(id)),
        eq(userWatchlist.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Watchlist item not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Security removed from watchlist successfully');
}

