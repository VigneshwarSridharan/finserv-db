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

// Asset categories
export const assetCategories = pgTable('asset_categories', {
  category_id: serial('category_id').primaryKey(),
  category_name: varchar('category_name', { length: 100 }).notNull().unique(),
  category_type: varchar('category_type', { length: 50 }).notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  typeIdx: index('idx_asset_categories_type').on(table.category_type),
  categoryTypeCheck: check('category_type_check', sql`${table.category_type} IN ('precious_metal', 'real_estate', 'commodity', 'collectible', 'other')`)
}));

// Asset subcategories
export const assetSubcategories = pgTable('asset_subcategories', {
  subcategory_id: serial('subcategory_id').primaryKey(),
  category_id: integer('category_id').notNull().references(() => assetCategories.category_id),
  subcategory_name: varchar('subcategory_name', { length: 100 }).notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  categoryIdIdx: index('idx_asset_subcategories_category_id').on(table.category_id),
  uniqueCategorySubcategory: unique('asset_subcategories_unique').on(table.category_id, table.subcategory_name)
}));

// User assets
export const userAssets = pgTable('user_assets', {
  asset_id: serial('asset_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => assetCategories.category_id),
  subcategory_id: integer('subcategory_id').references(() => assetSubcategories.subcategory_id),
  asset_name: varchar('asset_name', { length: 255 }).notNull(),
  description: text('description'),
  purchase_date: date('purchase_date').notNull(),
  purchase_price: decimal('purchase_price', { precision: 15, scale: 2 }).notNull(),
  current_value: decimal('current_value', { precision: 15, scale: 2 }),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  location: varchar('location', { length: 255 }),
  storage_location: varchar('storage_location', { length: 255 }),
  insurance_policy_number: varchar('insurance_policy_number', { length: 100 }),
  insurance_company: varchar('insurance_company', { length: 100 }),
  insurance_amount: decimal('insurance_amount', { precision: 15, scale: 2 }),
  insurance_expiry_date: date('insurance_expiry_date'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_assets_user_id').on(table.user_id),
  categoryIdIdx: index('idx_user_assets_category_id').on(table.category_id),
  subcategoryIdIdx: index('idx_user_assets_subcategory_id').on(table.subcategory_id),
  purchaseDateIdx: index('idx_user_assets_purchase_date').on(table.purchase_date),
  quantityCheck: check('chk_asset_quantity_positive', sql`${table.quantity} > 0`),
  purchasePriceCheck: check('chk_asset_purchase_price_positive', sql`${table.purchase_price} > 0`)
}));

// Asset valuations (historical and current)
export const assetValuations = pgTable('asset_valuations', {
  valuation_id: serial('valuation_id').primaryKey(),
  asset_id: integer('asset_id').notNull().references(() => userAssets.asset_id, { onDelete: 'cascade' }),
  valuation_date: date('valuation_date').notNull(),
  valuation_amount: decimal('valuation_amount', { precision: 15, scale: 2 }).notNull(),
  valuation_method: varchar('valuation_method', { length: 50 }).notNull(),
  valuation_source: varchar('valuation_source', { length: 100 }),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  assetIdIdx: index('idx_asset_valuations_asset_id').on(table.asset_id),
  dateIdx: index('idx_asset_valuations_date').on(table.valuation_date),
  uniqueAssetDate: unique('asset_valuations_unique').on(table.asset_id, table.valuation_date),
  valuationMethodCheck: check('valuation_method_check', sql`${table.valuation_method} IN ('market_price', 'appraisal', 'index_based', 'manual')`),
  valuationAmountCheck: check('chk_valuation_amount_positive', sql`${table.valuation_amount} > 0`)
}));

// Asset transactions (purchases, sales, transfers)
export const assetTransactions = pgTable('asset_transactions', {
  transaction_id: serial('transaction_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  asset_id: integer('asset_id').notNull().references(() => userAssets.asset_id),
  transaction_type: varchar('transaction_type', { length: 20 }).notNull(),
  transaction_date: date('transaction_date').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  price_per_unit: decimal('price_per_unit', { precision: 15, scale: 2 }).notNull(),
  total_amount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  transaction_fees: decimal('transaction_fees', { precision: 10, scale: 2 }).default('0'),
  net_amount: decimal('net_amount', { precision: 15, scale: 2 }).notNull(),
  counterparty: varchar('counterparty', { length: 255 }),
  transaction_reference: varchar('transaction_reference', { length: 100 }),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_asset_transactions_user_id').on(table.user_id),
  assetIdIdx: index('idx_asset_transactions_asset_id').on(table.asset_id),
  dateIdx: index('idx_asset_transactions_date').on(table.transaction_date),
  typeIdx: index('idx_asset_transactions_type').on(table.transaction_type),
  transactionTypeCheck: check('transaction_type_check', sql`${table.transaction_type} IN ('purchase', 'sale', 'transfer', 'gift', 'inheritance', 'valuation_update')`),
  quantityCheck: check('chk_transaction_quantity_positive', sql`${table.quantity} > 0`),
  priceCheck: check('chk_transaction_price_positive', sql`${table.price_per_unit} > 0`)
}));

// Real Estate specific fields
export const realEstateDetails = pgTable('real_estate_details', {
  property_id: serial('property_id').primaryKey(),
  asset_id: integer('asset_id').notNull().references(() => userAssets.asset_id, { onDelete: 'cascade' }),
  property_type: varchar('property_type', { length: 50 }).notNull(),
  property_address: text('property_address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 10 }),
  area_sqft: decimal('area_sqft', { precision: 10, scale: 2 }),
  built_up_area_sqft: decimal('built_up_area_sqft', { precision: 10, scale: 2 }),
  year_built: integer('year_built'),
  floors: integer('floors'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  parking_spaces: integer('parking_spaces'),
  registration_number: varchar('registration_number', { length: 100 }),
  registration_date: date('registration_date'),
  property_tax_number: varchar('property_tax_number', { length: 100 }),
  maintenance_charges: decimal('maintenance_charges', { precision: 10, scale: 2 }),
  rental_income: decimal('rental_income', { precision: 15, scale: 2 }),
  rental_yield: decimal('rental_yield', { precision: 5, scale: 2 }),
  occupancy_status: varchar('occupancy_status', { length: 20 }).default('self_occupied')
}, (table) => ({
  assetIdIdx: index('idx_real_estate_details_asset_id').on(table.asset_id),
  cityIdx: index('idx_real_estate_details_city').on(table.city),
  stateIdx: index('idx_real_estate_details_state').on(table.state),
  propertyTypeCheck: check('property_type_check', sql`${table.property_type} IN ('residential', 'commercial', 'industrial', 'agricultural', 'land')`),
  occupancyStatusCheck: check('occupancy_status_check', sql`${table.occupancy_status} IN ('self_occupied', 'rented', 'vacant', 'under_construction')`)
}));

// Gold specific fields
export const goldDetails = pgTable('gold_details', {
  gold_id: serial('gold_id').primaryKey(),
  asset_id: integer('asset_id').notNull().references(() => userAssets.asset_id, { onDelete: 'cascade' }),
  gold_type: varchar('gold_type', { length: 50 }).notNull(),
  purity: varchar('purity', { length: 10 }).notNull(),
  weight_grams: decimal('weight_grams', { precision: 10, scale: 4 }).notNull(),
  making_charges: decimal('making_charges', { precision: 10, scale: 2 }).default('0'),
  wastage_charges: decimal('wastage_charges', { precision: 10, scale: 2 }).default('0'),
  hallmark_certificate: varchar('hallmark_certificate', { length: 100 }),
  jeweler_name: varchar('jeweler_name', { length: 100 }),
  purchase_bill_number: varchar('purchase_bill_number', { length: 100 }),
  current_gold_rate_per_gram: decimal('current_gold_rate_per_gram', { precision: 10, scale: 2 })
}, (table) => ({
  assetIdIdx: index('idx_gold_details_asset_id').on(table.asset_id),
  typeIdx: index('idx_gold_details_type').on(table.gold_type),
  goldTypeCheck: check('gold_type_check', sql`${table.gold_type} IN ('jewelry', 'coins', 'bars', 'etf', 'mutual_fund')`),
  purityCheck: check('purity_check', sql`${table.purity} IN ('18K', '22K', '24K', '999', '995', '916')`)
}));

// Asset price indices (for automated valuation)
export const assetPriceIndices = pgTable('asset_price_indices', {
  index_id: serial('index_id').primaryKey(),
  category_id: integer('category_id').notNull().references(() => assetCategories.category_id),
  subcategory_id: integer('subcategory_id').references(() => assetSubcategories.subcategory_id),
  index_name: varchar('index_name', { length: 100 }).notNull(),
  index_date: date('index_date').notNull(),
  index_value: decimal('index_value', { precision: 12, scale: 4 }).notNull(),
  base_date: date('base_date').notNull(),
  base_value: decimal('base_value', { precision: 12, scale: 4 }).notNull(),
  source: varchar('source', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  categoryIdIdx: index('idx_asset_price_indices_category_id').on(table.category_id),
  dateIdx: index('idx_asset_price_indices_date').on(table.index_date),
  uniqueCategorySubcategoryNameDate: unique('asset_price_indices_unique').on(table.category_id, table.subcategory_id, table.index_name, table.index_date)
}));

// Type exports
export type AssetCategory = typeof assetCategories.$inferSelect;
export type NewAssetCategory = typeof assetCategories.$inferInsert;
export type AssetSubcategory = typeof assetSubcategories.$inferSelect;
export type NewAssetSubcategory = typeof assetSubcategories.$inferInsert;
export type UserAsset = typeof userAssets.$inferSelect;
export type NewUserAsset = typeof userAssets.$inferInsert;
export type AssetValuation = typeof assetValuations.$inferSelect;
export type NewAssetValuation = typeof assetValuations.$inferInsert;
export type AssetTransaction = typeof assetTransactions.$inferSelect;
export type NewAssetTransaction = typeof assetTransactions.$inferInsert;
export type RealEstateDetail = typeof realEstateDetails.$inferSelect;
export type NewRealEstateDetail = typeof realEstateDetails.$inferInsert;
export type GoldDetail = typeof goldDetails.$inferSelect;
export type NewGoldDetail = typeof goldDetails.$inferInsert;
export type AssetPriceIndex = typeof assetPriceIndices.$inferSelect;
export type NewAssetPriceIndex = typeof assetPriceIndices.$inferInsert;

