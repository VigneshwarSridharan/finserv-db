-- =====================================================
-- Dummy Brokers Data
-- =====================================================
-- This file contains additional brokers and user accounts
-- to help understand broker management and relationships

-- =====================================================
-- 1. ADDITIONAL BROKERS
-- =====================================================

-- More brokers
INSERT INTO brokers (broker_name, broker_code, broker_type, website, contact_email, contact_phone, address, city, state) VALUES
('HDFC Securities', 'HDFC', 'full_service', 'https://hdfcsec.com', 'support@hdfcsec.com', '1800-419-6600', 'HDFC Bank House, Senapati Bapat Marg', 'Mumbai', 'Maharashtra'),
('ICICI Direct', 'ICICIDIRECT', 'full_service', 'https://icicidirect.com', 'support@icicidirect.com', '1800-200-3344', 'ICICI Bank Tower, BKC', 'Mumbai', 'Maharashtra'),
('Zerodha', 'ZERODHA', 'discount', 'https://zerodha.com', 'support@zerodha.com', '080-4040-2020', 'Zerodha House, Koramangala', 'Bangalore', 'Karnataka'),
('Angel Broking', 'ANGEL', 'full_service', 'https://angelbroking.com', 'support@angelbroking.com', '1800-419-6600', 'Angel Broking House, Andheri', 'Mumbai', 'Maharashtra'),
('Motilal Oswal', 'MOTILAL', 'full_service', 'https://motilaloswal.com', 'support@motilaloswal.com', '1800-200-6600', 'Motilal Oswal Tower, BKC', 'Mumbai', 'Maharashtra');

-- =====================================================
-- 2. USER BROKER ACCOUNTS
-- =====================================================

-- User broker accounts for new users
INSERT INTO user_broker_accounts (user_id, broker_id, account_number, account_type, account_name, opened_date) VALUES
(7, 9, 'HDFC123456', 'equity', 'Raj Patel HDFC Account', '2023-01-15'),
(7, 10, 'ICICI234567', 'equity', 'Raj Patel ICICI Account', '2023-02-20'),
(8, 11, 'ZERO345678', 'equity', 'Priya Sharma Zerodha Account', '2023-03-10'),
(8, 12, 'ANGEL456789', 'equity', 'Priya Sharma Angel Account', '2023-04-05'),
(9, 13, 'MOTI567890', 'equity', 'Amit Kumar Motilal Account', '2023-05-12'),
(10, 9, 'HDFC678901', 'equity', 'Sneha Gupta HDFC Account', '2023-06-18'),
(11, 10, 'ICICI789012', 'equity', 'Vikram Singh ICICI Account', '2023-07-25');

-- =====================================================
-- 3. SUMMARY
-- =====================================================

-- Display summary of brokers created
DO $$
DECLARE
    broker_count INTEGER;
    account_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO broker_count FROM brokers;
    SELECT COUNT(*) INTO account_count FROM user_broker_accounts;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY BROKERS CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total Brokers: %', broker_count;
    RAISE NOTICE 'User Broker Accounts: %', account_count;
    RAISE NOTICE '==========================================';
END $$;