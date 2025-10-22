-- =====================================================
-- Dummy Banks Data
-- =====================================================
-- This file contains additional banks, accounts, and deposits
-- to help understand banking and deposit management

-- =====================================================
-- 1. ADDITIONAL BANKS
-- =====================================================

-- More banks
INSERT INTO banks (bank_name, bank_code, bank_type, website, contact_email, contact_phone, address, city, state) VALUES
('State Bank of India', 'SBI', 'public', 'https://sbi.co.in', 'support@sbi.co.in', '1800-425-3800', 'State Bank Bhavan, Nariman Point', 'Mumbai', 'Maharashtra'),
('HDFC Bank', 'HDFC', 'private', 'https://hdfcbank.com', 'support@hdfcbank.com', '1800-419-6600', 'HDFC Bank House, Senapati Bapat Marg', 'Mumbai', 'Maharashtra'),
('ICICI Bank', 'ICICI', 'private', 'https://icicibank.com', 'support@icicibank.com', '1800-200-3344', 'ICICI Bank Tower, BKC', 'Mumbai', 'Maharashtra'),
('Axis Bank', 'AXIS', 'private', 'https://axisbank.com', 'support@axisbank.com', '1800-419-5555', 'Axis Bank House, C-2, Wadia International Centre', 'Mumbai', 'Maharashtra'),
('Kotak Mahindra Bank', 'KOTAK', 'private', 'https://kotak.com', 'support@kotak.com', '1800-419-6600', 'Kotak Mahindra Bank Tower, BKC', 'Mumbai', 'Maharashtra');

-- =====================================================
-- 2. USER BANK ACCOUNTS
-- =====================================================

-- User bank accounts for new users
INSERT INTO user_bank_accounts (user_id, bank_id, account_number, account_type, account_name, ifsc_code, branch_name, opened_date) VALUES
(7, 9, 'SBI1234567890', 'savings', 'Raj Patel SBI Account', 'SBIN0001234', 'Bangalore Main Branch', '2022-01-15'),
(7, 10, 'HDFC2345678901', 'savings', 'Raj Patel HDFC Account', 'HDFC0001234', 'Bangalore Electronic City Branch', '2022-02-20'),
(8, 11, 'ICICI3456789012', 'savings', 'Priya Sharma ICICI Account', 'ICIC0001234', 'Mumbai BKC Branch', '2022-03-10'),
(8, 12, 'AXIS4567890123', 'savings', 'Priya Sharma Axis Account', 'UTIB0001234', 'Mumbai Andheri Branch', '2022-04-05'),
(9, 13, 'KOTAK5678901234', 'savings', 'Amit Kumar Kotak Account', 'KKBK0001234', 'Delhi Connaught Place Branch', '2022-05-12'),
(10, 9, 'SBI6789012345', 'savings', 'Sneha Gupta SBI Account', 'SBIN0001235', 'Gurgaon Cyber City Branch', '2022-06-18'),
(11, 10, 'HDFC7890123456', 'savings', 'Vikram Singh HDFC Account', 'HDFC0001235', 'Ahmedabad CG Road Branch', '2022-07-25');

-- =====================================================
-- 3. FIXED DEPOSITS
-- =====================================================

-- Fixed deposits with different scenarios
INSERT INTO fixed_deposits (user_id, account_id, fd_number, principal_amount, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, interest_payout_frequency, auto_renewal) VALUES
(7, 11, 'SBI-FD-001', 500000.00, 7.25, 12, 536250.00, '2023-08-01', '2024-08-01', 'quarterly', TRUE),
(7, 12, 'HDFC-FD-002', 300000.00, 7.50, 24, 345000.00, '2023-06-15', '2025-06-15', 'half_yearly', FALSE),
(8, 13, 'ICICI-FD-003', 800000.00, 7.75, 36, 986000.00, '2023-04-10', '2026-04-10', 'yearly', TRUE),
(8, 14, 'AXIS-FD-004', 200000.00, 7.00, 6, 207000.00, '2023-12-01', '2024-06-01', 'maturity', FALSE),
(9, 15, 'KOTAK-FD-005', 400000.00, 7.25, 18, 443500.00, '2023-09-20', '2025-03-20', 'quarterly', TRUE),
(10, 16, 'SBI-FD-006', 1000000.00, 7.50, 60, 1375000.00, '2023-01-15', '2028-01-15', 'yearly', TRUE),
(11, 17, 'HDFC-FD-007', 600000.00, 7.00, 12, 642000.00, '2023-11-01', '2024-11-01', 'quarterly', FALSE);

-- =====================================================
-- 4. RECURRING DEPOSITS
-- =====================================================

-- Recurring deposits with different scenarios
INSERT INTO recurring_deposits (user_id, account_id, rd_number, monthly_installment, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, installment_day) VALUES
(7, 11, 'SBI-RD-001', 15000.00, 7.00, 24, 378000.00, '2023-01-15', '2025-01-15', 15),
(7, 12, 'HDFC-RD-002', 25000.00, 7.25, 36, 972000.00, '2023-03-01', '2026-03-01', 1),
(8, 13, 'ICICI-RD-003', 20000.00, 7.50, 30, 720000.00, '2023-02-10', '2025-08-10', 10),
(8, 14, 'AXIS-RD-004', 10000.00, 6.75, 18, 195750.00, '2023-06-01', '2024-12-01', 1),
(9, 15, 'KOTAK-RD-005', 12000.00, 7.00, 24, 312000.00, '2023-04-20', '2025-04-20', 20),
(10, 16, 'SBI-RD-006', 30000.00, 7.25, 48, 1584000.00, '2023-01-01', '2027-01-01', 1),
(11, 17, 'HDFC-RD-007', 18000.00, 6.50, 30, 585000.00, '2023-05-15', '2025-11-15', 15);

-- =====================================================
-- 5. RD INSTALLMENTS
-- =====================================================

-- RD installments for new users
INSERT INTO rd_installments (rd_id, installment_number, due_date, installment_amount, paid_amount, paid_date, payment_status, late_fee) VALUES
(7, 1, '2023-02-15', 15000.00, 15000.00, '2023-02-15', 'paid', 0.00),
(7, 2, '2023-03-15', 15000.00, 15000.00, '2023-03-15', 'paid', 0.00),
(7, 3, '2023-04-15', 15000.00, 15000.00, '2023-04-15', 'paid', 0.00),
(7, 4, '2023-05-15', 15000.00, 15000.00, '2023-05-15', 'paid', 0.00),
(7, 5, '2023-06-15', 15000.00, 15000.00, '2023-06-15', 'paid', 0.00),
(7, 6, '2023-07-15', 15000.00, 15000.00, '2023-07-15', 'paid', 0.00),
(7, 7, '2023-08-15', 15000.00, 15000.00, '2023-08-15', 'paid', 0.00),
(7, 8, '2023-09-15', 15000.00, 15000.00, '2023-09-15', 'paid', 0.00),
(7, 9, '2023-10-15', 15000.00, 15000.00, '2023-10-15', 'paid', 0.00),
(7, 10, '2023-11-15', 15000.00, 15000.00, '2023-11-15', 'paid', 0.00),
(7, 11, '2023-12-15', 15000.00, 15000.00, '2023-12-15', 'paid', 0.00),
(7, 12, '2024-01-15', 15000.00, 0.00, NULL, 'pending', 0.00),
(8, 6, '2023-04-01', 25000.00, 25000.00, '2023-04-01', 'paid', 0.00),
(8, 7, '2023-05-01', 25000.00, 25000.00, '2023-05-01', 'paid', 0.00),
(8, 8, '2023-06-01', 25000.00, 25000.00, '2023-06-01', 'paid', 0.00),
(8, 9, '2023-07-01', 25000.00, 25000.00, '2023-07-01', 'paid', 0.00),
(8, 10, '2023-08-01', 25000.00, 25000.00, '2023-08-01', 'paid', 0.00),
(8, 11, '2023-09-01', 25000.00, 25000.00, '2023-09-01', 'paid', 0.00),
(8, 12, '2023-10-01', 25000.00, 25000.00, '2023-10-01', 'paid', 0.00),
(8, 13, '2023-11-01', 25000.00, 25000.00, '2023-11-01', 'paid', 0.00),
(8, 14, '2023-12-01', 25000.00, 25000.00, '2023-12-01', 'paid', 0.00),
(8, 15, '2024-01-01', 25000.00, 0.00, NULL, 'pending', 0.00);

-- =====================================================
-- 6. FD INTEREST PAYMENTS
-- =====================================================

-- FD interest payments for new users
INSERT INTO fd_interest_payments (fd_id, payment_date, interest_amount, cumulative_interest, payment_status, credited_date) VALUES
(8, '2023-11-01', 9062.50, 9062.50, 'credited', '2023-11-01'),
(8, '2024-02-01', 9062.50, 18125.00, 'pending', NULL),
(8, '2024-05-01', 9062.50, 27187.50, 'pending', NULL),
(8, '2024-08-01', 9062.50, 36250.00, 'pending', NULL),
(9, '2023-10-15', 11250.00, 11250.00, 'credited', '2023-10-15'),
(9, '2024-04-15', 11250.00, 22500.00, 'pending', NULL),
(9, '2024-10-15', 11250.00, 33750.00, 'pending', NULL),
(10, '2024-06-01', 7000.00, 7000.00, 'pending', NULL),
(11, '2023-12-20', 10875.00, 10875.00, 'credited', '2023-12-20'),
(11, '2024-03-20', 10875.00, 21750.00, 'pending', NULL),
(11, '2024-06-20', 10875.00, 32625.00, 'pending', NULL),
(11, '2024-09-20', 10875.00, 43500.00, 'pending', NULL),
(12, '2024-01-15', 62500.00, 62500.00, 'pending', NULL),
(12, '2025-01-15', 62500.00, 125000.00, 'pending', NULL),
(12, '2026-01-15', 62500.00, 187500.00, 'pending', NULL),
(12, '2027-01-15', 62500.00, 250000.00, 'pending', NULL),
(12, '2028-01-15', 62500.00, 312500.00, 'pending', NULL),
(13, '2024-02-01', 10500.00, 10500.00, 'pending', NULL),
(13, '2024-05-01', 10500.00, 21000.00, 'pending', NULL),
(13, '2024-08-01', 10500.00, 31500.00, 'pending', NULL),
(13, '2024-11-01', 10500.00, 42000.00, 'pending', NULL);

-- =====================================================
-- 7. BANK TRANSACTIONS
-- =====================================================

-- Bank transactions for new users
INSERT INTO bank_transactions (user_id, account_id, transaction_type, transaction_date, amount, balance_after, description, reference_number, transaction_category) VALUES
(7, 11, 'credit', '2023-12-01', 50000.00, 150000.00, 'Salary Credit', 'SAL-2023-12-001', 'salary'),
(7, 11, 'debit', '2023-12-05', 15000.00, 135000.00, 'RD Installment', 'RD-2023-12-001', 'investment'),
(7, 11, 'debit', '2023-12-10', 5000.00, 130000.00, 'ATM Withdrawal', 'ATM-2023-12-001', 'withdrawal'),
(7, 12, 'credit', '2023-12-15', 25000.00, 75000.00, 'Bonus Credit', 'BON-2023-12-001', 'bonus'),
(7, 12, 'debit', '2023-12-20', 25000.00, 50000.00, 'RD Installment', 'RD-2023-12-002', 'investment'),
(8, 13, 'credit', '2023-12-01', 150000.00, 300000.00, 'Salary Credit', 'SAL-2023-12-002', 'salary'),
(8, 13, 'debit', '2023-12-01', 25000.00, 275000.00, 'RD Installment', 'RD-2023-12-003', 'investment'),
(8, 13, 'debit', '2023-12-15', 10000.00, 265000.00, 'Credit Card Payment', 'CC-2023-12-001', 'credit_card'),
(8, 14, 'credit', '2023-12-20', 50000.00, 100000.00, 'Investment Returns', 'INV-2023-12-001', 'investment'),
(8, 14, 'debit', '2023-12-25', 20000.00, 80000.00, 'Shopping', 'SHOP-2023-12-001', 'shopping'),
(9, 15, 'credit', '2023-12-01', 80000.00, 150000.00, 'Salary Credit', 'SAL-2023-12-003', 'salary'),
(9, 15, 'debit', '2023-12-20', 12000.00, 138000.00, 'RD Installment', 'RD-2023-12-004', 'investment'),
(9, 15, 'debit', '2023-12-28', 5000.00, 133000.00, 'Utility Bill Payment', 'UTIL-2023-12-001', 'utilities'),
(10, 16, 'credit', '2023-12-01', 200000.00, 400000.00, 'Salary Credit', 'SAL-2023-12-004', 'salary'),
(10, 16, 'debit', '2023-12-01', 30000.00, 370000.00, 'RD Installment', 'RD-2023-12-005', 'investment'),
(10, 16, 'debit', '2023-12-10', 15000.00, 355000.00, 'Insurance Premium', 'INS-2023-12-001', 'insurance'),
(11, 17, 'credit', '2023-12-01', 120000.00, 250000.00, 'Salary Credit', 'SAL-2023-12-005', 'salary'),
(11, 17, 'debit', '2023-12-15', 18000.00, 232000.00, 'RD Installment', 'RD-2023-12-006', 'investment'),
(11, 17, 'debit', '2023-12-20', 10000.00, 222000.00, 'Business Expense', 'BIZ-2023-12-001', 'business');

-- =====================================================
-- 8. SUMMARY
-- =====================================================

-- Display summary of banks created
DO $$
DECLARE
    bank_count INTEGER;
    account_count INTEGER;
    fd_count INTEGER;
    rd_count INTEGER;
    transaction_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO bank_count FROM banks;
    SELECT COUNT(*) INTO account_count FROM user_bank_accounts;
    SELECT COUNT(*) INTO fd_count FROM fixed_deposits;
    SELECT COUNT(*) INTO rd_count FROM recurring_deposits;
    SELECT COUNT(*) INTO transaction_count FROM bank_transactions;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY BANKS CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total Banks: %', bank_count;
    RAISE NOTICE 'User Bank Accounts: %', account_count;
    RAISE NOTICE 'Fixed Deposits: %', fd_count;
    RAISE NOTICE 'Recurring Deposits: %', rd_count;
    RAISE NOTICE 'Bank Transactions: %', transaction_count;
    RAISE NOTICE '==========================================';
END $$;