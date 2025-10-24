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
  uniqueIndex
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  date_of_birth: date('date_of_birth'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Portfolio Summary table
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
}, (table) => {
  return {
    uniqueUserAssetType: uniqueIndex('unique_user_asset_type').on(table.user_id, table.asset_type)
  };
});

// User Profiles table (optional, for extended user info)
export const userProfiles = pgTable('user_profiles', {
  profile_id: serial('profile_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  postal_code: varchar('postal_code', { length: 20 }),
  pan_number: varchar('pan_number', { length: 10 }).unique(),
  aadhar_number: varchar('aadhar_number', { length: 12 }).unique(),
  occupation: varchar('occupation', { length: 100 }),
  annual_income: decimal('annual_income', { precision: 15, scale: 2 }),
  risk_profile: varchar('risk_profile', { length: 20 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

