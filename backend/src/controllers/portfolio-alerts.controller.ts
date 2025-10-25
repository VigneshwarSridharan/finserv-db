import { Request, Response } from 'express';
import { db } from '../config/database';
import { portfolioAlerts } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildSortClause, combineFilters, buildFilterCondition } from '../utils/query-helpers';
import { AuthRequest } from '../types';

/**
 * List portfolio alerts with filtering
 */
export async function listPortfolioAlerts(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { page, limit, sortBy, sortOrder, alert_type, is_active, is_triggered } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters
  const filters = combineFilters([
    eq(portfolioAlerts.user_id, userId),
    buildFilterCondition(portfolioAlerts.alert_type, alert_type as string),
    buildFilterCondition(portfolioAlerts.is_active, is_active === 'true'),
    buildFilterCondition(portfolioAlerts.is_triggered, is_triggered === 'true')
  ]);

  // Build sort
  const sortClause = buildSortClause(
    { sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' },
    {
      alert_name: portfolioAlerts.alert_name,
      alert_type: portfolioAlerts.alert_type,
      triggered_at: portfolioAlerts.triggered_at,
      created_at: portfolioAlerts.created_at
    },
    portfolioAlerts.created_at
  );

  // Query alerts
  const [items, countResult] = await Promise.all([
    db.select()
      .from(portfolioAlerts)
      .where(filters)
      .orderBy(sortClause!)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(portfolioAlerts)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  return sendPaginated(res, items, pagination, 'Portfolio alerts retrieved successfully');
}

/**
 * Get alert by ID
 */
export async function getPortfolioAlertById(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [alert] = await db.select()
    .from(portfolioAlerts)
    .where(
      and(
        eq(portfolioAlerts.alert_id, Number(id)),
        eq(portfolioAlerts.user_id, userId)
      )
    )
    .limit(1);

  if (!alert) {
    return sendNotFound(res, 'Portfolio alert not found');
  }

  return sendSuccess(res, alert, 'Portfolio alert retrieved successfully');
}

/**
 * Create portfolio alert
 */
export async function createPortfolioAlert(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    alert_type,
    alert_name,
    alert_condition,
    alert_threshold,
    is_active
  } = req.body;

  const [newAlert] = await db.insert(portfolioAlerts)
    .values({
      user_id: userId,
      alert_type,
      alert_name,
      alert_condition,
      alert_threshold,
      is_active: is_active ?? true
    })
    .returning();

  return sendCreated(res, newAlert, 'Portfolio alert created successfully');
}

/**
 * Update portfolio alert
 */
export async function updatePortfolioAlert(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(portfolioAlerts)
    .set(req.body)
    .where(
      and(
        eq(portfolioAlerts.alert_id, Number(id)),
        eq(portfolioAlerts.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Portfolio alert not found');
  }

  return sendSuccess(res, updated, 'Portfolio alert updated successfully');
}

/**
 * Delete portfolio alert
 */
export async function deletePortfolioAlert(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(portfolioAlerts)
    .where(
      and(
        eq(portfolioAlerts.alert_id, Number(id)),
        eq(portfolioAlerts.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Portfolio alert not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Portfolio alert deleted successfully');
}

/**
 * Acknowledge triggered alert
 */
export async function acknowledgeAlert(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(portfolioAlerts)
    .set({
      is_triggered: false,
      last_checked: new Date()
    })
    .where(
      and(
        eq(portfolioAlerts.alert_id, Number(id)),
        eq(portfolioAlerts.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Portfolio alert not found');
  }

  return sendSuccess(res, updated, 'Alert acknowledged successfully');
}

/**
 * Get active triggered alerts
 */
export async function getTriggeredAlerts(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const alerts = await db.select()
    .from(portfolioAlerts)
    .where(
      and(
        eq(portfolioAlerts.user_id, userId),
        eq(portfolioAlerts.is_active, true),
        eq(portfolioAlerts.is_triggered, true)
      )
    )
    .orderBy(portfolioAlerts.triggered_at);

  return sendSuccess(res, alerts, 'Triggered alerts retrieved successfully');
}

