import { pgView, integer, varchar, decimal, date, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Comprehensive portfolio view
export const vPortfolioOverview = pgView('v_portfolio_overview').as((qb) => 
  qb.select({
    user_id: sql<number>`user_id`.as('user_id'),
    username: sql<string>`username`.as('username'),
    first_name: sql<string>`first_name`.as('first_name'),
    last_name: sql<string>`last_name`.as('last_name'),
    securities_value: sql<string>`securities_value`.as('securities_value'),
    fixed_deposits_value: sql<string>`fixed_deposits_value`.as('fixed_deposits_value'),
    recurring_deposits_value: sql<string>`recurring_deposits_value`.as('recurring_deposits_value'),
    assets_value: sql<string>`assets_value`.as('assets_value'),
    total_portfolio_value: sql<string>`total_portfolio_value`.as('total_portfolio_value'),
    total_investment: sql<string>`total_investment`.as('total_investment'),
    total_unrealized_pnl: sql<string>`total_unrealized_pnl`.as('total_unrealized_pnl')
  }).from(sql`users`)
);

// Securities holdings detailed view
export const vSecurityHoldings = pgView('v_security_holdings').as((qb) => 
  qb.select({
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    broker_name: sql<string>`broker_name`.as('broker_name'),
    account_number: sql<string>`account_number`.as('account_number'),
    symbol: sql<string>`symbol`.as('symbol'),
    security_name: sql<string>`security_name`.as('security_name'),
    security_type: sql<string>`security_type`.as('security_type'),
    exchange: sql<string>`exchange`.as('exchange'),
    sector: sql<string>`sector`.as('sector'),
    quantity: sql<string>`quantity`.as('quantity'),
    average_price: sql<string>`average_price`.as('average_price'),
    current_price: sql<string>`current_price`.as('current_price'),
    total_investment: sql<string>`total_investment`.as('total_investment'),
    current_value: sql<string>`current_value`.as('current_value'),
    unrealized_pnl: sql<string>`unrealized_pnl`.as('unrealized_pnl'),
    return_percentage: sql<string>`return_percentage`.as('return_percentage'),
    first_purchase_date: sql<string>`first_purchase_date`.as('first_purchase_date'),
    last_purchase_date: sql<string>`last_purchase_date`.as('last_purchase_date')
  }).from(sql`user_security_holdings`)
);

// Fixed deposits detailed view
export const vFixedDeposits = pgView('v_fixed_deposits').as((qb) => 
  qb.select({
    fd_id: sql<number>`fd_id`.as('fd_id'),
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    bank_name: sql<string>`bank_name`.as('bank_name'),
    account_number: sql<string>`account_number`.as('account_number'),
    fd_number: sql<string>`fd_number`.as('fd_number'),
    principal_amount: sql<string>`principal_amount`.as('principal_amount'),
    interest_rate: sql<string>`interest_rate`.as('interest_rate'),
    tenure_months: sql<number>`tenure_months`.as('tenure_months'),
    maturity_amount: sql<string>`maturity_amount`.as('maturity_amount'),
    start_date: sql<string>`start_date`.as('start_date'),
    maturity_date: sql<string>`maturity_date`.as('maturity_date'),
    interest_payout_frequency: sql<string>`interest_payout_frequency`.as('interest_payout_frequency'),
    auto_renewal: sql<boolean>`auto_renewal`.as('auto_renewal'),
    status: sql<string>`status`.as('status'),
    days_to_maturity: sql<number>`days_to_maturity`.as('days_to_maturity')
  }).from(sql`fixed_deposits`)
);

// Recurring deposits detailed view
export const vRecurringDeposits = pgView('v_recurring_deposits').as((qb) => 
  qb.select({
    rd_id: sql<number>`rd_id`.as('rd_id'),
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    bank_name: sql<string>`bank_name`.as('bank_name'),
    account_number: sql<string>`account_number`.as('account_number'),
    rd_number: sql<string>`rd_number`.as('rd_number'),
    monthly_installment: sql<string>`monthly_installment`.as('monthly_installment'),
    interest_rate: sql<string>`interest_rate`.as('interest_rate'),
    tenure_months: sql<number>`tenure_months`.as('tenure_months'),
    maturity_amount: sql<string>`maturity_amount`.as('maturity_amount'),
    start_date: sql<string>`start_date`.as('start_date'),
    maturity_date: sql<string>`maturity_date`.as('maturity_date'),
    installment_day: sql<number>`installment_day`.as('installment_day'),
    auto_debit: sql<boolean>`auto_debit`.as('auto_debit'),
    status: sql<string>`status`.as('status'),
    days_to_maturity: sql<number>`days_to_maturity`.as('days_to_maturity'),
    paid_installments: sql<number>`paid_installments`.as('paid_installments'),
    total_installments: sql<number>`total_installments`.as('total_installments')
  }).from(sql`recurring_deposits`)
);

// Assets detailed view
export const vUserAssets = pgView('v_user_assets').as((qb) => 
  qb.select({
    asset_id: sql<number>`asset_id`.as('asset_id'),
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    category_name: sql<string>`category_name`.as('category_name'),
    subcategory_name: sql<string>`subcategory_name`.as('subcategory_name'),
    asset_name: sql<string>`asset_name`.as('asset_name'),
    description: sql<string>`description`.as('description'),
    purchase_date: sql<string>`purchase_date`.as('purchase_date'),
    purchase_price: sql<string>`purchase_price`.as('purchase_price'),
    current_value: sql<string>`current_value`.as('current_value'),
    quantity: sql<string>`quantity`.as('quantity'),
    unit: sql<string>`unit`.as('unit'),
    location: sql<string>`location`.as('location'),
    storage_location: sql<string>`storage_location`.as('storage_location'),
    return_percentage: sql<string>`return_percentage`.as('return_percentage'),
    insurance_policy_number: sql<string>`insurance_policy_number`.as('insurance_policy_number'),
    insurance_company: sql<string>`insurance_company`.as('insurance_company'),
    insurance_amount: sql<string>`insurance_amount`.as('insurance_amount'),
    insurance_expiry_date: sql<string>`insurance_expiry_date`.as('insurance_expiry_date')
  }).from(sql`user_assets`)
);

// Portfolio performance view
export const vPortfolioPerformance = pgView('v_portfolio_performance').as((qb) => 
  qb.select({
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    performance_date: sql<string>`performance_date`.as('performance_date'),
    total_portfolio_value: sql<string>`total_portfolio_value`.as('total_portfolio_value'),
    total_investment: sql<string>`total_investment`.as('total_investment'),
    total_pnl: sql<string>`total_pnl`.as('total_pnl'),
    total_return_percentage: sql<string>`total_return_percentage`.as('total_return_percentage'),
    day_change: sql<string>`day_change`.as('day_change'),
    day_change_percentage: sql<string>`day_change_percentage`.as('day_change_percentage'),
    week_change: sql<string>`week_change`.as('week_change'),
    week_change_percentage: sql<string>`week_change_percentage`.as('week_change_percentage'),
    month_change: sql<string>`month_change`.as('month_change'),
    month_change_percentage: sql<string>`month_change_percentage`.as('month_change_percentage'),
    year_change: sql<string>`year_change`.as('year_change'),
    year_change_percentage: sql<string>`year_change_percentage`.as('year_change_percentage')
  }).from(sql`portfolio_performance`)
);

// Asset allocation view
export const vAssetAllocation = pgView('v_asset_allocation').as((qb) => 
  qb.select({
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    asset_type: sql<string>`asset_type`.as('asset_type'),
    target_percentage: sql<string>`target_percentage`.as('target_percentage'),
    current_percentage: sql<string>`current_percentage`.as('current_percentage'),
    tolerance_band: sql<string>`tolerance_band`.as('tolerance_band'),
    allocation_status: sql<string>`allocation_status`.as('allocation_status'),
    deviation_percentage: sql<string>`deviation_percentage`.as('deviation_percentage')
  }).from(sql`asset_allocation_targets`)
);

// Watchlist view
export const vUserWatchlist = pgView('v_user_watchlist').as((qb) => 
  qb.select({
    watchlist_id: sql<number>`watchlist_id`.as('watchlist_id'),
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    symbol: sql<string>`symbol`.as('symbol'),
    security_name: sql<string>`security_name`.as('security_name'),
    security_type: sql<string>`security_type`.as('security_type'),
    exchange: sql<string>`exchange`.as('exchange'),
    sector: sql<string>`sector`.as('sector'),
    current_price: sql<string>`current_price`.as('current_price'),
    target_price: sql<string>`target_price`.as('target_price'),
    target_achievement_percentage: sql<string>`target_achievement_percentage`.as('target_achievement_percentage'),
    notes: sql<string>`notes`.as('notes'),
    added_date: sql<string>`added_date`.as('added_date')
  }).from(sql`user_watchlist`)
);

// Recent transactions view
export const vRecentTransactions = pgView('v_recent_transactions').as((qb) => 
  qb.select({
    transaction_category: sql<string>`transaction_category`.as('transaction_category'),
    transaction_id: sql<number>`transaction_id`.as('transaction_id'),
    user_id: sql<number>`user_id`.as('user_id'),
    user_name: sql<string>`user_name`.as('user_name'),
    asset_symbol: sql<string>`asset_symbol`.as('asset_symbol'),
    asset_name: sql<string>`asset_name`.as('asset_name'),
    transaction_type: sql<string>`transaction_type`.as('transaction_type'),
    transaction_date: sql<string>`transaction_date`.as('transaction_date'),
    quantity: sql<string>`quantity`.as('quantity'),
    price: sql<string>`price`.as('price'),
    total_amount: sql<string>`total_amount`.as('total_amount'),
    net_amount: sql<string>`net_amount`.as('net_amount'),
    notes: sql<string>`notes`.as('notes')
  }).from(sql`security_transactions`)
);

// Security transactions detailed view
export const vSecurityTransactions = pgView('v_security_transactions').as((qb) => 
  qb.select({
    transaction_id: sql<number>`transaction_id`.as('transaction_id'),
    user_id: sql<number>`user_id`.as('user_id'),
    username: sql<string>`username`.as('username'),
    user_name: sql<string>`user_name`.as('user_name'),
    email: sql<string>`email`.as('email'),
    broker_name: sql<string>`broker_name`.as('broker_name'),
    broker_code: sql<string>`broker_code`.as('broker_code'),
    account_number: sql<string>`account_number`.as('account_number'),
    account_type: sql<string>`account_type`.as('account_type'),
    symbol: sql<string>`symbol`.as('symbol'),
    security_name: sql<string>`security_name`.as('security_name'),
    security_type: sql<string>`security_type`.as('security_type'),
    exchange: sql<string>`exchange`.as('exchange'),
    sector: sql<string>`sector`.as('sector'),
    industry: sql<string>`industry`.as('industry'),
    isin: sql<string>`isin`.as('isin'),
    transaction_type: sql<string>`transaction_type`.as('transaction_type'),
    transaction_date: sql<string>`transaction_date`.as('transaction_date'),
    quantity: sql<string>`quantity`.as('quantity'),
    price: sql<string>`price`.as('price'),
    total_amount: sql<string>`total_amount`.as('total_amount'),
    brokerage: sql<string>`brokerage`.as('brokerage'),
    taxes: sql<string>`taxes`.as('taxes'),
    other_charges: sql<string>`other_charges`.as('other_charges'),
    net_amount: sql<string>`net_amount`.as('net_amount'),
    effective_price_per_unit: sql<string>`effective_price_per_unit`.as('effective_price_per_unit'),
    total_charges: sql<string>`total_charges`.as('total_charges'),
    charges_percentage: sql<string>`charges_percentage`.as('charges_percentage'),
    current_avg_price: sql<string>`current_avg_price`.as('current_avg_price'),
    current_holding_quantity: sql<string>`current_holding_quantity`.as('current_holding_quantity'),
    current_price: sql<string>`current_price`.as('current_price'),
    unrealized_pnl_contribution: sql<string>`unrealized_pnl_contribution`.as('unrealized_pnl_contribution'),
    realized_pnl: sql<string>`realized_pnl`.as('realized_pnl'),
    return_percentage: sql<string>`return_percentage`.as('return_percentage'),
    notes: sql<string>`notes`.as('notes'),
    created_at: sql<string>`created_at`.as('created_at'),
    days_held: sql<number>`days_held`.as('days_held'),
    transaction_classification: sql<string>`transaction_classification`.as('transaction_classification'),
    cash_flow_impact: sql<string>`cash_flow_impact`.as('cash_flow_impact')
  }).from(sql`security_transactions`)
);

// Type exports
export type PortfolioOverview = typeof vPortfolioOverview.$inferSelect;
export type SecurityHolding = typeof vSecurityHoldings.$inferSelect;
export type FixedDepositView = typeof vFixedDeposits.$inferSelect;
export type RecurringDepositView = typeof vRecurringDeposits.$inferSelect;
export type UserAssetView = typeof vUserAssets.$inferSelect;
export type PortfolioPerformanceView = typeof vPortfolioPerformance.$inferSelect;
export type AssetAllocationView = typeof vAssetAllocation.$inferSelect;
export type UserWatchlistView = typeof vUserWatchlist.$inferSelect;
export type RecentTransaction = typeof vRecentTransactions.$inferSelect;
export type SecurityTransactionView = typeof vSecurityTransactions.$inferSelect;

