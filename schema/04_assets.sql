-- Assets Schema
-- Manages physical assets including gold and real estate

CREATE TABLE IF NOT EXISTS asset_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL, -- 'Gold', 'Silver', 'Real Estate', 'Vehicle', 'Art', etc.
    description TEXT
);

-- Gold Holdings
CREATE TABLE IF NOT EXISTS gold_holdings (
    gold_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    gold_type VARCHAR(50) NOT NULL, -- 'Physical Gold', 'Digital Gold', 'Gold ETF', 'Sovereign Gold Bond'
    form VARCHAR(50), -- 'Coins', 'Bars', 'Jewelry', 'Biscuits'
    weight_grams DECIMAL(12, 4) NOT NULL CHECK (weight_grams > 0),
    purity DECIMAL(5, 2), -- e.g., 99.99 for 24K, 91.67 for 22K
    purchase_price_per_gram DECIMAL(12, 2),
    total_purchase_price DECIMAL(20, 2),
    current_price_per_gram DECIMAL(12, 2),
    purchase_date DATE,
    vendor_name VARCHAR(255),
    certificate_number VARCHAR(100),
    storage_location VARCHAR(255), -- 'Home', 'Bank Locker', 'Vault', etc.
    locker_details TEXT,
    is_pledged BOOLEAN DEFAULT FALSE,
    pledged_to VARCHAR(255),
    hallmark_details VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (gold_type IN ('Physical Gold', 'Digital Gold', 'Gold ETF', 'Sovereign Gold Bond'))
);

-- Silver Holdings
CREATE TABLE IF NOT EXISTS silver_holdings (
    silver_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    silver_type VARCHAR(50) NOT NULL, -- 'Physical Silver', 'Digital Silver', 'Silver ETF'
    form VARCHAR(50), -- 'Coins', 'Bars', 'Utensils', 'Artifacts'
    weight_grams DECIMAL(12, 4) NOT NULL CHECK (weight_grams > 0),
    purity DECIMAL(5, 2), -- e.g., 99.9 for pure silver
    purchase_price_per_gram DECIMAL(12, 2),
    total_purchase_price DECIMAL(20, 2),
    current_price_per_gram DECIMAL(12, 2),
    purchase_date DATE,
    vendor_name VARCHAR(255),
    storage_location VARCHAR(255),
    is_pledged BOOLEAN DEFAULT FALSE,
    pledged_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (silver_type IN ('Physical Silver', 'Digital Silver', 'Silver ETF'))
);

-- Real Estate Properties
CREATE TABLE IF NOT EXISTS real_estate (
    property_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_type VARCHAR(50) NOT NULL, -- 'Residential', 'Commercial', 'Agricultural', 'Plot'
    property_subtype VARCHAR(50), -- 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse'
    property_name VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    area_sqft DECIMAL(12, 2) CHECK (area_sqft > 0),
    area_sqm DECIMAL(12, 2) CHECK (area_sqm > 0),
    purchase_price DECIMAL(20, 2) NOT NULL CHECK (purchase_price > 0),
    current_valuation DECIMAL(20, 2),
    purchase_date DATE,
    registration_date DATE,
    survey_number VARCHAR(100),
    deed_number VARCHAR(100),
    ownership_type VARCHAR(50), -- 'Freehold', 'Leasehold'
    ownership_percentage DECIMAL(5, 2) DEFAULT 100.00 CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
    co_owners TEXT, -- JSON array or comma-separated list
    is_mortgaged BOOLEAN DEFAULT FALSE,
    mortgaged_to VARCHAR(255),
    loan_account_number VARCHAR(100),
    outstanding_loan_amount DECIMAL(20, 2),
    is_rented BOOLEAN DEFAULT FALSE,
    monthly_rental_income DECIMAL(20, 2),
    tenant_name VARCHAR(255),
    lease_start_date DATE,
    lease_end_date DATE,
    property_tax_annual DECIMAL(20, 2),
    maintenance_charges_monthly DECIMAL(20, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (property_type IN ('Residential', 'Commercial', 'Agricultural', 'Plot'))
);

CREATE TABLE IF NOT EXISTS real_estate_documents (
    document_id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES real_estate(property_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'Sale Deed', 'Title Deed', 'Tax Receipt', 'NOC', 'Approval'
    document_name VARCHAR(255),
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    issued_by VARCHAR(255),
    file_path VARCHAR(500), -- Path to stored document
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Other Assets (Vehicles, Art, Collectibles, etc.)
CREATE TABLE IF NOT EXISTS other_assets (
    asset_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INT REFERENCES asset_categories(category_id),
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100), -- 'Vehicle', 'Art', 'Antique', 'Collectible', etc.
    description TEXT,
    purchase_price DECIMAL(20, 2) CHECK (purchase_price >= 0),
    current_valuation DECIMAL(20, 2),
    purchase_date DATE,
    vendor_name VARCHAR(255),
    serial_number VARCHAR(100),
    registration_number VARCHAR(100), -- For vehicles
    is_insured BOOLEAN DEFAULT FALSE,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_expiry_date DATE,
    is_pledged BOOLEAN DEFAULT FALSE,
    pledged_to VARCHAR(255),
    storage_location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Transactions (Buy/Sell/Transfer)
CREATE TABLE IF NOT EXISTS asset_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'Gold', 'Silver', 'Real Estate', 'Other'
    asset_id BIGINT NOT NULL, -- Reference to specific asset table
    transaction_type VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'TRANSFER', 'GIFT', 'INHERITANCE'
    transaction_date DATE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    quantity DECIMAL(20, 6), -- For gold/silver
    price_per_unit DECIMAL(20, 2),
    fees DECIMAL(20, 2) DEFAULT 0,
    taxes DECIMAL(20, 2) DEFAULT 0,
    counterparty_name VARCHAR(255), -- Buyer/Seller/Recipient
    payment_mode VARCHAR(50),
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (transaction_type IN ('BUY', 'SELL', 'TRANSFER', 'GIFT', 'INHERITANCE')),
    CHECK (asset_type IN ('Gold', 'Silver', 'Real Estate', 'Other'))
);

CREATE INDEX idx_gold_holdings_user_id ON gold_holdings(user_id);
CREATE INDEX idx_gold_holdings_type ON gold_holdings(gold_type);
CREATE INDEX idx_silver_holdings_user_id ON silver_holdings(user_id);
CREATE INDEX idx_real_estate_user_id ON real_estate(user_id);
CREATE INDEX idx_real_estate_type ON real_estate(property_type);
CREATE INDEX idx_real_estate_city ON real_estate(city);
CREATE INDEX idx_real_estate_is_rented ON real_estate(is_rented);
CREATE INDEX idx_real_estate_documents_property_id ON real_estate_documents(property_id);
CREATE INDEX idx_other_assets_user_id ON other_assets(user_id);
CREATE INDEX idx_other_assets_category ON other_assets(category_id);
CREATE INDEX idx_asset_transactions_user_id ON asset_transactions(user_id);
CREATE INDEX idx_asset_transactions_type ON asset_transactions(asset_type);
CREATE INDEX idx_asset_transactions_date ON asset_transactions(transaction_date);
