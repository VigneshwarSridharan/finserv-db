import { Request, Response } from 'express';
import { db } from '../config/database';
import { portfolioGoals } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildSortClause, combineFilters, buildFilterCondition } from '../utils/query-helpers';
import { AuthRequest } from '../types';

/**
 * List portfolio goals with filtering
 */
export async function listPortfolioGoals(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { page, limit, sortBy, sortOrder, goal_type, is_achieved, priority } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters
  const filters = combineFilters([
    eq(portfolioGoals.user_id, userId),
    buildFilterCondition(portfolioGoals.goal_type, goal_type as string),
    buildFilterCondition(portfolioGoals.is_achieved, is_achieved === 'true'),
    buildFilterCondition(portfolioGoals.priority, priority as string)
  ]);

  // Build sort
  const sortClause = buildSortClause(
    { sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc' },
    {
      goal_name: portfolioGoals.goal_name,
      target_date: portfolioGoals.target_date,
      target_amount: portfolioGoals.target_amount,
      priority: portfolioGoals.priority,
      created_at: portfolioGoals.created_at
    },
    portfolioGoals.target_date
  );

  // Query goals
  const [items, countResult] = await Promise.all([
    db.select()
      .from(portfolioGoals)
      .where(filters)
      .orderBy(sortClause!)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(portfolioGoals)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  // Calculate progress for each goal
  const goalsWithProgress = items.map(goal => {
    const targetAmount = Number(goal.target_amount);
    const currentAmount = Number(goal.current_amount || 0);
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = targetAmount - currentAmount;

    return {
      ...goal,
      progress_percentage: progress,
      remaining_amount: remaining
    };
  });

  return sendPaginated(res, goalsWithProgress, pagination, 'Portfolio goals retrieved successfully');
}

/**
 * Get goal by ID
 */
export async function getPortfolioGoalById(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [goal] = await db.select()
    .from(portfolioGoals)
    .where(
      and(
        eq(portfolioGoals.goal_id, Number(id)),
        eq(portfolioGoals.user_id, userId)
      )
    )
    .limit(1);

  if (!goal) {
    return sendNotFound(res, 'Portfolio goal not found');
  }

  const targetAmount = Number(goal.target_amount);
  const currentAmount = Number(goal.current_amount || 0);
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const remaining = targetAmount - currentAmount;

  return sendSuccess(res, {
    ...goal,
    progress_percentage: progress,
    remaining_amount: remaining
  }, 'Portfolio goal retrieved successfully');
}

/**
 * Create portfolio goal
 */
export async function createPortfolioGoal(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    goal_name,
    goal_type,
    target_amount,
    current_amount,
    target_date,
    priority,
    notes
  } = req.body;

  const [newGoal] = await db.insert(portfolioGoals)
    .values({
      user_id: userId,
      goal_name,
      goal_type,
      target_amount,
      current_amount: current_amount || '0',
      target_date,
      priority: priority || 'medium',
      notes
    })
    .returning();

  return sendCreated(res, newGoal, 'Portfolio goal created successfully');
}

/**
 * Update portfolio goal
 */
export async function updatePortfolioGoal(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(portfolioGoals)
    .set({
      ...req.body,
      updated_at: new Date()
    })
    .where(
      and(
        eq(portfolioGoals.goal_id, Number(id)),
        eq(portfolioGoals.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Portfolio goal not found');
  }

  return sendSuccess(res, updated, 'Portfolio goal updated successfully');
}

/**
 * Delete portfolio goal
 */
export async function deletePortfolioGoal(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(portfolioGoals)
    .where(
      and(
        eq(portfolioGoals.goal_id, Number(id)),
        eq(portfolioGoals.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Portfolio goal not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Portfolio goal deleted successfully');
}

/**
 * Mark goal as achieved
 */
export async function achieveGoal(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [updated] = await db.update(portfolioGoals)
    .set({
      is_achieved: true,
      achieved_date: new Date().toISOString().split('T')[0],
      updated_at: new Date()
    })
    .where(
      and(
        eq(portfolioGoals.goal_id, Number(id)),
        eq(portfolioGoals.user_id, userId)
      )
    )
    .returning();

  if (!updated) {
    return sendNotFound(res, 'Portfolio goal not found');
  }

  return sendSuccess(res, updated, 'Goal marked as achieved successfully');
}

/**
 * Get goals summary
 */
export async function getGoalsSummary(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const summary = await db.select({
    total_goals: sql<number>`count(*)::int`,
    achieved_goals: sql<number>`count(*) filter (where ${portfolioGoals.is_achieved} = true)::int`,
    pending_goals: sql<number>`count(*) filter (where ${portfolioGoals.is_achieved} = false)::int`,
    total_target_amount: sql<string>`sum(${portfolioGoals.target_amount})`,
    total_current_amount: sql<string>`sum(${portfolioGoals.current_amount})`
  })
    .from(portfolioGoals)
    .where(eq(portfolioGoals.user_id, userId));

  const totalTarget = Number(summary[0]?.total_target_amount || 0);
  const totalCurrent = Number(summary[0]?.total_current_amount || 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  // Get goal type breakdown
  const typeBreakdown = await db.select({
    goal_type: portfolioGoals.goal_type,
    goal_count: sql<number>`count(*)::int`,
    total_target: sql<string>`sum(${portfolioGoals.target_amount})`,
    total_current: sql<string>`sum(${portfolioGoals.current_amount})`
  })
    .from(portfolioGoals)
    .where(eq(portfolioGoals.user_id, userId))
    .groupBy(portfolioGoals.goal_type);

  return sendSuccess(res, {
    summary: {
      ...summary[0],
      overall_progress_percentage: overallProgress
    },
    type_breakdown: typeBreakdown
  }, 'Goals summary retrieved successfully');
}

