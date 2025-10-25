import { Request, Response } from 'express';
import { db } from '../config/database';
import { portfolioPerformance, portfolioSummary } from '../db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta, buildDateRangeFilter, combineFilters } from '../utils/query-helpers';
import { AuthRequest } from '../types';

/**
 * Get portfolio performance history with date range filter
 */
export async function getPortfolioPerformance(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { page, limit, start_date, end_date } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  // Build filters
  const filters = combineFilters([
    eq(portfolioPerformance.user_id, userId),
    buildDateRangeFilter(portfolioPerformance.performance_date, start_date as string, end_date as string)
  ]);

  // Query performance data
  const [items, countResult] = await Promise.all([
    db.select()
      .from(portfolioPerformance)
      .where(filters)
      .orderBy(desc(portfolioPerformance.performance_date))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(portfolioPerformance)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  return sendPaginated(res, items, pagination, 'Portfolio performance history retrieved successfully');
}

/**
 * Get current portfolio performance metrics
 */
export async function getCurrentPerformance(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Get latest performance record
  const [latestPerformance] = await db.select()
    .from(portfolioPerformance)
    .where(eq(portfolioPerformance.user_id, userId))
    .orderBy(desc(portfolioPerformance.performance_date))
    .limit(1);

  if (!latestPerformance) {
    // Calculate current performance from portfolio summary if no historical data
    const summary = await db.select()
      .from(portfolioSummary)
      .where(eq(portfolioSummary.user_id, userId));

    const totalInvestment = summary.reduce((sum, item) => sum + Number(item.total_investment), 0);
    const currentValue = summary.reduce((sum, item) => sum + Number(item.current_value), 0);
    const totalPnL = summary.reduce((sum, item) => sum + Number(item.total_pnl), 0);
    const returnPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

    return sendSuccess(res, {
      performance_date: new Date().toISOString().split('T')[0],
      total_portfolio_value: currentValue,
      total_investment: totalInvestment,
      total_pnl: totalPnL,
      total_return_percentage: returnPercentage,
      day_change: 0,
      day_change_percentage: 0,
      week_change: 0,
      week_change_percentage: 0,
      month_change: 0,
      month_change_percentage: 0,
      year_change: 0,
      year_change_percentage: 0,
      asset_breakdown: summary
    }, 'Current portfolio performance calculated');
  }

  // Get asset breakdown from portfolio summary
  const summary = await db.select()
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId));

  return sendSuccess(res, {
    ...latestPerformance,
    asset_breakdown: summary
  }, 'Current portfolio performance retrieved successfully');
}

/**
 * Record portfolio performance snapshot
 */
export async function recordPerformance(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    performance_date,
    total_portfolio_value,
    total_investment,
    total_pnl,
    total_return_percentage,
    day_change,
    day_change_percentage,
    week_change,
    week_change_percentage,
    month_change,
    month_change_percentage,
    year_change,
    year_change_percentage
  } = req.body;

  const [newPerformance] = await db.insert(portfolioPerformance)
    .values({
      user_id: userId,
      performance_date,
      total_portfolio_value,
      total_investment,
      total_pnl,
      total_return_percentage,
      day_change,
      day_change_percentage,
      week_change,
      week_change_percentage,
      month_change,
      month_change_percentage,
      year_change,
      year_change_percentage
    })
    .returning();

  return sendCreated(res, newPerformance, 'Portfolio performance recorded successfully');
}

/**
 * Get performance statistics
 */
export async function getPerformanceStats(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const stats = await db.select({
    total_records: sql<number>`count(*)::int`,
    best_day: sql<string>`max(${portfolioPerformance.day_change_percentage})`,
    worst_day: sql<string>`min(${portfolioPerformance.day_change_percentage})`,
    avg_return: sql<string>`avg(${portfolioPerformance.total_return_percentage})`,
    max_portfolio_value: sql<string>`max(${portfolioPerformance.total_portfolio_value})`,
    min_portfolio_value: sql<string>`min(${portfolioPerformance.total_portfolio_value})`
  })
    .from(portfolioPerformance)
    .where(eq(portfolioPerformance.user_id, userId));

  // Get monthly returns
  const monthlyReturns = await db.select({
    month: sql<string>`to_char(${portfolioPerformance.performance_date}, 'YYYY-MM')`,
    avg_return: sql<string>`avg(${portfolioPerformance.total_return_percentage})`,
    start_value: sql<string>`first_value(${portfolioPerformance.total_portfolio_value}) over (partition by to_char(${portfolioPerformance.performance_date}, 'YYYY-MM') order by ${portfolioPerformance.performance_date})`,
    end_value: sql<string>`last_value(${portfolioPerformance.total_portfolio_value}) over (partition by to_char(${portfolioPerformance.performance_date}, 'YYYY-MM') order by ${portfolioPerformance.performance_date})`
  })
    .from(portfolioPerformance)
    .where(eq(portfolioPerformance.user_id, userId))
    .groupBy(sql`to_char(${portfolioPerformance.performance_date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${portfolioPerformance.performance_date}, 'YYYY-MM') desc`)
    .limit(12);

  return sendSuccess(res, {
    statistics: stats[0],
    monthly_returns: monthlyReturns
  }, 'Performance statistics retrieved successfully');
}

