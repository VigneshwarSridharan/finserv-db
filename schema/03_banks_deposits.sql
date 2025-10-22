-- Banks and Deposits Schema
-- Manages banks, fixed deposits, and recurring deposits

CREATE TABLE IF NOT EXISTS banks (
    bank_id BIGSERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(50) UNIQUE, -- IFSC prefix or bank identifier
    website_url VARCHAR(500),
    customer_support_phone VARCHAR(20),
    customer_support_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_bank_accounts (
    account_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bank_id BIGINT NOT NULL REFERENCES banks(bank_id),
    account_number VARCHAR(100) NOT NULL,
    account_type VARCHAR(50), -- 'Savings', 'Current', 'Salary'
    account_holder_name VARCHAR(255),
    ifsc_code VARCHAR(11),
    branch_name VARCHAR(255),
    opened_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, bank_id, account_number)
);

CREATE TABLE IF NOT EXISTS fixed_deposits (
    fd_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bank_id BIGINT NOT NULL REFERENCES banks(bank_id),
    account_id BIGINT REFERENCES user_bank_accounts(account_id) ON DELETE SET NULL,
    fd_number VARCHAR(100) UNIQUE NOT NULL,
    principal_amount DECIMAL(20, 2) NOT NULL CHECK (principal_amount > 0),
    interest_rate DECIMAL(5, 4) NOT NULL CHECK (interest_rate >= 0),
    tenure_months INT NOT NULL CHECK (tenure_months > 0),
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    maturity_amount DECIMAL(20, 2),
    interest_payout_frequency VARCHAR(20), -- 'At Maturity', 'Monthly', 'Quarterly', 'Annual'
    auto_renew BOOLEAN DEFAULT FALSE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'MATURED', 'CLOSED', 'PREMATURE_CLOSED'
    premature_closure_date DATE,
    premature_closure_amount DECIMAL(20, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('ACTIVE', 'MATURED', 'CLOSED', 'PREMATURE_CLOSED')),
    CHECK (maturity_date > start_date)
);

CREATE TABLE IF NOT EXISTS recurring_deposits (
    rd_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bank_id BIGINT NOT NULL REFERENCES banks(bank_id),
    account_id BIGINT REFERENCES user_bank_accounts(account_id) ON DELETE SET NULL,
    rd_number VARCHAR(100) UNIQUE NOT NULL,
    monthly_installment DECIMAL(20, 2) NOT NULL CHECK (monthly_installment > 0),
    interest_rate DECIMAL(5, 4) NOT NULL CHECK (interest_rate >= 0),
    tenure_months INT NOT NULL CHECK (tenure_months > 0),
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    maturity_amount DECIMAL(20, 2),
    total_installments INT NOT NULL,
    installments_paid INT DEFAULT 0 CHECK (installments_paid >= 0),
    auto_debit BOOLEAN DEFAULT FALSE,
    nominee_name VARCHAR(255),
    nominee_relationship VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'MATURED', 'CLOSED', 'DEFAULTED'
    last_payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('ACTIVE', 'MATURED', 'CLOSED', 'DEFAULTED')),
    CHECK (maturity_date > start_date),
    CHECK (installments_paid <= total_installments)
);

CREATE TABLE IF NOT EXISTS rd_payment_history (
    payment_id BIGSERIAL PRIMARY KEY,
    rd_id BIGINT NOT NULL REFERENCES recurring_deposits(rd_id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(50), -- 'Auto Debit', 'Cash', 'Cheque', 'Online Transfer'
    transaction_reference VARCHAR(100),
    is_late_payment BOOLEAN DEFAULT FALSE,
    late_fee DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fd_interest_credits (
    credit_id BIGSERIAL PRIMARY KEY,
    fd_id BIGINT NOT NULL REFERENCES fixed_deposits(fd_id) ON DELETE CASCADE,
    credit_date DATE NOT NULL,
    interest_amount DECIMAL(20, 2) NOT NULL CHECK (interest_amount >= 0),
    tds_deducted DECIMAL(20, 2) DEFAULT 0,
    net_amount DECIMAL(20, 2),
    credited_to_account_id BIGINT REFERENCES user_bank_accounts(account_id) ON DELETE SET NULL,
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banks_code ON banks(bank_code);
CREATE INDEX idx_user_bank_accounts_user_id ON user_bank_accounts(user_id);
CREATE INDEX idx_user_bank_accounts_bank_id ON user_bank_accounts(bank_id);
CREATE INDEX idx_fixed_deposits_user_id ON fixed_deposits(user_id);
CREATE INDEX idx_fixed_deposits_bank_id ON fixed_deposits(bank_id);
CREATE INDEX idx_fixed_deposits_status ON fixed_deposits(status);
CREATE INDEX idx_fixed_deposits_maturity_date ON fixed_deposits(maturity_date);
CREATE INDEX idx_recurring_deposits_user_id ON recurring_deposits(user_id);
CREATE INDEX idx_recurring_deposits_bank_id ON recurring_deposits(bank_id);
CREATE INDEX idx_recurring_deposits_status ON recurring_deposits(status);
CREATE INDEX idx_recurring_deposits_maturity_date ON recurring_deposits(maturity_date);
CREATE INDEX idx_rd_payment_history_rd_id ON rd_payment_history(rd_id);
CREATE INDEX idx_fd_interest_credits_fd_id ON fd_interest_credits(fd_id);
