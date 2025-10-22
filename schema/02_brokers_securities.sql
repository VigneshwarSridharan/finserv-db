-- Brokers and Securities Schema
-- Manages brokers, securities accounts, and financial instruments

CREATE TABLE IF NOT EXISTS brokers (
    broker_id BIGSERIAL PRIMARY KEY,
    broker_name VARCHAR(255) NOT NULL,
    broker_code VARCHAR(50) UNIQUE,
    website_url VARCHAR(500),
    customer_support_phone VARCHAR(20),
    customer_support_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_broker_accounts (
    account_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    broker_id BIGINT NOT NULL REFERENCES brokers(broker_id),
    account_number VARCHAR(100) NOT NULL,
    account_type VARCHAR(50), -- e.g., 'Trading', 'Demat', 'Combined'
    account_holder_name VARCHAR(255),
    opened_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, broker_id, account_number)
);

CREATE TABLE IF NOT EXISTS security_types (
    security_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL, -- 'Stock', 'Bond', 'Mutual Fund', 'ETF'
    description TEXT
);

CREATE TABLE IF NOT EXISTS securities (
    security_id BIGSERIAL PRIMARY KEY,
    security_type_id INT NOT NULL REFERENCES security_types(security_type_id),
    symbol VARCHAR(50) NOT NULL, -- Ticker symbol
    isin VARCHAR(12), -- International Securities Identification Number
    security_name VARCHAR(255) NOT NULL,
    exchange VARCHAR(50), -- e.g., 'NSE', 'BSE', 'NYSE'
    currency VARCHAR(3) DEFAULT 'USD',
    sector VARCHAR(100),
    industry VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, exchange)
);

CREATE TABLE IF NOT EXISTS user_securities_holdings (
    holding_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES user_broker_accounts(account_id) ON DELETE SET NULL,
    security_id BIGINT NOT NULL REFERENCES securities(security_id),
    quantity DECIMAL(20, 6) NOT NULL CHECK (quantity >= 0),
    average_buy_price DECIMAL(20, 4),
    current_price DECIMAL(20, 4),
    purchase_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS securities_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES user_broker_accounts(account_id) ON DELETE SET NULL,
    security_id BIGINT NOT NULL REFERENCES securities(security_id),
    transaction_type VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT'
    quantity DECIMAL(20, 6) NOT NULL,
    price_per_unit DECIMAL(20, 4),
    total_amount DECIMAL(20, 4) NOT NULL,
    fees DECIMAL(20, 4) DEFAULT 0,
    taxes DECIMAL(20, 4) DEFAULT 0,
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (transaction_type IN ('BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT'))
);

-- Mutual Fund specific details
CREATE TABLE IF NOT EXISTS mutual_funds (
    mutual_fund_id BIGSERIAL PRIMARY KEY,
    security_id BIGINT NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    fund_house VARCHAR(255),
    fund_category VARCHAR(100), -- 'Equity', 'Debt', 'Hybrid', 'Money Market'
    fund_type VARCHAR(50), -- 'Open-ended', 'Close-ended'
    nav DECIMAL(20, 4), -- Net Asset Value
    expense_ratio DECIMAL(5, 4),
    aum DECIMAL(20, 2), -- Assets Under Management
    launch_date DATE,
    UNIQUE(security_id)
);

-- Bond specific details
CREATE TABLE IF NOT EXISTS bonds (
    bond_id BIGSERIAL PRIMARY KEY,
    security_id BIGINT NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    issuer_name VARCHAR(255),
    bond_type VARCHAR(50), -- 'Government', 'Corporate', 'Municipal'
    face_value DECIMAL(20, 4),
    coupon_rate DECIMAL(5, 4),
    maturity_date DATE,
    credit_rating VARCHAR(10),
    interest_payment_frequency VARCHAR(20), -- 'Annual', 'Semi-Annual', 'Quarterly'
    UNIQUE(security_id)
);

CREATE INDEX idx_brokers_code ON brokers(broker_code);
CREATE INDEX idx_user_broker_accounts_user_id ON user_broker_accounts(user_id);
CREATE INDEX idx_user_broker_accounts_broker_id ON user_broker_accounts(broker_id);
CREATE INDEX idx_securities_symbol ON securities(symbol);
CREATE INDEX idx_securities_isin ON securities(isin);
CREATE INDEX idx_securities_type ON securities(security_type_id);
CREATE INDEX idx_user_securities_holdings_user_id ON user_securities_holdings(user_id);
CREATE INDEX idx_user_securities_holdings_security_id ON user_securities_holdings(security_id);
CREATE INDEX idx_securities_transactions_user_id ON securities_transactions(user_id);
CREATE INDEX idx_securities_transactions_security_id ON securities_transactions(security_id);
CREATE INDEX idx_securities_transactions_date ON securities_transactions(transaction_date);
