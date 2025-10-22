-- Fixed Deposits Table
-- Manages Fixed Deposit (FD) details including deposit amount, interest rate, tenure, and maturity information

CREATE TABLE fixed_deposits (
    fd_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    linked_account_id BIGINT REFERENCES accounts(account_id) ON DELETE RESTRICT,
    fd_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Deposit Details
    principal_amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Interest Details
    interest_rate DECIMAL(5, 2) NOT NULL,
    interest_type VARCHAR(20) DEFAULT 'SIMPLE' NOT NULL, -- SIMPLE, COMPOUND
    interest_payout_frequency VARCHAR(20) DEFAULT 'MATURITY', -- MONTHLY, QUARTERLY, ANNUAL, MATURITY
    interest_earned DECIMAL(15, 2) DEFAULT 0.00,
    
    -- Tenure Information
    tenure_months INTEGER NOT NULL,
    tenure_days INTEGER, -- For more precise tenure calculation
    
    -- Important Dates
    deposit_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    
    -- Maturity Information
    maturity_amount DECIMAL(15, 2) NOT NULL,
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_tenure_months INTEGER,
    
    -- FD Status
    fd_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    
    -- Premature Withdrawal
    premature_withdrawal_allowed BOOLEAN DEFAULT TRUE,
    premature_withdrawal_penalty_rate DECIMAL(5, 2) DEFAULT 1.00,
    
    -- Nominee Information
    nominee_name VARCHAR(200),
    nominee_relationship VARCHAR(50),
    nominee_contact VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    matured_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT check_principal_amount_positive CHECK (principal_amount > 0),
    CONSTRAINT check_interest_rate_valid CHECK (interest_rate >= 0 AND interest_rate <= 100),
    CONSTRAINT check_tenure_positive CHECK (tenure_months > 0),
    CONSTRAINT check_maturity_amount_positive CHECK (maturity_amount >= principal_amount),
    CONSTRAINT check_interest_type CHECK (interest_type IN ('SIMPLE', 'COMPOUND')),
    CONSTRAINT check_interest_payout_frequency CHECK (interest_payout_frequency IN ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'MATURITY')),
    CONSTRAINT check_fd_status CHECK (fd_status IN ('ACTIVE', 'MATURED', 'CLOSED', 'PREMATURELY_CLOSED', 'RENEWED'))
);

-- Indexes for better query performance
CREATE INDEX idx_fixed_deposits_customer_id ON fixed_deposits(customer_id);
CREATE INDEX idx_fixed_deposits_linked_account_id ON fixed_deposits(linked_account_id);
CREATE INDEX idx_fixed_deposits_fd_number ON fixed_deposits(fd_number);
CREATE INDEX idx_fixed_deposits_fd_status ON fixed_deposits(fd_status);
CREATE INDEX idx_fixed_deposits_deposit_date ON fixed_deposits(deposit_date);
CREATE INDEX idx_fixed_deposits_maturity_date ON fixed_deposits(maturity_date);
CREATE INDEX idx_fixed_deposits_created_at ON fixed_deposits(created_at);

-- Update trigger
CREATE TRIGGER update_fixed_deposits_updated_at BEFORE UPDATE ON fixed_deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate maturity amount
CREATE OR REPLACE FUNCTION calculate_fd_maturity_amount(
    p_principal DECIMAL,
    p_rate DECIMAL,
    p_tenure_months INTEGER,
    p_interest_type VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
    v_maturity_amount DECIMAL;
    v_tenure_years DECIMAL;
BEGIN
    v_tenure_years := p_tenure_months / 12.0;
    
    IF p_interest_type = 'SIMPLE' THEN
        -- Simple Interest: A = P(1 + rt)
        v_maturity_amount := p_principal * (1 + (p_rate / 100.0) * v_tenure_years);
    ELSE
        -- Compound Interest (annual): A = P(1 + r)^t
        v_maturity_amount := p_principal * POWER(1 + (p_rate / 100.0), v_tenure_years);
    END IF;
    
    RETURN ROUND(v_maturity_amount, 2);
END;
$$ LANGUAGE plpgsql;
