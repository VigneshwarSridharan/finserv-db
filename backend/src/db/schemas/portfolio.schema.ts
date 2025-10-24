import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  date,
  decimal,
  integer,
  jsonb,
  index,
  check,
  unique,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema';
import { securities } from './brokers-securities.schema';

// Portfolio summary view (materialized view for performance)
export const portfolioSummary = pgTable('portfolio_summary', {
  summary_id: serial('summary_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  asset_type: varchar('asset_type', { length: 50 }).notNull(),
  total_investment: decimal('total_investment', { precision: 15, scale: 2 }).notNull().default('0'),
  current_value: decimal('current_value', { precision: 15, scale: 2 }).notNull().default('0'),
  unrealized_pnl: decimal('unrealized_pnl', { precision: 15, scale: 2 }).notNull().default('0'),
  realized_pnl: decimal('realized_pnl', { precision: 15, scale: 2 }).notNull().default('0'),
  total_pnl: decimal('total_pnl', { precision: 15, scale: 2 }).notNull().default('0'),
  percentage_of_portfolio: decimal('percentage_of_portfolio', { precision: 5, scale: 2 }).notNull().default('0'),
  last_updated: timestamp('last_updated').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_portfolio_summary_user_id').on(table.user_id),
  assetTypeIdx: index('idx_portfolio_summary_asset_type').on(table.asset_type),
  uniqueUserAssetType: unique('portfolio_summary_unique').on(table.user_id, table.asset_type),
  assetTypeCheck: check('asset_type_check', sql`${table.asset_type} IN ('securities', 'fixed_deposits', 'recurring_deposits', 'gold', 'real_estate', 'other_assets')`)
}));

// Portfolio performance tracking
export const portfolioPerformance = pgTable('portfolio_performance', {
  performance_id: serial('performance_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  performance_date: date('performance_date').notNull(),
  total_portfolio_value: decimal('total_portfolio_value', { precision: 15, scale: 2 }).notNull(),
  total_investment: decimal('total_investment', { precision: 15, scale: 2 }).notNull(),
  total_pnl: decimal('total_pnl', { precision: 15, scale: 2 }).notNull(),
  total_return_percentage: decimal('total_return_percentage', { precision: 5, scale: 2 }).notNull(),
  day_change: decimal('day_change', { precision: 15, scale: 2 }).default('0'),
  day_change_percentage: decimal('day_change_percentage', { precision: 5, scale: 2 }).default('0'),
  week_change: decimal('week_change', { precision: 15, scale: 2 }).default('0'),
  week_change_percentage: decimal('week_change_percentage', { precision: 5, scale: 2 }).default('0'),
  month_change: decimal('month_change', { precision: 15, scale: 2 }).default('0'),
  month_change_percentage: decimal('month_change_percentage', { precision: 5, scale: 2 }).default('0'),
  year_change: decimal('year_change', { precision: 15, scale: 2 }).default('0'),
  year_change_percentage: decimal('year_change_percentage', { precision: 5, scale: 2 }).default('0'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_portfolio_performance_user_id').on(table.user_id),
  dateIdx: index('idx_portfolio_performance_date').on(table.performance_date),
  uniqueUserDate: unique('portfolio_performance_unique').on(table.user_id, table.performance_date)
}));

// Portfolio goals and targets
export const portfolioGoals = pgTable('portfolio_goals', {
  goal_id: serial('goal_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  goal_name: varchar('goal_name', { length: 255 }).notNull(),
  goal_type: varchar('goal_type', { length: 50 }).notNull(),
  target_amount: decimal('target_amount', { precision: 15, scale: 2 }).notNull(),
  current_amount: decimal('current_amount', { precision: 15, scale: 2 }).default('0'),
  target_date: date('target_date').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium'),
  is_achieved: boolean('is_achieved').default(false),
  achieved_date: date('achieved_date'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_portfolio_goals_user_id').on(table.user_id),
  typeIdx: index('idx_portfolio_goals_type').on(table.goal_type),
  targetDateIdx: index('idx_portfolio_goals_target_date').on(table.target_date),
  goalTypeCheck: check('goal_type_check', sql`${table.goal_type} IN ('retirement', 'education', 'house_purchase', 'marriage', 'vacation', 'emergency_fund', 'other')`),
  priorityCheck: check('priority_check', sql`${table.priority} IN ('low', 'medium', 'high')`),
  targetAmountCheck: check('chk_goal_target_amount_positive', sql`${table.target_amount} > 0`)
}));

// Asset allocation targets
export const assetAllocationTargets = pgTable('asset_allocation_targets', {
  allocation_id: serial('allocation_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  asset_type: varchar('asset_type', { length: 50 }).notNull(),
  target_percentage: decimal('target_percentage', { precision: 5, scale: 2 }).notNull(),
  current_percentage: decimal('current_percentage', { precision: 5, scale: 2 }).default('0'),
  tolerance_band: decimal('tolerance_band', { precision: 5, scale: 2 }).default('5.00'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_asset_allocation_targets_user_id').on(table.user_id),
  assetTypeIdx: index('idx_asset_allocation_targets_asset_type').on(table.asset_type),
  uniqueUserAssetType: unique('asset_allocation_targets_unique').on(table.user_id, table.asset_type),
  assetTypeCheck: check('allocation_asset_type_check', sql`${table.asset_type} IN ('equity', 'debt', 'gold', 'real_estate', 'cash', 'other')`),
  allocationPercentageCheck: check('chk_allocation_percentage_valid', sql`${table.target_percentage} >= 0 AND ${table.target_percentage} <= 100`)
}));

// Portfolio alerts and notifications
export const portfolioAlerts = pgTable('portfolio_alerts', {
  alert_id: serial('alert_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  alert_type: varchar('alert_type', { length: 50 }).notNull(),
  alert_name: varchar('alert_name', { length: 255 }).notNull(),
  alert_condition: text('alert_condition').notNull(),
  alert_threshold: decimal('alert_threshold', { precision: 15, scale: 2 }),
  is_active: boolean('is_active').default(true),
  is_triggered: boolean('is_triggered').default(false),
  triggered_at: timestamp('triggered_at'),
  last_checked: timestamp('last_checked'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_portfolio_alerts_user_id').on(table.user_id),
  typeIdx: index('idx_portfolio_alerts_type').on(table.alert_type),
  activeIdx: index('idx_portfolio_alerts_active').on(table.is_active),
  alertTypeCheck: check('alert_type_check', sql`${table.alert_type} IN ('price_alert', 'allocation_alert', 'maturity_alert', 'goal_alert', 'performance_alert')`)
}));

// Portfolio reports and analytics
export const portfolioReports = pgTable('portfolio_reports', {
  report_id: serial('report_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  report_type: varchar('report_type', { length: 50 }).notNull(),
  report_period_start: date('report_period_start').notNull(),
  report_period_end: date('report_period_end').notNull(),
  total_investment: decimal('total_investment', { precision: 15, scale: 2 }).notNull(),
  total_value: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  total_pnl: decimal('total_pnl', { precision: 15, scale: 2 }).notNull(),
  total_return_percentage: decimal('total_return_percentage', { precision: 5, scale: 2 }).notNull(),
  best_performing_asset: varchar('best_performing_asset', { length: 255 }),
  worst_performing_asset: varchar('worst_performing_asset', { length: 255 }),
  report_data: jsonb('report_data'),
  generated_at: timestamp('generated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_portfolio_reports_user_id').on(table.user_id),
  typeIdx: index('idx_portfolio_reports_type').on(table.report_type),
  periodIdx: index('idx_portfolio_reports_period').on(table.report_period_start, table.report_period_end),
  reportTypeCheck: check('report_type_check', sql`${table.report_type} IN ('monthly', 'quarterly', 'yearly', 'custom')`)
}));

// Watchlist for securities
export const userWatchlist = pgTable('user_watchlist', {
  watchlist_id: serial('watchlist_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  security_id: integer('security_id').notNull().references(() => securities.security_id, { onDelete: 'cascade' }),
  target_price: decimal('target_price', { precision: 12, scale: 4 }),
  notes: text('notes'),
  added_date: date('added_date').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_watchlist_user_id').on(table.user_id),
  securityIdIdx: index('idx_user_watchlist_security_id').on(table.security_id),
  uniqueUserSecurity: unique('user_watchlist_unique').on(table.user_id, table.security_id)
}));

// Portfolio transactions log
export const portfolioTransactionsLog = pgTable('portfolio_transactions_log', {
  log_id: serial('log_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  transaction_type: varchar('transaction_type', { length: 50 }).notNull(),
  asset_type: varchar('asset_type', { length: 50 }).notNull(),
  asset_id: integer('asset_id'),
  transaction_amount: decimal('transaction_amount', { precision: 15, scale: 2 }).notNull(),
  transaction_date: timestamp('transaction_date').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_portfolio_transactions_log_user_id').on(table.user_id),
  typeIdx: index('idx_portfolio_transactions_log_type').on(table.transaction_type),
  dateIdx: index('idx_portfolio_transactions_log_date').on(table.transaction_date)
}));

// Type exports
export type PortfolioSummary = typeof portfolioSummary.$inferSelect;
export type NewPortfolioSummary = typeof portfolioSummary.$inferInsert;
export type PortfolioPerformance = typeof portfolioPerformance.$inferSelect;
export type NewPortfolioPerformance = typeof portfolioPerformance.$inferInsert;
export type PortfolioGoal = typeof portfolioGoals.$inferSelect;
export type NewPortfolioGoal = typeof portfolioGoals.$inferInsert;
export type AssetAllocationTarget = typeof assetAllocationTargets.$inferSelect;
export type NewAssetAllocationTarget = typeof assetAllocationTargets.$inferInsert;
export type PortfolioAlert = typeof portfolioAlerts.$inferSelect;
export type NewPortfolioAlert = typeof portfolioAlerts.$inferInsert;
export type PortfolioReport = typeof portfolioReports.$inferSelect;
export type NewPortfolioReport = typeof portfolioReports.$inferInsert;
export type UserWatchlist = typeof userWatchlist.$inferSelect;
export type NewUserWatchlist = typeof userWatchlist.$inferInsert;
export type PortfolioTransactionLog = typeof portfolioTransactionsLog.$inferSelect;
export type NewPortfolioTransactionLog = typeof portfolioTransactionsLog.$inferInsert;

