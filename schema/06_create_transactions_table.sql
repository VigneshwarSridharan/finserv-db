-- Transactions Table
-- Records all financial transactions in the system

CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    transaction_reference VARCHAR(50) UNIQUE NOT NULL,
    
    -- Account Information
    from_account_id BIGINT REFERENCES accounts(account_id),
    to_account_id BIGINT REFERENCES accounts(account_id),
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRANSFER, FD_CREATION, FD_MATURITY, INTEREST_CREDIT, FEE_DEBIT
    transaction_amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Transaction Status
    transaction_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    
    -- Related Entity References
    related_fd_id BIGINT REFERENCES fixed_deposits(fd_id),
    
    -- Transaction Details
    description TEXT,
    narration VARCHAR(500),
    
    -- Balance Information (snapshot at transaction time)
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    
    -- Timestamps
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    value_date DATE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_transaction_amount_positive CHECK (transaction_amount > 0),
    CONSTRAINT check_transaction_status CHECK (transaction_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED', 'CANCELLED'))
);

-- Indexes
CREATE INDEX idx_transactions_from_account_id ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account_id ON transactions(to_account_id);
CREATE INDEX idx_transactions_transaction_reference ON transactions(transaction_reference);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_transaction_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_related_fd_id ON transactions(related_fd_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Update trigger
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
