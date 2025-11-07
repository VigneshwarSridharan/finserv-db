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
  bigint,
  index,
  check,
  unique,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema';

// Brokers table for financial institutions
export const brokers = pgTable('brokers', {
  broker_id: serial('broker_id').primaryKey(),
  broker_name: varchar('broker_name', { length: 100 }).notNull(),
  broker_code: varchar('broker_code', { length: 20 }).notNull().unique(),
  broker_type: varchar('broker_type', { length: 50 }).notNull(),
  website: varchar('website', { length: 255 }),
  contact_email: varchar('contact_email', { length: 255 }),
  contact_phone: varchar('contact_phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('India'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  activeIdx: index('idx_brokers_active').on(table.is_active),
  typeIdx: index('idx_brokers_type').on(table.broker_type),
  brokerTypeCheck: check('broker_type_check', sql`${table.broker_type} IN ('full_service', 'discount', 'online', 'bank')`)
}));

// User broker accounts
export const userBrokerAccounts = pgTable('user_broker_accounts', {
  account_id: serial('account_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  broker_id: integer('broker_id').notNull().references(() => brokers.broker_id),
  account_number: varchar('account_number', { length: 50 }).notNull(),
  account_type: varchar('account_type', { length: 50 }).notNull(),
  account_name: varchar('account_name', { length: 100 }),
  is_active: boolean('is_active').default(true),
  opened_date: date('opened_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_broker_accounts_user_id').on(table.user_id),
  brokerIdIdx: index('idx_user_broker_accounts_broker_id').on(table.broker_id),
  uniqueUserBrokerAccount: unique('user_broker_accounts_unique').on(table.user_id, table.broker_id, table.account_number),
  accountTypeCheck: check('account_type_check', sql`${table.account_type} IN ('equity', 'commodity', 'currency', 'derivatives', 'mutual_fund')`)
}));

// Securities master data
export const securities = pgTable('securities', {
  security_id: serial('security_id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  security_type: varchar('security_type', { length: 50 }).notNull(),
  exchange: varchar('exchange', { length: 50 }).notNull(),
  sector: varchar('sector', { length: 100 }),
  industry: varchar('industry', { length: 100 }),
  market_cap_category: varchar('market_cap_category', { length: 20 }),
  isin: varchar('isin', { length: 12 }).unique(),
  face_value: decimal('face_value', { precision: 10, scale: 2 }),
  lot_size: integer('lot_size').default(1),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  symbolIdx: index('idx_securities_symbol').on(table.symbol),
  typeIdx: index('idx_securities_type').on(table.security_type),
  exchangeIdx: index('idx_securities_exchange').on(table.exchange),
  sectorIdx: index('idx_securities_sector').on(table.sector),
  uniqueSymbolExchange: unique('securities_symbol_exchange_unique').on(table.symbol, table.exchange),
  securityTypeCheck: check('security_type_check', sql`${table.security_type} IN ('stock', 'bond', 'mutual_fund', 'etf', 'commodity', 'currency')`),
  marketCapCheck: check('market_cap_check', sql`${table.market_cap_category} IN ('large_cap', 'mid_cap', 'small_cap', 'micro_cap')`)
}));

// Security prices (historical and current)
export const securityPrices = pgTable('security_prices', {
  price_id: serial('price_id').primaryKey(),
  security_id: integer('security_id').notNull().references(() => securities.security_id, { onDelete: 'cascade' }),
  price_date: date('price_date').notNull(),
  open_price: decimal('open_price', { precision: 12, scale: 4 }),
  high_price: decimal('high_price', { precision: 12, scale: 4 }),
  low_price: decimal('low_price', { precision: 12, scale: 4 }),
  close_price: decimal('close_price', { precision: 12, scale: 4 }).notNull(),
  volume: bigint('volume', { mode: 'number' }),
  adjusted_close: decimal('adjusted_close', { precision: 12, scale: 4 }),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  securityIdIdx: index('idx_security_prices_security_id').on(table.security_id),
  dateIdx: index('idx_security_prices_date').on(table.price_date),
  uniqueSecurityDate: unique('security_prices_unique').on(table.security_id, table.price_date)
}));

// User security holdings with generated columns
export const userSecurityHoldings = pgTable('user_security_holdings', {
  holding_id: serial('holding_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  account_id: integer('account_id').notNull().references(() => userBrokerAccounts.account_id),
  security_id: integer('security_id').notNull().references(() => securities.security_id),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  average_price: decimal('average_price', { precision: 12, scale: 4 }).notNull(),
  current_price: decimal('current_price', { precision: 12, scale: 4 }),
  // Note: Generated columns will be created via SQL migration
  // total_investment = quantity * average_price
  total_investment: decimal('total_investment', { precision: 15, scale: 2 }),
  // current_value = quantity * COALESCE(current_price, average_price)
  current_value: decimal('current_value', { precision: 15, scale: 2 }),
  // unrealized_pnl = quantity * (COALESCE(current_price, average_price) - average_price)
  unrealized_pnl: decimal('unrealized_pnl', { precision: 15, scale: 2 }),
  first_purchase_date: date('first_purchase_date'),
  last_purchase_date: date('last_purchase_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_security_holdings_user_id').on(table.user_id),
  accountIdIdx: index('idx_user_security_holdings_account_id').on(table.account_id),
  securityIdIdx: index('idx_user_security_holdings_security_id').on(table.security_id),
  uniqueUserAccountSecurity: unique('user_security_holdings_unique').on(table.user_id, table.account_id, table.security_id),
  quantityCheck: check('chk_quantity_positive', sql`${table.quantity} > 0`),
  avgPriceCheck: check('chk_avg_price_positive', sql`${table.average_price} > 0`)
}));

// Security transactions
export const securityTransactions = pgTable('security_transactions', {
  transaction_id: serial('transaction_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  account_id: integer('account_id').notNull().references(() => userBrokerAccounts.account_id),
  security_id: integer('security_id').notNull().references(() => securities.security_id),
  transaction_type: varchar('transaction_type', { length: 20 }).notNull(),
  transaction_date: date('transaction_date').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  price: decimal('price', { precision: 12, scale: 4 }).notNull(),
  total_amount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  brokerage: decimal('brokerage', { precision: 10, scale: 2 }).default('0'),
  taxes: decimal('taxes', { precision: 10, scale: 2 }).default('0'),
  other_charges: decimal('other_charges', { precision: 10, scale: 2 }).default('0'),
  net_amount: decimal('net_amount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_security_transactions_user_id').on(table.user_id),
  accountIdIdx: index('idx_security_transactions_account_id').on(table.account_id),
  securityIdIdx: index('idx_security_transactions_security_id').on(table.security_id),
  dateIdx: index('idx_security_transactions_date').on(table.transaction_date),
  typeIdx: index('idx_security_transactions_type').on(table.transaction_type),
  transactionTypeCheck: check('transaction_type_check', sql`${table.transaction_type} IN ('buy', 'sell', 'bonus', 'split', 'dividend')`)
}));

// Bond details (specific to bond securities)
export const bondDetails = pgTable('bond_details', {
  bond_id: serial('bond_id').primaryKey(),
  security_id: integer('security_id').notNull().references(() => securities.security_id, { onDelete: 'cascade' }).unique(),
  issuer: varchar('issuer', { length: 255 }).notNull(),
  coupon_rate: decimal('coupon_rate', { precision: 5, scale: 2 }),
  maturity_date: date('maturity_date').notNull(),
  coupon_payment_frequency: varchar('coupon_payment_frequency', { length: 20 }),
  bond_type: varchar('bond_type', { length: 50 }),
  credit_rating: varchar('credit_rating', { length: 10 }),
  yield_to_maturity: decimal('yield_to_maturity', { precision: 5, scale: 2 }),
  issue_date: date('issue_date'),
  next_coupon_date: date('next_coupon_date'),
  day_count_convention: varchar('day_count_convention', { length: 20 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  securityIdIdx: index('idx_bond_details_security_id').on(table.security_id),
  issuerIdx: index('idx_bond_details_issuer').on(table.issuer),
  maturityDateIdx: index('idx_bond_details_maturity_date').on(table.maturity_date),
  bondTypeIdx: index('idx_bond_details_bond_type').on(table.bond_type),
  uniqueSecurityId: unique('bond_details_security_id_unique').on(table.security_id),
  couponFrequencyCheck: check('coupon_payment_frequency_check', sql`${table.coupon_payment_frequency} IN ('annual', 'semi_annual', 'quarterly', 'monthly')`),
  bondTypeCheck: check('bond_type_check', sql`${table.bond_type} IN ('government', 'corporate', 'municipal', 'treasury', 'corporate_high_yield')`),
  creditRatingCheck: check('credit_rating_check', sql`${table.credit_rating} IN ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D')`),
  dayCountCheck: check('day_count_convention_check', sql`${table.day_count_convention} IN ('30/360', 'actual/365', 'actual/360')`)
}));

// Bond repayments (scheduled and actual payments)
export const bondRepayments = pgTable('bond_repayments', {
  repayment_id: serial('repayment_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  holding_id: integer('holding_id').notNull().references(() => userSecurityHoldings.holding_id, { onDelete: 'cascade' }),
  security_id: integer('security_id').notNull().references(() => securities.security_id, { onDelete: 'cascade' }),
  repayment_type: varchar('repayment_type', { length: 20 }).notNull(),
  scheduled_date: date('scheduled_date').notNull(),
  scheduled_amount: decimal('scheduled_amount', { precision: 15, scale: 2 }).notNull(),
  actual_payment_date: date('actual_payment_date'),
  actual_amount: decimal('actual_amount', { precision: 15, scale: 2 }),
  payment_status: varchar('payment_status', { length: 20 }).notNull().default('scheduled'),
  coupon_period_start: date('coupon_period_start'),
  coupon_period_end: date('coupon_period_end'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_bond_repayments_user_id').on(table.user_id),
  holdingIdIdx: index('idx_bond_repayments_holding_id').on(table.holding_id),
  securityIdIdx: index('idx_bond_repayments_security_id').on(table.security_id),
  scheduledDateIdx: index('idx_bond_repayments_scheduled_date').on(table.scheduled_date),
  paymentStatusIdx: index('idx_bond_repayments_payment_status').on(table.payment_status),
  repaymentTypeIdx: index('idx_bond_repayments_repayment_type').on(table.repayment_type),
  repaymentTypeCheck: check('repayment_type_check', sql`${table.repayment_type} IN ('coupon', 'principal')`),
  paymentStatusCheck: check('payment_status_check', sql`${table.payment_status} IN ('scheduled', 'paid', 'overdue', 'missed')`)
}));

// Type exports
export type Broker = typeof brokers.$inferSelect;
export type NewBroker = typeof brokers.$inferInsert;
export type UserBrokerAccount = typeof userBrokerAccounts.$inferSelect;
export type NewUserBrokerAccount = typeof userBrokerAccounts.$inferInsert;
export type Security = typeof securities.$inferSelect;
export type NewSecurity = typeof securities.$inferInsert;
export type SecurityPrice = typeof securityPrices.$inferSelect;
export type NewSecurityPrice = typeof securityPrices.$inferInsert;
export type UserSecurityHolding = typeof userSecurityHoldings.$inferSelect;
export type NewUserSecurityHolding = typeof userSecurityHoldings.$inferInsert;
export type SecurityTransaction = typeof securityTransactions.$inferSelect;
export type NewSecurityTransaction = typeof securityTransactions.$inferInsert;
export type BondDetail = typeof bondDetails.$inferSelect;
export type NewBondDetail = typeof bondDetails.$inferInsert;
export type BondRepayment = typeof bondRepayments.$inferSelect;
export type NewBondRepayment = typeof bondRepayments.$inferInsert;

