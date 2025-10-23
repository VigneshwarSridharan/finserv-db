-- =====================================================
-- Dummy Brokers Data
-- =====================================================
-- This file contains additional brokers and user accounts
-- to help understand broker management and relationships

-- =====================================================
-- 1. ADDITIONAL BROKERS
-- =====================================================

-- More brokers (only unique ones, avoiding duplicates with main sample data)
-- Note: ZERODHA, ICICIDIRECT, ANGEL already exist in main sample data
-- Note: Existing broker IDs are 1-8 from main sample data
INSERT INTO brokers (broker_name, broker_code, broker_type, website, contact_email, contact_phone, address, city, state) VALUES
('Motilal Oswal', 'MOTILAL', 'full_service', 'https://motilaloswal.com', 'support@motilaloswal.com', '1800-200-6600', 'Motilal Oswal Tower, BKC', 'Mumbai', 'Maharashtra'),
('Groww', 'GROWW', 'discount', 'https://groww.in', 'support@groww.in', '1800-123-4567', 'Groww House, Bangalore', 'Bangalore', 'Karnataka');

-- =====================================================
-- 2. USER BROKER ACCOUNTS
-- =====================================================

-- User broker accounts for new users
-- Broker IDs: 1=Zerodha, 2=ICICI Direct, 3=HDFC Sec, 4=Angel, 5=Kotak, 6=Sharekhan, 7=5Paisa, 8=Upstox, 9=Motilal, 10=Groww
INSERT INTO user_broker_accounts (user_id, broker_id, account_number, account_type, account_name, opened_date) VALUES
(7, 3, 'HDFC123456', 'equity', 'Raj Patel HDFC Account', '2023-01-15'),
(7, 2, 'ICICI234567', 'equity', 'Raj Patel ICICI Account', '2023-02-20'),
(8, 1, 'ZERO345678', 'equity', 'Priya Sharma Zerodha Account', '2023-03-10'),
(8, 4, 'ANGEL456789', 'equity', 'Priya Sharma Angel Account', '2023-04-05'),
(9, 9, 'MOTI567890', 'equity', 'Amit Kumar Motilal Account', '2023-05-12'),
(10, 10, 'GROW678901', 'equity', 'Sneha Gupta Groww Account', '2023-06-18'),
(11, 9, 'MOTI789012', 'equity', 'Vikram Singh Motilal Account', '2023-07-25');

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