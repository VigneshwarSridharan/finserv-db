-- FD Interest Payments Table
-- Tracks interest payments made on fixed deposits

CREATE TABLE fd_interest_payments (
    payment_id BIGSERIAL PRIMARY KEY,
    fd_id BIGINT NOT NULL REFERENCES fixed_deposits(fd_id) ON DELETE CASCADE,
    transaction_id BIGINT REFERENCES transactions(transaction_id),
    
    -- Payment Details
    payment_date DATE NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    tax_deducted DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,
    
    -- Period Information
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_calculated INTEGER,
    
    -- Payment Status
    payment_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_interest_amount_positive CHECK (interest_amount >= 0),
    CONSTRAINT check_net_amount_positive CHECK (net_amount >= 0),
    CONSTRAINT check_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED'))
);

-- Indexes
CREATE INDEX idx_fd_interest_payments_fd_id ON fd_interest_payments(fd_id);
CREATE INDEX idx_fd_interest_payments_transaction_id ON fd_interest_payments(transaction_id);
CREATE INDEX idx_fd_interest_payments_payment_date ON fd_interest_payments(payment_date);
CREATE INDEX idx_fd_interest_payments_payment_status ON fd_interest_payments(payment_status);

-- Update trigger
CREATE TRIGGER update_fd_interest_payments_updated_at BEFORE UPDATE ON fd_interest_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
