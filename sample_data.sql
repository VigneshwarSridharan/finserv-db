-- Sample Data for Testing
-- This file contains sample data to test the database schema

-- Sample Users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, is_active, is_verified)
VALUES
    ('john.doe', 'john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgJlau', 'John', 'Doe', '+1-555-0101', TRUE, TRUE),
    ('jane.smith', 'jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgJlau', 'Jane', 'Smith', '+1-555-0102', TRUE, TRUE),
    ('robert.johnson', 'robert.johnson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgJlau', 'Robert', 'Johnson', '+1-555-0103', TRUE, TRUE);

-- Sample Customers
INSERT INTO customers (
    user_id, customer_number, date_of_birth, gender, nationality,
    address_line_1, city, state, country, postal_code,
    id_type, id_number, kyc_status, occupation, annual_income,
    customer_status, risk_rating
)
VALUES
    (1, 'CUST001', '1985-06-15', 'MALE', 'USA', '123 Main Street', 'New York', 'NY', 'USA', '10001', 'PASSPORT', 'P12345678', 'VERIFIED', 'Software Engineer', 120000.00, 'ACTIVE', 'LOW'),
    (2, 'CUST002', '1990-03-22', 'FEMALE', 'USA', '456 Oak Avenue', 'Los Angeles', 'CA', 'USA', '90001', 'DRIVERS_LICENSE', 'DL987654321', 'VERIFIED', 'Doctor', 250000.00, 'ACTIVE', 'LOW'),
    (3, 'CUST003', '1978-11-08', 'MALE', 'USA', '789 Pine Road', 'Chicago', 'IL', 'USA', '60601', 'NATIONAL_ID', 'NID456789', 'VERIFIED', 'Business Owner', 500000.00, 'ACTIVE', 'MEDIUM');

-- Sample Accounts
INSERT INTO accounts (
    customer_id, account_type_id, account_number, account_name,
    current_balance, available_balance, currency_code, account_status,
    interest_rate, branch_code
)
VALUES
    (1, 1, 'ACC1001000001', 'John Doe Savings', 50000.00, 50000.00, 'USD', 'ACTIVE', 3.50, 'BR001'),
    (1, 2, 'ACC1002000001', 'John Doe Current', 25000.00, 25000.00, 'USD', 'ACTIVE', 0.00, 'BR001'),
    (2, 1, 'ACC1001000002', 'Jane Smith Savings', 75000.00, 75000.00, 'USD', 'ACTIVE', 3.50, 'BR002'),
    (3, 1, 'ACC1001000003', 'Robert Johnson Savings', 150000.00, 150000.00, 'USD', 'ACTIVE', 3.50, 'BR001');

-- Sample Fixed Deposits
INSERT INTO fixed_deposits (
    customer_id, linked_account_id, fd_number,
    principal_amount, currency_code, interest_rate, interest_type,
    interest_payout_frequency, tenure_months, deposit_date, maturity_date,
    maturity_amount, auto_renewal, fd_status, premature_withdrawal_allowed,
    premature_withdrawal_penalty_rate, nominee_name, nominee_relationship
)
VALUES
    (
        1, 1, 'FD1000001',
        100000.00, 'USD', 6.50, 'SIMPLE', 'MATURITY', 12,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months',
        106500.00, FALSE, 'ACTIVE', TRUE, 1.50,
        'Mary Doe', 'Spouse'
    ),
    (
        2, 3, 'FD1000002',
        250000.00, 'USD', 7.00, 'COMPOUND', 'QUARTERLY', 24,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '24 months',
        286225.00, TRUE, 'ACTIVE', TRUE, 2.00,
        'Michael Smith', 'Spouse'
    ),
    (
        3, 4, 'FD1000003',
        500000.00, 'USD', 7.50, 'SIMPLE', 'ANNUAL', 36,
        CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '30 months',
        612500.00, FALSE, 'ACTIVE', FALSE, 0.00,
        'Emily Johnson', 'Daughter'
    );

-- Sample Transactions
INSERT INTO transactions (
    transaction_reference, from_account_id, to_account_id,
    transaction_type, transaction_amount, currency_code,
    transaction_status, description, balance_before, balance_after,
    transaction_date, value_date, processed_at
)
VALUES
    (
        'TXN20251022001', NULL, 1,
        'DEPOSIT', 50000.00, 'USD', 'COMPLETED',
        'Initial deposit', 0.00, 50000.00,
        CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_DATE - 30, CURRENT_TIMESTAMP - INTERVAL '30 days'
    ),
    (
        'TXN20251022002', 1, NULL,
        'FD_CREATION', 100000.00, 'USD', 'COMPLETED',
        'Fixed Deposit Creation - FD1000001', 150000.00, 50000.00,
        CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_TIMESTAMP
    ),
    (
        'TXN20251022003', NULL, 3,
        'DEPOSIT', 75000.00, 'USD', 'COMPLETED',
        'Initial deposit', 0.00, 75000.00,
        CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_DATE - 45, CURRENT_TIMESTAMP - INTERVAL '45 days'
    );

-- Update transaction references in FD table
UPDATE fixed_deposits 
SET linked_account_id = 1 
WHERE fd_number = 'FD1000001';

UPDATE fixed_deposits 
SET linked_account_id = 3 
WHERE fd_number = 'FD1000002';

UPDATE fixed_deposits 
SET linked_account_id = 4 
WHERE fd_number = 'FD1000003';

-- Sample FD Interest Payments (for the FD that's been active for 6 months)
INSERT INTO fd_interest_payments (
    fd_id, payment_date, interest_amount, tax_deducted, net_amount,
    from_date, to_date, days_calculated, payment_status, paid_at
)
VALUES
    (
        3, CURRENT_DATE - INTERVAL '5 months', 3125.00, 312.50, 2812.50,
        CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE - INTERVAL '5 months', 30,
        'PAID', CURRENT_TIMESTAMP - INTERVAL '5 months'
    );

-- Sample Audit Logs
INSERT INTO audit_logs (
    table_name, record_id, action_type, action_description,
    user_id, username, ip_address, new_values
)
VALUES
    (
        'fixed_deposits', 1, 'INSERT', 'New FD created',
        1, 'john.doe', '192.168.1.100',
        '{"fd_number": "FD1000001", "principal_amount": 100000.00, "interest_rate": 6.50}'::jsonb
    ),
    (
        'fixed_deposits', 2, 'INSERT', 'New FD created',
        2, 'jane.smith', '192.168.1.101',
        '{"fd_number": "FD1000002", "principal_amount": 250000.00, "interest_rate": 7.00}'::jsonb
    );

-- Display summary
SELECT 'Database populated with sample data!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(*) AS total_accounts FROM accounts;
SELECT COUNT(*) AS total_fixed_deposits FROM fixed_deposits;
SELECT COUNT(*) AS total_transactions FROM transactions;
