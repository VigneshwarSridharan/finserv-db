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
  index,
  check,
  unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema';

// Banks table for financial institutions
export const banks = pgTable('banks', {
  bank_id: serial('bank_id').primaryKey(),
  bank_name: varchar('bank_name', { length: 100 }).notNull(),
  bank_code: varchar('bank_code', { length: 20 }).notNull().unique(),
  bank_type: varchar('bank_type', { length: 50 }).notNull(),
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
  activeIdx: index('idx_banks_active').on(table.is_active),
  typeIdx: index('idx_banks_type').on(table.bank_type),
  bankTypeCheck: check('bank_type_check', sql`${table.bank_type} IN ('public', 'private', 'foreign', 'cooperative', 'small_finance', 'payment')`)
}));

// User bank accounts
export const userBankAccounts = pgTable('user_bank_accounts', {
  account_id: serial('account_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  bank_id: integer('bank_id').notNull().references(() => banks.bank_id),
  account_number: varchar('account_number', { length: 50 }).notNull(),
  account_type: varchar('account_type', { length: 50 }).notNull(),
  account_name: varchar('account_name', { length: 100 }),
  ifsc_code: varchar('ifsc_code', { length: 11 }),
  branch_name: varchar('branch_name', { length: 100 }),
  is_active: boolean('is_active').default(true),
  opened_date: date('opened_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_bank_accounts_user_id').on(table.user_id),
  bankIdIdx: index('idx_user_bank_accounts_bank_id').on(table.bank_id),
  uniqueUserBankAccount: unique('user_bank_accounts_unique').on(table.user_id, table.bank_id, table.account_number),
  accountTypeCheck: check('account_type_check', sql`${table.account_type} IN ('savings', 'current', 'fixed_deposit', 'recurring_deposit', 'nro', 'nre')`)
}));

// Fixed Deposits
export const fixedDeposits = pgTable('fixed_deposits', {
  fd_id: serial('fd_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  account_id: integer('account_id').notNull().references(() => userBankAccounts.account_id),
  fd_number: varchar('fd_number', { length: 50 }).notNull(),
  principal_amount: decimal('principal_amount', { precision: 15, scale: 2 }).notNull(),
  interest_rate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
  tenure_months: integer('tenure_months').notNull(),
  maturity_amount: decimal('maturity_amount', { precision: 15, scale: 2 }),
  start_date: date('start_date').notNull(),
  maturity_date: date('maturity_date').notNull(),
  interest_payout_frequency: varchar('interest_payout_frequency', { length: 20 }).default('maturity'),
  auto_renewal: boolean('auto_renewal').default(false),
  premature_withdrawal_allowed: boolean('premature_withdrawal_allowed').default(true),
  premature_penalty_rate: decimal('premature_penalty_rate', { precision: 5, scale: 2 }).default('1.00'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_fixed_deposits_user_id').on(table.user_id),
  accountIdIdx: index('idx_fixed_deposits_account_id').on(table.account_id),
  maturityDateIdx: index('idx_fixed_deposits_maturity_date').on(table.maturity_date),
  uniqueUserAccountFd: unique('fixed_deposits_unique').on(table.user_id, table.account_id, table.fd_number),
  interestPayoutCheck: check('interest_payout_check', sql`${table.interest_payout_frequency} IN ('monthly', 'quarterly', 'half_yearly', 'yearly', 'maturity')`),
  principalCheck: check('chk_fd_principal_positive', sql`${table.principal_amount} > 0`),
  interestRateCheck: check('chk_fd_interest_rate_positive', sql`${table.interest_rate} > 0`),
  tenureCheck: check('chk_fd_tenure_positive', sql`${table.tenure_months} > 0`)
}));

// Fixed Deposit Interest Payments
export const fdInterestPayments = pgTable('fd_interest_payments', {
  payment_id: serial('payment_id').primaryKey(),
  fd_id: integer('fd_id').notNull().references(() => fixedDeposits.fd_id, { onDelete: 'cascade' }),
  payment_date: date('payment_date').notNull(),
  interest_amount: decimal('interest_amount', { precision: 15, scale: 2 }).notNull(),
  cumulative_interest: decimal('cumulative_interest', { precision: 15, scale: 2 }).notNull(),
  payment_status: varchar('payment_status', { length: 20 }).default('pending'),
  credited_date: date('credited_date'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  fdIdIdx: index('idx_fd_interest_payments_fd_id').on(table.fd_id),
  dateIdx: index('idx_fd_interest_payments_date').on(table.payment_date),
  paymentStatusCheck: check('payment_status_check', sql`${table.payment_status} IN ('pending', 'credited', 'reinvested')`)
}));

// Recurring Deposits
export const recurringDeposits = pgTable('recurring_deposits', {
  rd_id: serial('rd_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  account_id: integer('account_id').notNull().references(() => userBankAccounts.account_id),
  rd_number: varchar('rd_number', { length: 50 }).notNull(),
  monthly_installment: decimal('monthly_installment', { precision: 15, scale: 2 }).notNull(),
  interest_rate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
  tenure_months: integer('tenure_months').notNull(),
  maturity_amount: decimal('maturity_amount', { precision: 15, scale: 2 }),
  start_date: date('start_date').notNull(),
  maturity_date: date('maturity_date').notNull(),
  installment_day: integer('installment_day').notNull(),
  auto_debit: boolean('auto_debit').default(true),
  premature_closure_allowed: boolean('premature_closure_allowed').default(true),
  premature_penalty_rate: decimal('premature_penalty_rate', { precision: 5, scale: 2 }).default('1.00'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_recurring_deposits_user_id').on(table.user_id),
  accountIdIdx: index('idx_recurring_deposits_account_id').on(table.account_id),
  maturityDateIdx: index('idx_recurring_deposits_maturity_date').on(table.maturity_date),
  uniqueUserAccountRd: unique('recurring_deposits_unique').on(table.user_id, table.account_id, table.rd_number),
  installmentDayCheck: check('installment_day_check', sql`${table.installment_day} BETWEEN 1 AND 31`),
  installmentCheck: check('chk_rd_installment_positive', sql`${table.monthly_installment} > 0`),
  interestRateCheck: check('chk_rd_interest_rate_positive', sql`${table.interest_rate} > 0`),
  tenureCheck: check('chk_rd_tenure_positive', sql`${table.tenure_months} > 0`)
}));

// Recurring Deposit Installments
export const rdInstallments = pgTable('rd_installments', {
  installment_id: serial('installment_id').primaryKey(),
  rd_id: integer('rd_id').notNull().references(() => recurringDeposits.rd_id, { onDelete: 'cascade' }),
  installment_number: integer('installment_number').notNull(),
  due_date: date('due_date').notNull(),
  installment_amount: decimal('installment_amount', { precision: 15, scale: 2 }).notNull(),
  paid_amount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  paid_date: date('paid_date'),
  late_fee: decimal('late_fee', { precision: 10, scale: 2 }).default('0'),
  payment_status: varchar('payment_status', { length: 20 }).default('pending'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  rdIdIdx: index('idx_rd_installments_rd_id').on(table.rd_id),
  dueDateIdx: index('idx_rd_installments_due_date').on(table.due_date),
  statusIdx: index('idx_rd_installments_status').on(table.payment_status),
  uniqueRdInstallment: unique('rd_installments_unique').on(table.rd_id, table.installment_number),
  paymentStatusCheck: check('installment_payment_status_check', sql`${table.payment_status} IN ('pending', 'paid', 'overdue', 'waived')`)
}));

// Bank transactions for deposits
export const bankTransactions = pgTable('bank_transactions', {
  transaction_id: serial('transaction_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  account_id: integer('account_id').notNull().references(() => userBankAccounts.account_id),
  transaction_type: varchar('transaction_type', { length: 50 }).notNull(),
  transaction_date: date('transaction_date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  balance_after: decimal('balance_after', { precision: 15, scale: 2 }),
  reference_number: varchar('reference_number', { length: 100 }),
  description: text('description'),
  related_fd_id: integer('related_fd_id').references(() => fixedDeposits.fd_id),
  related_rd_id: integer('related_rd_id').references(() => recurringDeposits.rd_id),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_bank_transactions_user_id').on(table.user_id),
  accountIdIdx: index('idx_bank_transactions_account_id').on(table.account_id),
  dateIdx: index('idx_bank_transactions_date').on(table.transaction_date),
  typeIdx: index('idx_bank_transactions_type').on(table.transaction_type),
  transactionTypeCheck: check('transaction_type_check', sql`${table.transaction_type} IN ('fd_creation', 'fd_interest', 'fd_maturity', 'rd_installment', 'rd_maturity', 'transfer', 'withdrawal', 'deposit')`)
}));

// Type exports
export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;
export type UserBankAccount = typeof userBankAccounts.$inferSelect;
export type NewUserBankAccount = typeof userBankAccounts.$inferInsert;
export type FixedDeposit = typeof fixedDeposits.$inferSelect;
export type NewFixedDeposit = typeof fixedDeposits.$inferInsert;
export type FdInterestPayment = typeof fdInterestPayments.$inferSelect;
export type NewFdInterestPayment = typeof fdInterestPayments.$inferInsert;
export type RecurringDeposit = typeof recurringDeposits.$inferSelect;
export type NewRecurringDeposit = typeof recurringDeposits.$inferInsert;
export type RdInstallment = typeof rdInstallments.$inferSelect;
export type NewRdInstallment = typeof rdInstallments.$inferInsert;
export type BankTransaction = typeof bankTransactions.$inferSelect;
export type NewBankTransaction = typeof bankTransactions.$inferInsert;

