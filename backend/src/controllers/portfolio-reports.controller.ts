import { Request, Response } from 'express';
import { db } from '../config/database';
import { portfolioReports, portfolioSummary, portfolioPerformance } from '../db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/response-formatter';
import { parsePagination, getPaginationMeta } from '../utils/query-helpers';
import { AuthRequest } from '../types';

/**
 * List generated reports
 */
export async function listReports(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { page, limit, report_type } = req.query;

  const { offset, limit: pageSize, page: currentPage } = parsePagination({ page: Number(page), limit: Number(limit) });

  const filters = report_type 
    ? and(eq(portfolioReports.user_id, userId), eq(portfolioReports.report_type, report_type as string))
    : eq(portfolioReports.user_id, userId);

  const [items, countResult] = await Promise.all([
    db.select()
      .from(portfolioReports)
      .where(filters)
      .orderBy(desc(portfolioReports.generated_at))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(portfolioReports)
      .where(filters)
  ]);

  const totalItems = countResult[0]?.count || 0;
  const pagination = getPaginationMeta(currentPage, pageSize, totalItems);

  return sendPaginated(res, items, pagination, 'Portfolio reports retrieved successfully');
}

/**
 * Get report by ID with full details
 */
export async function getReportById(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [report] = await db.select()
    .from(portfolioReports)
    .where(
      and(
        eq(portfolioReports.report_id, Number(id)),
        eq(portfolioReports.user_id, userId)
      )
    )
    .limit(1);

  if (!report) {
    return sendNotFound(res, 'Report not found');
  }

  return sendSuccess(res, report, 'Report retrieved successfully');
}

/**
 * Generate a new portfolio report
 */
export async function generateReport(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const {
    report_type,
    report_period_start,
    report_period_end
  } = req.body;

  // Get portfolio summary for the period
  const summary = await db.select()
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId));

  const totalInvestment = summary.reduce((sum, item) => sum + Number(item.total_investment), 0);
  const totalValue = summary.reduce((sum, item) => sum + Number(item.current_value), 0);
  const totalPnL = summary.reduce((sum, item) => sum + Number(item.total_pnl), 0);
  const returnPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  // Get performance data for the period
  const performanceData = await db.select()
    .from(portfolioPerformance)
    .where(
      and(
        eq(portfolioPerformance.user_id, userId),
        gte(portfolioPerformance.performance_date, report_period_start),
        lte(portfolioPerformance.performance_date, report_period_end)
      )
    )
    .orderBy(portfolioPerformance.performance_date);

  // Calculate best and worst performing assets
  const assetPerformance = summary
    .map(item => ({
      asset_type: item.asset_type,
      return_percentage: Number(item.total_investment) > 0 
        ? (Number(item.total_pnl) / Number(item.total_investment)) * 100 
        : 0
    }))
    .sort((a, b) => b.return_percentage - a.return_percentage);

  const bestPerforming = assetPerformance[0]?.asset_type || null;
  const worstPerforming = assetPerformance[assetPerformance.length - 1]?.asset_type || null;

  // Compile report data
  const reportData = {
    summary: {
      total_investment: totalInvestment,
      total_value: totalValue,
      total_pnl: totalPnL,
      return_percentage: returnPercentage
    },
    asset_breakdown: summary.map(item => ({
      asset_type: item.asset_type,
      investment: Number(item.total_investment),
      current_value: Number(item.current_value),
      pnl: Number(item.total_pnl),
      percentage_of_portfolio: Number(item.percentage_of_portfolio)
    })),
    performance_trend: performanceData.map(p => ({
      date: p.performance_date,
      value: Number(p.total_portfolio_value),
      return_percentage: Number(p.total_return_percentage)
    })),
    best_performer: bestPerforming,
    worst_performer: worstPerforming
  };

  // Create report record
  const [newReport] = await db.insert(portfolioReports)
    .values({
      user_id: userId,
      report_type,
      report_period_start,
      report_period_end,
      total_investment: totalInvestment.toString(),
      total_value: totalValue.toString(),
      total_pnl: totalPnL.toString(),
      total_return_percentage: returnPercentage.toString(),
      best_performing_asset: bestPerforming,
      worst_performing_asset: worstPerforming,
      report_data: reportData
    })
    .returning();

  return sendCreated(res, newReport, 'Report generated successfully');
}

/**
 * Delete a report
 */
export async function deleteReport(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { id } = req.params;

  const [deleted] = await db.delete(portfolioReports)
    .where(
      and(
        eq(portfolioReports.report_id, Number(id)),
        eq(portfolioReports.user_id, userId)
      )
    )
    .returning();

  if (!deleted) {
    return sendNotFound(res, 'Report not found');
  }

  return sendSuccess(res, { id: Number(id) }, 'Report deleted successfully');
}

