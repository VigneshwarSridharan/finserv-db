-- =====================================================
-- Assets Schema (Gold, Real Estate, etc.)
-- =====================================================

-- Asset categories
CREATE TABLE asset_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_type VARCHAR(50) NOT NULL CHECK (category_type IN ('precious_metal', 'real_estate', 'commodity', 'collectible', 'other')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset subcategories
CREATE TABLE asset_subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES asset_categories(category_id),
    subcategory_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, subcategory_name)
);

-- User assets
CREATE TABLE user_assets (
    asset_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES asset_categories(category_id),
    subcategory_id INTEGER REFERENCES asset_subcategories(subcategory_id),
    asset_name VARCHAR(255) NOT NULL,
    description TEXT,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2),
    quantity DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    storage_location VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_company VARCHAR(100),
    insurance_amount DECIMAL(15,2),
    insurance_expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset valuations (historical and current)
CREATE TABLE asset_valuations (
    valuation_id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES user_assets(asset_id) ON DELETE CASCADE,
    valuation_date DATE NOT NULL,
    valuation_amount DECIMAL(15,2) NOT NULL,
    valuation_method VARCHAR(50) NOT NULL CHECK (valuation_method IN ('market_price', 'appraisal', 'index_based', 'manual')),
    valuation_source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, valuation_date)
);

-- Asset transactions (purchases, sales, transfers)
CREATE TABLE asset_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES user_assets(asset_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'transfer', 'gift', 'inheritance', 'valuation_update')),
    transaction_date DATE NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    price_per_unit DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    transaction_fees DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    counterparty VARCHAR(255),
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real Estate specific fields
CREATE TABLE real_estate_details (
    property_id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES user_assets(asset_id) ON DELETE CASCADE,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('residential', 'commercial', 'industrial', 'agricultural', 'land')),
    property_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    area_sqft DECIMAL(10,2),
    built_up_area_sqft DECIMAL(10,2),
    year_built INTEGER,
    floors INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    parking_spaces INTEGER,
    registration_number VARCHAR(100),
    registration_date DATE,
    property_tax_number VARCHAR(100),
    maintenance_charges DECIMAL(10,2),
    rental_income DECIMAL(15,2),
    rental_yield DECIMAL(5,2),
    occupancy_status VARCHAR(20) DEFAULT 'self_occupied' CHECK (occupancy_status IN ('self_occupied', 'rented', 'vacant', 'under_construction'))
);

-- Gold specific fields
CREATE TABLE gold_details (
    gold_id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES user_assets(asset_id) ON DELETE CASCADE,
    gold_type VARCHAR(50) NOT NULL CHECK (gold_type IN ('jewelry', 'coins', 'bars', 'etf', 'mutual_fund')),
    purity VARCHAR(10) NOT NULL CHECK (purity IN ('18K', '22K', '24K', '999', '995', '916')),
    weight_grams DECIMAL(10,4) NOT NULL,
    making_charges DECIMAL(10,2) DEFAULT 0,
    wastage_charges DECIMAL(10,2) DEFAULT 0,
    hallmark_certificate VARCHAR(100),
    jeweler_name VARCHAR(100),
    purchase_bill_number VARCHAR(100),
    current_gold_rate_per_gram DECIMAL(10,2)
);

-- Asset price indices (for automated valuation)
CREATE TABLE asset_price_indices (
    index_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES asset_categories(category_id),
    subcategory_id INTEGER REFERENCES asset_subcategories(subcategory_id),
    index_name VARCHAR(100) NOT NULL,
    index_date DATE NOT NULL,
    index_value DECIMAL(12,4) NOT NULL,
    base_date DATE NOT NULL,
    base_value DECIMAL(12,4) NOT NULL,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, subcategory_id, index_name, index_date)
);

-- Create indexes for assets schema
CREATE INDEX idx_asset_categories_type ON asset_categories(category_type);
CREATE INDEX idx_asset_subcategories_category_id ON asset_subcategories(category_id);
CREATE INDEX idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX idx_user_assets_category_id ON user_assets(category_id);
CREATE INDEX idx_user_assets_subcategory_id ON user_assets(subcategory_id);
CREATE INDEX idx_user_assets_purchase_date ON user_assets(purchase_date);
CREATE INDEX idx_asset_valuations_asset_id ON asset_valuations(asset_id);
CREATE INDEX idx_asset_valuations_date ON asset_valuations(valuation_date);
CREATE INDEX idx_asset_transactions_user_id ON asset_transactions(user_id);
CREATE INDEX idx_asset_transactions_asset_id ON asset_transactions(asset_id);
CREATE INDEX idx_asset_transactions_date ON asset_transactions(transaction_date);
CREATE INDEX idx_asset_transactions_type ON asset_transactions(transaction_type);
CREATE INDEX idx_real_estate_details_asset_id ON real_estate_details(asset_id);
CREATE INDEX idx_real_estate_details_city ON real_estate_details(city);
CREATE INDEX idx_real_estate_details_state ON real_estate_details(state);
CREATE INDEX idx_gold_details_asset_id ON gold_details(asset_id);
CREATE INDEX idx_gold_details_type ON gold_details(gold_type);
CREATE INDEX idx_asset_price_indices_category_id ON asset_price_indices(category_id);
CREATE INDEX idx_asset_price_indices_date ON asset_price_indices(index_date);