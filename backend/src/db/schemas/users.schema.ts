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

// Users table for basic user information
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
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  usernameIdx: index('idx_users_username').on(table.username),
  activeIdx: index('idx_users_active').on(table.is_active)
}));

// User profiles for additional information
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
}, (table) => ({
  userIdIdx: index('idx_user_profiles_user_id').on(table.user_id),
  riskProfileCheck: check('risk_profile_check', sql`${table.risk_profile} IN ('conservative', 'moderate', 'aggressive')`)
}));

// User preferences for portfolio management
export const userPreferences = pgTable('user_preferences', {
  preference_id: serial('preference_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  currency: varchar('currency', { length: 3 }).default('INR'),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Kolkata'),
  notification_email: boolean('notification_email').default(true),
  notification_sms: boolean('notification_sms').default(false),
  notification_push: boolean('notification_push').default(true),
  portfolio_view: varchar('portfolio_view', { length: 20 }).default('consolidated'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_preferences_user_id').on(table.user_id),
  portfolioViewCheck: check('portfolio_view_check', sql`${table.portfolio_view} IN ('consolidated', 'broker_wise', 'asset_wise')`)
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

