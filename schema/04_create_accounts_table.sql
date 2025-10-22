-- Accounts Table
-- Stores customer account information

CREATE TABLE accounts (
    account_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    account_type_id INTEGER NOT NULL REFERENCES account_types(account_type_id),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    
    -- Balance Information
    current_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    available_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Account Status
    account_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    
    -- Interest Information
    interest_rate DECIMAL(5, 2),
    last_interest_calculated_at TIMESTAMP WITH TIME ZONE,
    
    -- Operational Details
    branch_code VARCHAR(20),
    relationship_manager_id BIGINT,
    
    -- Timestamps
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_account_status CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED', 'DORMANT')),
    CONSTRAINT check_balance_non_negative CHECK (current_balance >= 0)
);

-- Indexes
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_account_type_id ON accounts(account_type_id);
CREATE INDEX idx_accounts_account_status ON accounts(account_status);
CREATE INDEX idx_accounts_opened_at ON accounts(opened_at);

-- Update trigger
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
