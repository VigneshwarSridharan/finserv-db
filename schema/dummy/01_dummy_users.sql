-- =====================================================
-- Dummy Users Data
-- =====================================================
-- This file contains additional users with different profiles
-- to help understand user management and preferences

-- =====================================================
-- 1. ADDITIONAL USERS WITH DIFFERENT PROFILES
-- =====================================================

-- Young professional with aggressive investment strategy
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth) VALUES
('raj_patel', 'raj.patel@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Raj', 'Patel', '+91-9876543216', '1995-03-15'),
('priya_sharma', 'priya.sharma@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Priya', 'Sharma', '+91-9876543217', '1998-07-22'),
('amit_kumar', 'amit.kumar@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Amit', 'Kumar', '+91-9876543218', '1985-11-08'),
('sneha_gupta', 'sneha.gupta@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Sneha', 'Gupta', '+91-9876543219', '1992-12-30'),
('vikram_singh', 'vikram.singh@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Vikram', 'Singh', '+91-9876543220', '1980-05-18');

-- =====================================================
-- 2. USER PROFILES
-- =====================================================

-- User profiles for new users
INSERT INTO user_profiles (user_id, address, city, state, country, postal_code, pan_number, aadhar_number, occupation, annual_income, risk_profile) VALUES
(7, '456 Tech Park, Apartment 5B', 'Bangalore', 'Karnataka', 'India', '560001', 'ABCDE1234F', '789012345678', 'Software Engineer', 1200000.00, 'aggressive'),
(8, '789 Startup Hub, Flat 12', 'Mumbai', 'Maharashtra', 'India', '400001', 'FGHIJ5678K', '890123456789', 'Product Manager', 1800000.00, 'aggressive'),
(9, '321 Corporate Plaza, Office 8', 'Delhi', 'Delhi', 'India', '110001', 'KLMNO9012L', '901234567890', 'Business Analyst', 800000.00, 'moderate'),
(10, '654 Financial District, Suite 15', 'Gurgaon', 'Haryana', 'India', '122001', 'PQRST3456M', '012345678901', 'Investment Advisor', 2000000.00, 'conservative'),
(11, '987 Industrial Area, Unit 25', 'Ahmedabad', 'Gujarat', 'India', '380001', 'UVWXY7890N', '123456789012', 'Manufacturing Manager', 1500000.00, 'moderate');

-- =====================================================
-- 3. USER PREFERENCES
-- =====================================================

-- User preferences for new users
INSERT INTO user_preferences (user_id, currency, timezone, notification_email, notification_sms, notification_push, portfolio_view) VALUES
(7, 'INR', 'Asia/Kolkata', TRUE, TRUE, TRUE, 'broker_wise'),
(8, 'INR', 'Asia/Kolkata', TRUE, FALSE, TRUE, 'consolidated'),
(9, 'INR', 'Asia/Kolkata', FALSE, TRUE, TRUE, 'asset_wise'),
(10, 'INR', 'Asia/Kolkata', TRUE, TRUE, FALSE, 'consolidated'),
(11, 'INR', 'Asia/Kolkata', TRUE, TRUE, TRUE, 'broker_wise');

-- =====================================================
-- 4. SUMMARY
-- =====================================================

-- Display summary of users created
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    preference_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO preference_count FROM user_preferences;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY USERS CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total Users: %', user_count;
    RAISE NOTICE 'User Profiles: %', profile_count;
    RAISE NOTICE 'User Preferences: %', preference_count;
    RAISE NOTICE '==========================================';
END $$;