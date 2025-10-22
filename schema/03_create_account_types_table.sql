-- Account Types Reference Table
-- Defines different types of accounts available in the system

CREATE TABLE account_types (
    account_type_id SERIAL PRIMARY KEY,
    account_type_code VARCHAR(20) UNIQUE NOT NULL,
    account_type_name VARCHAR(100) NOT NULL,
    description TEXT,
    minimum_balance DECIMAL(15, 2) DEFAULT 0.00,
    interest_rate DECIMAL(5, 2) DEFAULT 0.00,
    monthly_maintenance_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert common account types
INSERT INTO account_types (account_type_code, account_type_name, description, minimum_balance, interest_rate, monthly_maintenance_fee) VALUES
('SAVINGS', 'Savings Account', 'Standard savings account with interest', 1000.00, 3.50, 0.00),
('CURRENT', 'Current Account', 'Zero-balance current account for business', 0.00, 0.00, 100.00),
('SALARY', 'Salary Account', 'Account for salary credit', 0.00, 3.00, 0.00),
('FD', 'Fixed Deposit Account', 'Fixed deposit account with higher interest', 10000.00, 6.00, 0.00);

-- Update trigger
CREATE TRIGGER update_account_types_updated_at BEFORE UPDATE ON account_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
