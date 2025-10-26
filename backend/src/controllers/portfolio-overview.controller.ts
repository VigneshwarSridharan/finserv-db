import { Request, Response } from 'express';
import { db } from '../config/database';
import { 
  portfolioSummary, 
  portfolioPerformance, 
  portfolioGoals,
  userAssets,
  userSecurityHoldings,
  fixedDeposits,
  recurringDeposits
} from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { sendSuccess } from '../utils/response-formatter';
import { AuthRequest } from '../types';

/**
 * Get comprehensive portfolio overview
 */
export async function getPortfolioOverview(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Get portfolio summary
  const summary = await db.select()
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId));

  const totalInvestment = summary.reduce((sum, item) => sum + Number(item.total_investment), 0);
  const totalValue = summary.reduce((sum, item) => sum + Number(item.current_value), 0);
  const totalPnL = summary.reduce((sum, item) => sum + Number(item.total_pnl), 0);
  const returnPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  // Get latest performance
  const [latestPerformance] = await db.select()
    .from(portfolioPerformance)
    .where(eq(portfolioPerformance.user_id, userId))
    .orderBy(desc(portfolioPerformance.performance_date))
    .limit(1);

  // Get goals summary
  const goalsSummary = await db.select({
    total_goals: sql<number>`count(*)::int`,
    achieved_goals: sql<number>`count(*) filter (where ${portfolioGoals.is_achieved} = true)::int`,
    pending_goals: sql<number>`count(*) filter (where ${portfolioGoals.is_achieved} = false)::int`
  })
    .from(portfolioGoals)
    .where(eq(portfolioGoals.user_id, userId));

  // Get asset counts by category
  const assetCounts = {
    securities: await db.select({ count: sql<number>`count(*)::int` })
      .from(userSecurityHoldings)
      .where(eq(userSecurityHoldings.user_id, userId)),
    fixed_deposits: await db.select({ count: sql<number>`count(*)::int` })
      .from(fixedDeposits)
      .where(eq(fixedDeposits.user_id, userId)),
    recurring_deposits: await db.select({ count: sql<number>`count(*)::int` })
      .from(recurringDeposits)
      .where(eq(recurringDeposits.user_id, userId)),
    other_assets: await db.select({ count: sql<number>`count(*)::int` })
      .from(userAssets)
      .where(and(eq(userAssets.user_id, userId), eq(userAssets.is_active, true)))
  };

  return sendSuccess(res, {
    overview: {
      total_investment: totalInvestment,
      total_value: totalValue,
      total_pnl: totalPnL,
      return_percentage: returnPercentage,
      day_change: latestPerformance?.day_change || 0,
      day_change_percentage: latestPerformance?.day_change_percentage || 0
    },
    asset_breakdown: summary.map(item => ({
      asset_type: item.asset_type,
      investment: Number(item.total_investment),
      current_value: Number(item.current_value),
      pnl: Number(item.total_pnl),
      percentage: Number(item.percentage_of_portfolio)
    })),
    goals: goalsSummary[0],
    asset_counts: {
      securities: assetCounts.securities[0]?.count || 0,
      fixed_deposits: assetCounts.fixed_deposits[0]?.count || 0,
      recurring_deposits: assetCounts.recurring_deposits[0]?.count || 0,
      other_assets: assetCounts.other_assets[0]?.count || 0
    }
  }, 'Portfolio overview retrieved successfully');
}

/**
 * Get portfolio dashboard with key metrics
 */
export async function getPortfolioDashboard(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Get portfolio summary
  const summary = await db.select()
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId));

  const totalInvestment = summary.reduce((sum, item) => sum + Number(item.total_investment), 0);
  const totalValue = summary.reduce((sum, item) => sum + Number(item.current_value), 0);
  const totalPnL = summary.reduce((sum, item) => sum + Number(item.total_pnl), 0);

  // Get recent performance (last 30 days)
  const recentPerformance = await db.select()
    .from(portfolioPerformance)
    .where(eq(portfolioPerformance.user_id, userId))
    .orderBy(desc(portfolioPerformance.performance_date))
    .limit(30);

  // Get top gainers and losers from asset breakdown
  const assetPerformance = summary
    .map(item => ({
      asset_type: item.asset_type,
      pnl: Number(item.total_pnl),
      return_percentage: Number(item.total_investment) > 0 
        ? (Number(item.total_pnl) / Number(item.total_investment)) * 100 
        : 0
    }))
    .sort((a, b) => b.return_percentage - a.return_percentage);

  const topGainers = assetPerformance.filter(a => a.pnl > 0).slice(0, 5);
  const topLosers = assetPerformance.filter(a => a.pnl < 0).slice(-5).reverse();

  return sendSuccess(res, {
    summary: {
      total_investment: totalInvestment,
      total_value: totalValue,
      total_pnl: totalPnL,
      return_percentage: totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0
    },
    recent_performance: recentPerformance.slice(0, 7).map(p => ({
      date: p.performance_date,
      value: Number(p.total_portfolio_value),
      change: Number(p.day_change_percentage)
    })),
    top_gainers: topGainers,
    top_losers: topLosers,
    asset_allocation: summary.map(item => ({
      asset_type: item.asset_type,
      percentage: Number(item.percentage_of_portfolio),
      value: Number(item.current_value)
    }))
  }, 'Portfolio dashboard retrieved successfully');
}

/**
 * Get sector-wise allocation for securities
 */
export async function getSectorAllocation(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const sectorAllocation = await db.execute(sql`
    SELECT 
      s.sector,
      COUNT(sh.holding_id) as holding_count,
      SUM(sh.total_investment) as total_investment,
      SUM(sh.current_value) as current_value,
      SUM(sh.unrealized_pnl) as unrealized_pnl
    FROM security_holdings sh
    JOIN securities s ON sh.security_id = s.security_id
    WHERE sh.user_id = ${userId}
    GROUP BY s.sector
    ORDER BY current_value DESC
  `);

  return sendSuccess(res, sectorAllocation.rows, 'Sector allocation retrieved successfully');
}

/**
 * Get asset type distribution
 */
export async function getAssetTypeDistribution(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const distribution = await db.select({
    asset_type: portfolioSummary.asset_type,
    total_investment: portfolioSummary.total_investment,
    current_value: portfolioSummary.current_value,
    total_pnl: portfolioSummary.total_pnl,
    percentage_of_portfolio: portfolioSummary.percentage_of_portfolio
  })
    .from(portfolioSummary)
    .where(eq(portfolioSummary.user_id, userId))
    .orderBy(desc(portfolioSummary.current_value));

  const totalValue = distribution.reduce((sum, item) => sum + Number(item.current_value), 0);

  const distributionWithPercentages = distribution.map(item => ({
    asset_type: item.asset_type,
    investment: Number(item.total_investment),
    current_value: Number(item.current_value),
    pnl: Number(item.total_pnl),
    percentage: totalValue > 0 ? (Number(item.current_value) / totalValue) * 100 : 0
  }));

  return sendSuccess(res, {
    total_portfolio_value: totalValue,
    distribution: distributionWithPercentages
  }, 'Asset type distribution retrieved successfully');
}

