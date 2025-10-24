-- =====================================================
-- Banks and Deposits Schema
-- =====================================================

-- Banks table for financial institutions
CREATE TABLE banks (
    bank_id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) UNIQUE NOT NULL,
    bank_type VARCHAR(50) NOT NULL CHECK (bank_type IN ('public', 'private', 'foreign', 'cooperative', 'small_finance', 'payment')),
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

-- User bank accounts
CREATE TABLE user_bank_accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bank_id INTEGER NOT NULL REFERENCES banks(bank_id),
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('savings', 'current', 'fixed_deposit', 'recurring_deposit', 'nro', 'nre')),
    account_name VARCHAR(100),
    ifsc_code VARCHAR(11),
    branch_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    opened_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, bank_id, account_number)
);

-- Fixed Deposits
CREATE TABLE fixed_deposits (
    fd_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES user_bank_accounts(account_id),
    fd_number VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    maturity_amount DECIMAL(15,2),
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    interest_payout_frequency VARCHAR(20) DEFAULT 'maturity' CHECK (interest_payout_frequency IN ('monthly', 'quarterly', 'half_yearly', 'yearly', 'maturity')),
    auto_renewal BOOLEAN DEFAULT FALSE,
    premature_withdrawal_allowed BOOLEAN DEFAULT TRUE,
    premature_penalty_rate DECIMAL(5,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_id, fd_number)
);

-- Fixed Deposit Interest Payments
CREATE TABLE fd_interest_payments (
    payment_id SERIAL PRIMARY KEY,
    fd_id INTEGER NOT NULL REFERENCES fixed_deposits(fd_id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    cumulative_interest DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'credited', 'reinvested')),
    credited_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Deposits
CREATE TABLE recurring_deposits (
    rd_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES user_bank_accounts(account_id),
    rd_number VARCHAR(50) NOT NULL,
    monthly_installment DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    maturity_amount DECIMAL(15,2),
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    installment_day INTEGER NOT NULL CHECK (installment_day BETWEEN 1 AND 31),
    auto_debit BOOLEAN DEFAULT TRUE,
    premature_closure_allowed BOOLEAN DEFAULT TRUE,
    premature_penalty_rate DECIMAL(5,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_id, rd_number)
);

-- Recurring Deposit Installments
CREATE TABLE rd_installments (
    installment_id SERIAL PRIMARY KEY,
    rd_id INTEGER NOT NULL REFERENCES recurring_deposits(rd_id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    installment_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    paid_date DATE,
    late_fee DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'waived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rd_id, installment_number)
);

-- Bank transactions for deposits
CREATE TABLE bank_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES user_bank_accounts(account_id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('fd_creation', 'fd_interest', 'fd_maturity', 'rd_installment', 'rd_maturity', 'transfer', 'withdrawal', 'deposit')),
    transaction_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2),
    reference_number VARCHAR(100),
    description TEXT,
    related_fd_id INTEGER REFERENCES fixed_deposits(fd_id),
    related_rd_id INTEGER REFERENCES recurring_deposits(rd_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for banks and deposits schema
CREATE INDEX idx_banks_active ON banks(is_active);
CREATE INDEX idx_banks_type ON banks(bank_type);
CREATE INDEX idx_user_bank_accounts_user_id ON user_bank_accounts(user_id);
CREATE INDEX idx_user_bank_accounts_bank_id ON user_bank_accounts(bank_id);
CREATE INDEX idx_fixed_deposits_user_id ON fixed_deposits(user_id);
CREATE INDEX idx_fixed_deposits_account_id ON fixed_deposits(account_id);
CREATE INDEX idx_fixed_deposits_maturity_date ON fixed_deposits(maturity_date);
CREATE INDEX idx_fd_interest_payments_fd_id ON fd_interest_payments(fd_id);
CREATE INDEX idx_fd_interest_payments_date ON fd_interest_payments(payment_date);
CREATE INDEX idx_recurring_deposits_user_id ON recurring_deposits(user_id);
CREATE INDEX idx_recurring_deposits_account_id ON recurring_deposits(account_id);
CREATE INDEX idx_recurring_deposits_maturity_date ON recurring_deposits(maturity_date);
CREATE INDEX idx_rd_installments_rd_id ON rd_installments(rd_id);
CREATE INDEX idx_rd_installments_due_date ON rd_installments(due_date);
CREATE INDEX idx_rd_installments_status ON rd_installments(payment_status);
CREATE INDEX idx_bank_transactions_user_id ON bank_transactions(user_id);
CREATE INDEX idx_bank_transactions_account_id ON bank_transactions(account_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_type ON bank_transactions(transaction_type);