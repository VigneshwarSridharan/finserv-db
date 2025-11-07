-- =====================================================
-- Brokers and Securities Schema
-- =====================================================

-- Brokers table for financial institutions
CREATE TABLE brokers (
    broker_id SERIAL PRIMARY KEY,
    broker_name VARCHAR(100) NOT NULL,
    broker_code VARCHAR(20) UNIQUE NOT NULL,
    broker_type VARCHAR(50) NOT NULL CHECK (broker_type IN ('full_service', 'discount', 'online', 'bank')),
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User broker accounts
CREATE TABLE user_broker_accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    broker_id INTEGER NOT NULL REFERENCES brokers(broker_id),
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('equity', 'commodity', 'currency', 'derivatives', 'mutual_fund')),
    account_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    opened_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, broker_id, account_number)
);

-- Securities master data
CREATE TABLE securities (
    security_id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    security_type VARCHAR(50) NOT NULL CHECK (security_type IN ('stock', 'bond', 'mutual_fund', 'etf', 'commodity', 'currency')),
    exchange VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap_category VARCHAR(20) CHECK (market_cap_category IN ('large_cap', 'mid_cap', 'small_cap', 'micro_cap')),
    isin VARCHAR(12) UNIQUE,
    face_value DECIMAL(10,2),
    lot_size INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, exchange)
);

-- Security prices (historical and current)
CREATE TABLE security_prices (
    price_id SERIAL PRIMARY KEY,
    security_id INTEGER NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    price_date DATE NOT NULL,
    open_price DECIMAL(12,4),
    high_price DECIMAL(12,4),
    low_price DECIMAL(12,4),
    close_price DECIMAL(12,4) NOT NULL,
    volume BIGINT,
    adjusted_close DECIMAL(12,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(security_id, price_date)
);

-- User security holdings
CREATE TABLE user_security_holdings (
    holding_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES user_broker_accounts(account_id),
    security_id INTEGER NOT NULL REFERENCES securities(security_id),
    quantity DECIMAL(15,4) NOT NULL,
    average_price DECIMAL(12,4) NOT NULL,
    current_price DECIMAL(12,4),
    total_investment DECIMAL(15,2) GENERATED ALWAYS AS (quantity * average_price) STORED,
    current_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity * COALESCE(current_price, average_price)) STORED,
    unrealized_pnl DECIMAL(15,2) GENERATED ALWAYS AS (quantity * (COALESCE(current_price, average_price) - average_price)) STORED,
    first_purchase_date DATE,
    last_purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_id, security_id)
);

-- Security transactions
CREATE TABLE security_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES user_broker_accounts(account_id),
    security_id INTEGER NOT NULL REFERENCES securities(security_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'bonus', 'split', 'dividend')),
    transaction_date DATE NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    brokerage DECIMAL(10,2) DEFAULT 0,
    taxes DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bond details (specific to bond securities)
CREATE TABLE bond_details (
    bond_id SERIAL PRIMARY KEY,
    security_id INTEGER NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    issuer VARCHAR(255) NOT NULL,
    coupon_rate DECIMAL(5,2),
    maturity_date DATE NOT NULL,
    coupon_payment_frequency VARCHAR(20) CHECK (coupon_payment_frequency IN ('annual', 'semi_annual', 'quarterly', 'monthly')),
    bond_type VARCHAR(50) CHECK (bond_type IN ('government', 'corporate', 'municipal', 'treasury', 'corporate_high_yield')),
    credit_rating VARCHAR(10) CHECK (credit_rating IN ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D')),
    yield_to_maturity DECIMAL(5,2),
    issue_date DATE,
    next_coupon_date DATE,
    day_count_convention VARCHAR(20) CHECK (day_count_convention IN ('30/360', 'actual/365', 'actual/360')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(security_id)
);

-- Create indexes for brokers and securities schema
CREATE INDEX idx_brokers_active ON brokers(is_active);
CREATE INDEX idx_brokers_type ON brokers(broker_type);
CREATE INDEX idx_user_broker_accounts_user_id ON user_broker_accounts(user_id);
CREATE INDEX idx_user_broker_accounts_broker_id ON user_broker_accounts(broker_id);
CREATE INDEX idx_securities_symbol ON securities(symbol);
CREATE INDEX idx_securities_type ON securities(security_type);
CREATE INDEX idx_securities_exchange ON securities(exchange);
CREATE INDEX idx_securities_sector ON securities(sector);
CREATE INDEX idx_security_prices_security_id ON security_prices(security_id);
CREATE INDEX idx_security_prices_date ON security_prices(price_date);
CREATE INDEX idx_user_security_holdings_user_id ON user_security_holdings(user_id);
CREATE INDEX idx_user_security_holdings_account_id ON user_security_holdings(account_id);
CREATE INDEX idx_user_security_holdings_security_id ON user_security_holdings(security_id);
CREATE INDEX idx_security_transactions_user_id ON security_transactions(user_id);
CREATE INDEX idx_security_transactions_account_id ON security_transactions(account_id);
CREATE INDEX idx_security_transactions_security_id ON security_transactions(security_id);
CREATE INDEX idx_security_transactions_date ON security_transactions(transaction_date);
CREATE INDEX idx_security_transactions_type ON security_transactions(transaction_type);
CREATE INDEX idx_bond_details_security_id ON bond_details(security_id);
CREATE INDEX idx_bond_details_issuer ON bond_details(issuer);
CREATE INDEX idx_bond_details_maturity_date ON bond_details(maturity_date);
CREATE INDEX idx_bond_details_bond_type ON bond_details(bond_type);

-- Bond repayments (scheduled and actual payments)
CREATE TABLE bond_repayments (
    repayment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    holding_id INTEGER NOT NULL REFERENCES user_security_holdings(holding_id) ON DELETE CASCADE,
    security_id INTEGER NOT NULL REFERENCES securities(security_id) ON DELETE CASCADE,
    repayment_type VARCHAR(20) NOT NULL CHECK (repayment_type IN ('coupon', 'principal')),
    scheduled_date DATE NOT NULL,
    scheduled_amount DECIMAL(15,2) NOT NULL,
    actual_payment_date DATE,
    actual_amount DECIMAL(15,2),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (payment_status IN ('scheduled', 'paid', 'overdue', 'missed')),
    coupon_period_start DATE,
    coupon_period_end DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for bond repayments
CREATE INDEX idx_bond_repayments_user_id ON bond_repayments(user_id);
CREATE INDEX idx_bond_repayments_holding_id ON bond_repayments(holding_id);
CREATE INDEX idx_bond_repayments_security_id ON bond_repayments(security_id);
CREATE INDEX idx_bond_repayments_scheduled_date ON bond_repayments(scheduled_date);
CREATE INDEX idx_bond_repayments_payment_status ON bond_repayments(payment_status);
CREATE INDEX idx_bond_repayments_repayment_type ON bond_repayments(repayment_type);