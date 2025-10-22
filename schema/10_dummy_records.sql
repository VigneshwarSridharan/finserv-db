-- =====================================================
-- Additional Dummy Records for Understanding
-- =====================================================
-- This file contains additional dummy records to help understand
-- the database structure, relationships, and data patterns

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

-- User profiles for new users
INSERT INTO user_profiles (user_id, address, city, state, country, postal_code, pan_number, aadhar_number, occupation, annual_income, risk_profile) VALUES
(7, '456 Tech Park, Apartment 5B', 'Bangalore', 'Karnataka', 'India', '560001', 'ABCDE1234F', '789012345678', 'Software Engineer', 1200000.00, 'aggressive'),
(8, '789 Startup Hub, Flat 12', 'Mumbai', 'Maharashtra', 'India', '400001', 'FGHIJ5678K', '890123456789', 'Product Manager', 1800000.00, 'aggressive'),
(9, '321 Corporate Plaza, Office 8', 'Delhi', 'Delhi', 'India', '110001', 'KLMNO9012L', '901234567890', 'Business Analyst', 800000.00, 'moderate'),
(10, '654 Financial District, Suite 15', 'Gurgaon', 'Haryana', 'India', '122001', 'PQRST3456M', '012345678901', 'Investment Advisor', 2000000.00, 'conservative'),
(11, '987 Industrial Area, Unit 25', 'Ahmedabad', 'Gujarat', 'India', '380001', 'UVWXY7890N', '123456789012', 'Manufacturing Manager', 1500000.00, 'moderate');

-- User preferences for new users
INSERT INTO user_preferences (user_id, currency, timezone, notification_email, notification_sms, notification_push, portfolio_view) VALUES
(7, 'INR', 'Asia/Kolkata', TRUE, TRUE, TRUE, 'broker_wise'),
(8, 'INR', 'Asia/Kolkata', TRUE, FALSE, TRUE, 'consolidated'),
(9, 'INR', 'Asia/Kolkata', FALSE, TRUE, TRUE, 'asset_wise'),
(10, 'INR', 'Asia/Kolkata', TRUE, TRUE, FALSE, 'consolidated'),
(11, 'INR', 'Asia/Kolkata', TRUE, TRUE, TRUE, 'broker_wise');

-- =====================================================
-- 2. ADDITIONAL BROKERS AND ACCOUNTS
-- =====================================================

-- More brokers
INSERT INTO brokers (broker_name, broker_code, broker_type, website, contact_email, contact_phone, address, city, state) VALUES
('HDFC Securities', 'HDFC', 'full_service', 'https://hdfcsec.com', 'support@hdfcsec.com', '1800-419-6600', 'HDFC Bank House, Senapati Bapat Marg', 'Mumbai', 'Maharashtra'),
('ICICI Direct', 'ICICIDIRECT', 'full_service', 'https://icicidirect.com', 'support@icicidirect.com', '1800-200-3344', 'ICICI Bank Tower, BKC', 'Mumbai', 'Maharashtra'),
('Zerodha', 'ZERODHA', 'discount', 'https://zerodha.com', 'support@zerodha.com', '080-4040-2020', 'Zerodha House, Koramangala', 'Bangalore', 'Karnataka'),
('Angel Broking', 'ANGEL', 'full_service', 'https://angelbroking.com', 'support@angelbroking.com', '1800-419-6600', 'Angel Broking House, Andheri', 'Mumbai', 'Maharashtra'),
('Motilal Oswal', 'MOTILAL', 'full_service', 'https://motilaloswal.com', 'support@motilaloswal.com', '1800-200-6600', 'Motilal Oswal Tower, BKC', 'Mumbai', 'Maharashtra');

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
-- 3. ADDITIONAL SECURITIES WITH REALISTIC DATA
-- =====================================================

-- More securities covering different sectors
INSERT INTO securities (symbol, name, security_type, exchange, sector, industry, market_cap_category, isin, face_value) VALUES
('INFY', 'Infosys Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE009A01021', 5.00),
('WIPRO', 'Wipro Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE075A01022', 2.00),
('HCLTECH', 'HCL Technologies Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE860A01027', 2.00),
('TCS', 'Tata Consultancy Services Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE467B01029', 1.00),
('LT', 'Larsen & Toubro Limited', 'stock', 'NSE', 'Industrials', 'Construction & Engineering', 'large_cap', 'INE018A01030', 2.00),
('ITC', 'ITC Limited', 'stock', 'NSE', 'Consumer Goods', 'Tobacco', 'large_cap', 'INE154A01013', 1.00),
('NESTLEIND', 'Nestle India Limited', 'stock', 'NSE', 'Consumer Goods', 'Food Products', 'large_cap', 'INE239A01016', 10.00),
('COALINDIA', 'Coal India Limited', 'stock', 'NSE', 'Materials', 'Coal', 'large_cap', 'INE522F01014', 10.00),
('ONGC', 'Oil and Natural Gas Corporation Limited', 'stock', 'NSE', 'Energy', 'Oil & Gas', 'large_cap', 'INE213A01029', 5.00),
('IOC', 'Indian Oil Corporation Limited', 'stock', 'NSE', 'Energy', 'Oil & Gas', 'large_cap', 'INE242A01010', 10.00),
('NIFTYBEES', 'Nippon India ETF Nifty BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I6', 10.00),
('GOLDBEES', 'Nippon India ETF Gold BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I7', 10.00),
('JUNIORBEES', 'Nippon India ETF Junior BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I8', 10.00),
('BANKBEES', 'Nippon India ETF Bank BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I9', 10.00),
('MOMENTUMBEES', 'Nippon India ETF Momentum BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I0', 10.00);

-- Security prices for new securities
INSERT INTO security_prices (security_id, price_date, open_price, high_price, low_price, close_price, volume) VALUES
(21, '2024-01-15', 1450.00, 1475.00, 1440.00, 1465.50, 3200000),
(22, '2024-01-15', 420.00, 435.00, 418.00, 428.75, 2800000),
(23, '2024-01-15', 1250.00, 1275.00, 1240.00, 1265.25, 2100000),
(24, '2024-01-15', 3850.00, 3890.00, 3830.00, 3875.50, 1500000),
(25, '2024-01-15', 2850.00, 2890.00, 2830.00, 2865.75, 1800000),
(26, '2024-01-15', 485.00, 495.00, 480.00, 488.25, 2500000),
(27, '2024-01-15', 18500.00, 18650.00, 18420.00, 18575.00, 800000),
(28, '2024-01-15', 285.00, 290.00, 282.00, 287.50, 2200000),
(29, '2024-01-15', 185.00, 190.00, 183.00, 187.25, 1900000),
(30, '2024-01-15', 95.50, 98.00, 94.00, 96.75, 1600000),
(31, '2024-01-15', 24500.00, 24750.00, 24400.00, 24625.50, 1200000),
(32, '2024-01-15', 65.50, 67.00, 64.50, 66.25, 1800000),
(33, '2024-01-15', 125.50, 128.00, 124.00, 126.75, 1400000),
(34, '2024-01-15', 485.50, 490.20, 483.00, 487.85, 1200000),
(35, '2024-01-15', 85.50, 88.00, 84.00, 86.75, 1000000);

-- =====================================================
-- 4. ADDITIONAL BANKS AND ACCOUNTS
-- =====================================================

-- More banks
INSERT INTO banks (bank_name, bank_code, bank_type, website, contact_email, contact_phone, address, city, state) VALUES
('State Bank of India', 'SBI', 'public', 'https://sbi.co.in', 'support@sbi.co.in', '1800-425-3800', 'State Bank Bhavan, Nariman Point', 'Mumbai', 'Maharashtra'),
('HDFC Bank', 'HDFC', 'private', 'https://hdfcbank.com', 'support@hdfcbank.com', '1800-419-6600', 'HDFC Bank House, Senapati Bapat Marg', 'Mumbai', 'Maharashtra'),
('ICICI Bank', 'ICICI', 'private', 'https://icicibank.com', 'support@icicibank.com', '1800-200-3344', 'ICICI Bank Tower, BKC', 'Mumbai', 'Maharashtra'),
('Axis Bank', 'AXIS', 'private', 'https://axisbank.com', 'support@axisbank.com', '1800-419-5555', 'Axis Bank House, C-2, Wadia International Centre', 'Mumbai', 'Maharashtra'),
('Kotak Mahindra Bank', 'KOTAK', 'private', 'https://kotak.com', 'support@kotak.com', '1800-419-6600', 'Kotak Mahindra Bank Tower, BKC', 'Mumbai', 'Maharashtra');

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
-- 5. COMPREHENSIVE FIXED DEPOSITS
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
-- 6. COMPREHENSIVE RECURRING DEPOSITS
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
-- 7. COMPREHENSIVE ASSETS
-- =====================================================

-- Additional user assets with different types
INSERT INTO user_assets (user_id, category_id, subcategory_id, asset_name, description, purchase_date, purchase_price, current_value, quantity, unit, location, storage_location, insurance_policy_number, insurance_amount, insurance_expiry_date) VALUES
(7, 1, 1, 'Gold Necklace Set', 'Traditional gold necklace with matching earrings', '2023-02-14', 120000.00, 135000.00, 1, 'set', 'Bangalore', 'Bank Locker', 'GOLD-INS-001', 150000.00, '2025-02-14'),
(7, 1, 2, 'Gold Coins', 'Investment gold coins', '2023-03-15', 180000.00, 195000.00, 6, 'coins', 'Bangalore', 'Bank Locker', 'GOLD-INS-002', 200000.00, '2025-03-15'),
(7, 2, 5, '2BHK Apartment', 'Modern 2BHK apartment in Whitefield', '2022-08-20', 4500000.00, 5200000.00, 1, 'unit', 'Bangalore', 'Physical Property', 'PROP-INS-001', 5000000.00, '2025-08-20'),
(8, 1, 1, 'Gold Bracelet', 'Elegant gold bracelet', '2023-04-10', 45000.00, 50000.00, 1, 'piece', 'Mumbai', 'Home Safe', 'GOLD-INS-003', 60000.00, '2025-04-10'),
(8, 2, 6, 'Commercial Office', 'Small office space in BKC', '2021-12-05', 3000000.00, 3600000.00, 1, 'unit', 'Mumbai', 'Physical Property', 'PROP-INS-002', 3500000.00, '2025-12-05'),
(8, 4, 9, 'Art Collection', 'Contemporary Indian art', '2022-06-15', 200000.00, 250000.00, 5, 'pieces', 'Mumbai', 'Home Display', 'ART-INS-001', 300000.00, '2025-06-15'),
(9, 1, 3, 'Gold ETF Units', 'Gold ETF investment', '2023-01-20', 100000.00, 115000.00, 1000, 'units', 'Delhi', 'Demat Account', NULL, NULL, NULL),
(9, 2, 5, '1BHK Apartment', 'Compact 1BHK in Dwarka', '2023-05-10', 2500000.00, 2750000.00, 1, 'unit', 'Delhi', 'Physical Property', 'PROP-INS-003', 3000000.00, '2026-05-10'),
(10, 1, 1, 'Gold Ring Set', 'Wedding gold ring set', '2023-06-20', 80000.00, 90000.00, 1, 'set', 'Gurgaon', 'Bank Locker', 'GOLD-INS-004', 100000.00, '2025-06-20'),
(10, 2, 6, 'Retail Shop', 'Small retail shop in Cyber City', '2022-03-12', 1500000.00, 1800000.00, 1, 'unit', 'Gurgaon', 'Physical Property', 'PROP-INS-004', 2000000.00, '2025-03-12'),
(11, 1, 2, 'Gold Bars', 'Investment gold bars', '2023-07-05', 150000.00, 165000.00, 3, 'bars', 'Ahmedabad', 'Bank Locker', 'GOLD-INS-005', 180000.00, '2025-07-05'),
(11, 2, 5, '3BHK Villa', 'Spacious villa in Satellite', '2021-10-30', 6000000.00, 7500000.00, 1, 'unit', 'Ahmedabad', 'Physical Property', 'PROP-INS-005', 8000000.00, '2025-10-30');

-- Real estate details for new properties
INSERT INTO real_estate_details (asset_id, property_type, property_address, city, state, area_sqft, built_up_area_sqft, year_built, bedrooms, bathrooms, parking_spaces, rental_income, rental_yield, occupancy_status, property_tax, maintenance_charges) VALUES
(13, 'apartment', 'Whitefield Tech Park, Bangalore', 'Bangalore', 'Karnataka', 1200, 1000, 2022, 2, 2, 1, 25000.00, 5.77, 'rented', 12000.00, 3000.00),
(15, 'office', 'BKC Commercial Complex, Mumbai', 'Mumbai', 'Maharashtra', 800, 700, 2021, 0, 2, 2, 45000.00, 15.00, 'rented', 15000.00, 5000.00),
(18, 'apartment', 'Dwarka Sector 12, Delhi', 'Delhi', 'Delhi', 800, 650, 2023, 1, 1, 1, 18000.00, 7.85, 'rented', 8000.00, 2000.00),
(20, 'shop', 'Cyber City Mall, Gurgaon', 'Gurgaon', 'Haryana', 400, 350, 2022, 0, 1, 0, 25000.00, 16.67, 'rented', 6000.00, 1500.00),
(22, 'villa', 'Satellite Area, Ahmedabad', 'Ahmedabad', 'Gujarat', 2500, 2000, 2021, 3, 3, 2, 60000.00, 9.60, 'rented', 25000.00, 8000.00);

-- Gold details for new gold assets
INSERT INTO gold_details (asset_id, gold_type, purity, weight_grams, making_charges, wastage_charges, jeweler_name, current_gold_rate_per_gram, purchase_gold_rate_per_gram) VALUES
(11, 'jewelry', '22K', 45.5, 15.00, 2.00, 'Tanishq', 5500.00, 5200.00),
(12, 'coins', '24K', 60.0, 0.00, 0.00, 'Bank of India', 5800.00, 5500.00),
(14, 'jewelry', '18K', 25.0, 12.00, 1.50, 'Kalyan Jewellers', 4800.00, 4500.00),
(19, 'jewelry', '22K', 35.0, 18.00, 2.50, 'Malabar Gold', 5500.00, 5200.00),
(21, 'bars', '24K', 50.0, 0.00, 0.00, 'HDFC Bank', 5800.00, 5500.00);

-- =====================================================
-- 8. COMPREHENSIVE SECURITY HOLDINGS
-- =====================================================

-- Security holdings for new users
INSERT INTO user_security_holdings (user_id, account_id, security_id, quantity, average_price, current_price, first_purchase_date, last_purchase_date) VALUES
(7, 7, 21, 100, 1400.00, 1465.50, '2023-06-15', '2023-12-10'),
(7, 7, 24, 25, 3800.00, 3875.50, '2023-07-20', '2023-11-25'),
(7, 8, 31, 200, 24000.00, 24625.50, '2023-08-05', '2023-12-15'),
(8, 9, 22, 200, 400.00, 428.75, '2023-05-10', '2023-10-20'),
(8, 9, 25, 50, 2800.00, 2865.75, '2023-06-25', '2023-11-30'),
(8, 10, 32, 500, 60.00, 66.25, '2023-07-15', '2023-12-05'),
(9, 11, 23, 150, 1200.00, 1265.25, '2023-08-20', '2023-12-20'),
(9, 11, 26, 300, 450.00, 488.25, '2023-09-01', '2023-12-18'),
(10, 12, 27, 20, 18000.00, 18575.00, '2023-10-10', '2023-12-12'),
(10, 12, 33, 1000, 120.00, 126.75, '2023-11-05', '2023-12-25'),
(11, 13, 28, 500, 280.00, 287.50, '2023-09-15', '2023-12-08'),
(11, 13, 29, 1000, 180.00, 187.25, '2023-10-20', '2023-12-22');

-- =====================================================
-- 9. COMPREHENSIVE TRANSACTIONS
-- =====================================================

-- Security transactions for new users
INSERT INTO security_transactions (user_id, account_id, security_id, transaction_type, transaction_date, quantity, price, total_amount, brokerage, taxes, other_charges, net_amount, notes) VALUES
(7, 7, 21, 'buy', '2023-06-15', 50, 1400.00, 70000.00, 70.00, 0.00, 0.00, 70070.00, 'Initial investment in Infosys'),
(7, 7, 21, 'buy', '2023-12-10', 50, 1500.00, 75000.00, 75.00, 0.00, 0.00, 75075.00, 'Additional Infosys shares'),
(7, 7, 24, 'buy', '2023-07-20', 25, 3800.00, 95000.00, 95.00, 0.00, 0.00, 95095.00, 'TCS investment'),
(7, 8, 31, 'buy', '2023-08-05', 200, 24000.00, 4800000.00, 4800.00, 0.00, 0.00, 4804800.00, 'Nifty ETF investment'),
(8, 9, 22, 'buy', '2023-05-10', 200, 400.00, 80000.00, 80.00, 0.00, 0.00, 80080.00, 'Wipro investment'),
(8, 9, 25, 'buy', '2023-06-25', 50, 2800.00, 140000.00, 140.00, 0.00, 0.00, 140140.00, 'L&T investment'),
(8, 10, 32, 'buy', '2023-07-15', 500, 60.00, 30000.00, 30.00, 0.00, 0.00, 30030.00, 'Gold ETF investment'),
(9, 11, 23, 'buy', '2023-08-20', 150, 1200.00, 180000.00, 180.00, 0.00, 0.00, 180180.00, 'HCL Tech investment'),
(9, 11, 26, 'buy', '2023-09-01', 300, 450.00, 135000.00, 135.00, 0.00, 0.00, 135135.00, 'ITC investment'),
(10, 12, 27, 'buy', '2023-10-10', 20, 18000.00, 360000.00, 360.00, 0.00, 0.00, 360360.00, 'Nestle investment'),
(10, 12, 33, 'buy', '2023-11-05', 1000, 120.00, 120000.00, 120.00, 0.00, 0.00, 120120.00, 'Junior BeES investment'),
(11, 13, 28, 'buy', '2023-09-15', 500, 280.00, 140000.00, 140.00, 0.00, 0.00, 140140.00, 'Coal India investment'),
(11, 13, 29, 'buy', '2023-10-20', 1000, 180.00, 180000.00, 180.00, 0.00, 0.00, 180180.00, 'ONGC investment');

-- Asset transactions for new users
INSERT INTO asset_transactions (user_id, asset_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount, transaction_fees, net_amount, counterparty, notes) VALUES
(7, 11, 'purchase', '2023-02-14', 1, 120000.00, 120000.00, 0.00, 120000.00, 'Tanishq Store', 'Gold necklace set purchase'),
(7, 12, 'purchase', '2023-03-15', 6, 30000.00, 180000.00, 0.00, 180000.00, 'Bank of India', 'Gold coins investment'),
(7, 13, 'purchase', '2022-08-20', 1, 4500000.00, 4500000.00, 45000.00, 4545000.00, 'Prestige Developers', 'Apartment purchase in Whitefield'),
(8, 14, 'purchase', '2023-04-10', 1, 45000.00, 45000.00, 0.00, 45000.00, 'Kalyan Jewellers', 'Gold bracelet purchase'),
(8, 15, 'purchase', '2021-12-05', 1, 3000000.00, 3000000.00, 30000.00, 3030000.00, 'Commercial Real Estate', 'Office space purchase in BKC'),
(8, 16, 'purchase', '2022-06-15', 5, 40000.00, 200000.00, 0.00, 200000.00, 'Art Gallery', 'Art collection purchase'),
(9, 17, 'purchase', '2023-01-20', 1000, 100.00, 100000.00, 0.00, 100000.00, 'Zerodha', 'Gold ETF purchase'),
(9, 18, 'purchase', '2023-05-10', 1, 2500000.00, 2500000.00, 25000.00, 2525000.00, 'DLF Developers', 'Apartment purchase in Dwarka'),
(10, 19, 'purchase', '2023-06-20', 1, 80000.00, 80000.00, 0.00, 80000.00, 'Malabar Gold', 'Gold ring set purchase'),
(10, 20, 'purchase', '2022-03-12', 1, 1500000.00, 1500000.00, 15000.00, 1515000.00, 'Retail Real Estate', 'Shop purchase in Cyber City'),
(11, 21, 'purchase', '2023-07-05', 3, 50000.00, 150000.00, 0.00, 150000.00, 'HDFC Bank', 'Gold bars investment'),
(11, 22, 'purchase', '2021-10-30', 1, 6000000.00, 6000000.00, 60000.00, 6060000.00, 'Ahmedabad Builders', 'Villa purchase in Satellite');

-- =====================================================
-- 10. COMPREHENSIVE PORTFOLIO GOALS
-- =====================================================

-- Portfolio goals for new users
INSERT INTO portfolio_goals (user_id, goal_name, goal_type, target_amount, current_amount, target_date, priority, is_achieved, achieved_date, notes) VALUES
(7, 'Dream Car', 'other', 1500000.00, 500000.00, '2025-12-31', 'high', FALSE, NULL, 'Tesla Model 3'),
(7, 'Home Upgrade', 'house_purchase', 3000000.00, 1000000.00, '2026-06-30', 'high', FALSE, NULL, 'Upgrade to 3BHK'),
(7, 'Wedding Fund', 'marriage', 2000000.00, 800000.00, '2025-03-15', 'high', FALSE, NULL, 'Wedding expenses'),
(8, 'Startup Investment', 'other', 5000000.00, 2000000.00, '2026-12-31', 'high', FALSE, NULL, 'Angel investment fund'),
(8, 'World Tour', 'vacation', 800000.00, 300000.00, '2024-12-31', 'medium', FALSE, NULL, 'Europe and Asia tour'),
(8, 'Emergency Fund', 'emergency_fund', 1000000.00, 500000.00, '2024-06-30', 'high', FALSE, NULL, '6 months expenses'),
(9, 'Child Education', 'education', 3000000.00, 1000000.00, '2030-12-31', 'high', FALSE, NULL, 'Child college fund'),
(9, 'Retirement Fund', 'retirement', 10000000.00, 2000000.00, '2045-12-31', 'medium', FALSE, NULL, 'Early retirement goal'),
(10, 'Luxury Car', 'other', 3000000.00, 1200000.00, '2025-08-31', 'medium', FALSE, NULL, 'BMW X5'),
(10, 'Investment Property', 'house_purchase', 8000000.00, 3000000.00, '2027-12-31', 'high', FALSE, NULL, 'Rental property investment'),
(11, 'Factory Expansion', 'other', 15000000.00, 5000000.00, '2026-12-31', 'high', FALSE, NULL, 'Manufacturing unit expansion'),
(11, 'Children Marriage', 'marriage', 5000000.00, 2000000.00, '2032-12-31', 'high', FALSE, NULL, 'Two children marriage fund');

-- =====================================================
-- 11. COMPREHENSIVE ASSET ALLOCATION TARGETS
-- =====================================================

-- Asset allocation targets for new users
INSERT INTO asset_allocation_targets (user_id, asset_type, target_percentage, current_percentage, tolerance_band) VALUES
(7, 'equity', 60.00, 55.00, 5.00),
(7, 'debt', 25.00, 30.00, 5.00),
(7, 'gold', 10.00, 12.00, 3.00),
(7, 'real_estate', 5.00, 3.00, 2.00),
(8, 'equity', 70.00, 75.00, 5.00),
(8, 'debt', 20.00, 15.00, 5.00),
(8, 'gold', 5.00, 5.00, 3.00),
(8, 'real_estate', 5.00, 5.00, 2.00),
(9, 'equity', 40.00, 45.00, 5.00),
(9, 'debt', 45.00, 40.00, 5.00),
(9, 'gold', 10.00, 10.00, 3.00),
(9, 'real_estate', 5.00, 5.00, 2.00),
(10, 'equity', 50.00, 55.00, 5.00),
(10, 'debt', 30.00, 25.00, 5.00),
(10, 'gold', 10.00, 10.00, 3.00),
(10, 'real_estate', 10.00, 10.00, 3.00),
(11, 'equity', 35.00, 40.00, 5.00),
(11, 'debt', 40.00, 35.00, 5.00),
(11, 'gold', 10.00, 10.00, 3.00),
(11, 'real_estate', 15.00, 15.00, 3.00);

-- =====================================================
-- 12. COMPREHENSIVE WATCHLIST
-- =====================================================

-- Watchlist for new users
INSERT INTO user_watchlist (user_id, security_id, target_price, notes, added_date) VALUES
(7, 1, 2800.00, 'Reliance - Long term growth play', '2023-12-01'),
(7, 2, 180.00, 'HDFC Bank - Banking sector leader', '2023-12-05'),
(7, 3, 120.00, 'HDFC - Housing finance leader', '2023-12-10'),
(8, 4, 1800.00, 'ICICI Bank - Strong fundamentals', '2023-12-02'),
(8, 5, 250.00, 'Kotak Bank - Premium banking', '2023-12-08'),
(8, 6, 450.00, 'Axis Bank - Growth potential', '2023-12-12'),
(9, 7, 120.00, 'SBI - PSU banking leader', '2023-12-03'),
(9, 8, 80.00, 'Bank of Baroda - Value pick', '2023-12-07'),
(9, 9, 60.00, 'PNB - Turnaround story', '2023-12-11'),
(10, 10, 200.00, 'Canara Bank - PSU banking', '2023-12-04'),
(10, 11, 1100.00, 'Bharti Airtel - Telecom recovery', '2023-12-09'),
(10, 12, 12000.00, 'Maruti - Auto sector growth', '2023-12-13'),
(11, 13, 3500.00, 'Asian Paints - Consumer goods', '2023-12-06'),
(11, 14, 20000.00, 'Nestle - FMCG defensive', '2023-12-14'),
(11, 15, 9000.00, 'UltraTech - Infrastructure play', '2023-12-15');

-- =====================================================
-- 13. COMPREHENSIVE RD INSTALLMENTS
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
-- 14. COMPREHENSIVE FD INTEREST PAYMENTS
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
-- 15. COMPREHENSIVE PORTFOLIO PERFORMANCE
-- =====================================================

-- Portfolio performance for new users
INSERT INTO portfolio_performance (user_id, performance_date, total_portfolio_value, total_investment, total_pnl, total_return_percentage, day_change, day_change_percentage, week_change, week_change_percentage, month_change, month_change_percentage, year_change, year_change_percentage) VALUES
(7, '2024-01-01', 8500000.00, 7500000.00, 1000000.00, 13.33, 25000.00, 0.29, 150000.00, 1.80, 500000.00, 6.25, 1000000.00, 13.33),
(7, '2024-01-02', 8525000.00, 7500000.00, 1025000.00, 13.67, 25000.00, 0.29, 175000.00, 2.10, 525000.00, 6.58, 1025000.00, 13.67),
(7, '2024-01-03', 8480000.00, 7500000.00, 980000.00, 13.07, -45000.00, -0.53, 130000.00, 1.56, 480000.00, 6.00, 980000.00, 13.07),
(8, '2024-01-01', 12000000.00, 10000000.00, 2000000.00, 20.00, 50000.00, 0.42, 300000.00, 2.56, 800000.00, 7.14, 2000000.00, 20.00),
(8, '2024-01-02', 12050000.00, 10000000.00, 2050000.00, 20.50, 50000.00, 0.42, 350000.00, 2.98, 850000.00, 7.58, 2050000.00, 20.50),
(8, '2024-01-03', 11980000.00, 10000000.00, 1980000.00, 19.80, -70000.00, -0.58, 280000.00, 2.39, 780000.00, 6.96, 1980000.00, 19.80),
(9, '2024-01-01', 4500000.00, 4000000.00, 500000.00, 12.50, 15000.00, 0.33, 75000.00, 1.69, 250000.00, 5.88, 500000.00, 12.50),
(9, '2024-01-02', 4515000.00, 4000000.00, 515000.00, 12.88, 15000.00, 0.33, 90000.00, 2.03, 265000.00, 6.22, 515000.00, 12.88),
(9, '2024-01-03', 4490000.00, 4000000.00, 490000.00, 12.25, -25000.00, -0.55, 65000.00, 1.47, 240000.00, 5.65, 490000.00, 12.25),
(10, '2024-01-01', 15000000.00, 12000000.00, 3000000.00, 25.00, 75000.00, 0.50, 450000.00, 3.09, 1200000.00, 8.70, 3000000.00, 25.00),
(10, '2024-01-02', 15075000.00, 12000000.00, 3075000.00, 25.63, 75000.00, 0.50, 525000.00, 3.60, 1275000.00, 9.24, 3075000.00, 25.63),
(10, '2024-01-03', 15020000.00, 12000000.00, 3020000.00, 25.17, -55000.00, -0.36, 470000.00, 3.22, 1220000.00, 8.84, 3020000.00, 25.17),
(11, '2024-01-01', 20000000.00, 18000000.00, 2000000.00, 11.11, 100000.00, 0.50, 600000.00, 3.09, 1500000.00, 8.11, 2000000.00, 11.11),
(11, '2024-01-02', 20100000.00, 18000000.00, 2100000.00, 11.67, 100000.00, 0.50, 700000.00, 3.60, 1600000.00, 8.65, 2100000.00, 11.67),
(11, '2024-01-03', 20050000.00, 18000000.00, 2050000.00, 11.39, -50000.00, -0.25, 650000.00, 3.35, 1550000.00, 8.38, 2050000.00, 11.39);

-- =====================================================
-- 16. COMPREHENSIVE PORTFOLIO ALERTS
-- =====================================================

-- Portfolio alerts for new users
INSERT INTO portfolio_alerts (user_id, alert_type, alert_name, alert_condition, alert_threshold, is_active, created_date, last_triggered) VALUES
(7, 'price_alert', 'Infosys Target Price', 'INFY close_price >= 1500', 1500.00, TRUE, '2023-12-01', NULL),
(7, 'price_alert', 'TCS Target Price', 'TCS close_price >= 4000', 4000.00, TRUE, '2023-12-05', NULL),
(7, 'maturity_alert', 'FD Maturity Alert', 'fixed_deposits.maturity_date <= CURRENT_DATE + INTERVAL ''30 days''', NULL, TRUE, '2023-12-01', NULL),
(8, 'price_alert', 'Wipro Target Price', 'WIPRO close_price >= 500', 500.00, TRUE, '2023-12-02', NULL),
(8, 'price_alert', 'L&T Target Price', 'LT close_price >= 3000', 3000.00, TRUE, '2023-12-08', NULL),
(8, 'allocation_alert', 'Equity Allocation Alert', 'equity_percentage > 75', 75.00, TRUE, '2023-12-02', NULL),
(9, 'price_alert', 'HCL Tech Target Price', 'HCLTECH close_price >= 1400', 1400.00, TRUE, '2023-12-03', NULL),
(9, 'price_alert', 'ITC Target Price', 'ITC close_price >= 550', 550.00, TRUE, '2023-12-07', NULL),
(9, 'goal_alert', 'Child Education Goal', 'child_education_progress >= 80', 80.00, TRUE, '2023-12-03', NULL),
(10, 'price_alert', 'Nestle Target Price', 'NESTLEIND close_price >= 20000', 20000.00, TRUE, '2023-12-04', NULL),
(10, 'price_alert', 'Junior BeES Target Price', 'JUNIORBEES close_price >= 150', 150.00, TRUE, '2023-12-09', NULL),
(10, 'performance_alert', 'Portfolio Loss Alert', 'daily_return_percentage < -3', -3.00, TRUE, '2023-12-04', NULL),
(11, 'price_alert', 'Coal India Target Price', 'COALINDIA close_price >= 350', 350.00, TRUE, '2023-12-06', NULL),
(11, 'price_alert', 'ONGC Target Price', 'ONGC close_price >= 220', 220.00, TRUE, '2023-12-14', NULL),
(11, 'goal_alert', 'Factory Expansion Goal', 'factory_expansion_progress >= 70', 70.00, TRUE, '2023-12-06', NULL);

-- =====================================================
-- 17. COMPREHENSIVE ASSET VALUATIONS
-- =====================================================

-- Asset valuations for new users
INSERT INTO asset_valuations (asset_id, valuation_date, valuation_amount, valuation_method, valuation_source, notes) VALUES
(11, '2023-12-01', 130000.00, 'market_price', 'Gold Rate Today', 'Gold price based on current market rate'),
(11, '2024-01-01', 135000.00, 'market_price', 'Gold Rate Today', 'Updated gold valuation'),
(12, '2023-12-01', 190000.00, 'market_price', 'Bank Gold Rate', 'Gold coins valued at current bank rate'),
(12, '2024-01-01', 195000.00, 'market_price', 'Bank Gold Rate', 'Updated gold coins valuation'),
(13, '2023-12-01', 5000000.00, 'appraisal', 'Real Estate Appraiser', 'Annual property appraisal'),
(13, '2024-01-01', 5200000.00, 'appraisal', 'Real Estate Appraiser', 'Updated property valuation'),
(14, '2023-12-01', 48000.00, 'market_price', 'Gold Rate Today', 'Gold bracelet valued at current rate'),
(14, '2024-01-01', 50000.00, 'market_price', 'Gold Rate Today', 'Updated gold bracelet valuation'),
(15, '2023-12-01', 3500000.00, 'appraisal', 'Commercial Appraiser', 'Commercial property appraisal'),
(15, '2024-01-01', 3600000.00, 'appraisal', 'Commercial Appraiser', 'Updated commercial property valuation'),
(16, '2023-12-01', 220000.00, 'market_price', 'Art Market Index', 'Art collection valued at current market'),
(16, '2024-01-01', 250000.00, 'market_price', 'Art Market Index', 'Updated art collection valuation'),
(17, '2023-12-01', 110000.00, 'market_price', 'ETF NAV', 'Gold ETF valued at current NAV'),
(17, '2024-01-01', 115000.00, 'market_price', 'ETF NAV', 'Updated ETF valuation'),
(18, '2023-12-01', 2600000.00, 'appraisal', 'Real Estate Appraiser', 'Apartment appraisal'),
(18, '2024-01-01', 2750000.00, 'appraisal', 'Real Estate Appraiser', 'Updated apartment valuation'),
(19, '2023-12-01', 85000.00, 'market_price', 'Gold Rate Today', 'Gold ring set valued at current rate'),
(19, '2024-01-01', 90000.00, 'market_price', 'Gold Rate Today', 'Updated gold ring set valuation'),
(20, '2023-12-01', 1700000.00, 'appraisal', 'Commercial Appraiser', 'Retail shop appraisal'),
(20, '2024-01-01', 1800000.00, 'appraisal', 'Commercial Appraiser', 'Updated retail shop valuation'),
(21, '2023-12-01', 160000.00, 'market_price', 'Gold Rate Today', 'Gold bars valued at current rate'),
(21, '2024-01-01', 165000.00, 'market_price', 'Gold Rate Today', 'Updated gold bars valuation'),
(22, '2023-12-01', 7200000.00, 'appraisal', 'Real Estate Appraiser', 'Villa appraisal'),
(22, '2024-01-01', 7500000.00, 'appraisal', 'Real Estate Appraiser', 'Updated villa valuation');

-- =====================================================
-- 18. COMPREHENSIVE ASSET PRICE INDICES
-- =====================================================

-- Asset price indices for new categories
INSERT INTO asset_price_indices (category_id, subcategory_id, index_name, index_date, index_value, base_date, base_value, source) VALUES
(1, 1, 'Gold Jewelry Index', '2024-01-15', 130.25, '2023-01-01', 100.00, 'MCX Gold'),
(1, 2, 'Gold Coins Index', '2024-01-15', 132.50, '2023-01-01', 100.00, 'MCX Gold'),
(1, 3, 'Gold ETF Index', '2024-01-15', 131.75, '2023-01-01', 100.00, 'NSE Gold ETF'),
(2, 5, 'Residential Property Index', '2024-01-15', 118.25, '2023-01-01', 100.00, 'Real Estate Index'),
(2, 6, 'Commercial Property Index', '2024-01-15', 115.75, '2023-01-01', 100.00, 'Commercial Real Estate Index'),
(4, 9, 'Art Index', '2024-01-15', 125.00, '2023-01-01', 100.00, 'Art Market Index'),
(4, 10, 'Collectibles Index', '2024-01-15', 110.50, '2023-01-01', 100.00, 'Collectibles Market Index'),
(4, 11, 'Antiques Index', '2024-01-15', 108.75, '2023-01-01', 100.00, 'Antiques Market Index');

-- =====================================================
-- 19. COMPREHENSIVE BANK TRANSACTIONS
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
-- 20. COMPREHENSIVE PORTFOLIO REPORTS
-- =====================================================

-- Portfolio reports for new users
INSERT INTO portfolio_reports (user_id, report_name, report_type, report_date, report_data, generated_by) VALUES
(7, 'Monthly Portfolio Summary - December 2023', 'monthly_summary', '2023-12-31', '{"total_value": 8500000, "total_investment": 7500000, "total_return": 1000000, "return_percentage": 13.33, "top_performers": ["INFY", "TCS"], "worst_performers": ["Gold ETF"], "asset_allocation": {"equity": 55, "debt": 30, "gold": 12, "real_estate": 3}}', 'system'),
(8, 'Quarterly Performance Report - Q4 2023', 'quarterly_performance', '2023-12-31', '{"quarter": "Q4 2023", "total_value": 12000000, "quarterly_return": 2000000, "quarterly_return_percentage": 20.00, "monthly_returns": [5.5, 7.2, 6.8], "sector_performance": {"technology": 15.5, "banking": 12.3, "consumer_goods": 8.7}}', 'system'),
(9, 'Annual Portfolio Review - 2023', 'annual_review', '2023-12-31', '{"year": 2023, "total_value": 4500000, "annual_return": 500000, "annual_return_percentage": 12.50, "goal_progress": {"child_education": 33.33, "retirement": 20.00}, "risk_metrics": {"volatility": 8.5, "sharpe_ratio": 1.2}}', 'system'),
(10, 'Asset Allocation Report - December 2023', 'asset_allocation', '2023-12-31', '{"report_date": "2023-12-31", "total_value": 15000000, "asset_allocation": {"equity": 55, "debt": 25, "gold": 10, "real_estate": 10}, "rebalancing_needed": true, "recommendations": ["Reduce equity allocation by 5%", "Increase debt allocation by 5%"]}', 'system'),
(11, 'Risk Analysis Report - December 2023', 'risk_analysis', '2023-12-31', '{"report_date": "2023-12-31", "total_value": 20000000, "risk_metrics": {"portfolio_beta": 1.15, "volatility": 12.5, "var_95": 2.5, "max_drawdown": 8.2}, "risk_level": "moderate", "recommendations": ["Consider adding more defensive stocks", "Reduce concentration risk"]}', 'system');

-- =====================================================
-- 21. COMPREHENSIVE PORTFOLIO TRANSACTIONS LOG
-- =====================================================

-- Portfolio transactions log for new users
INSERT INTO portfolio_transactions_log (user_id, transaction_type, transaction_category, transaction_date, amount, description, metadata) VALUES
(7, 'security_purchase', 'equity', '2023-06-15', 70070.00, 'Purchased 50 shares of INFY at ₹1400', '{"symbol": "INFY", "quantity": 50, "price": 1400, "broker": "HDFC Securities"}'),
(7, 'security_purchase', 'equity', '2023-12-10', 75075.00, 'Purchased 50 shares of INFY at ₹1500', '{"symbol": "INFY", "quantity": 50, "price": 1500, "broker": "HDFC Securities"}'),
(7, 'asset_purchase', 'real_estate', '2022-08-20', 4545000.00, 'Purchased 2BHK apartment in Whitefield', '{"property_type": "apartment", "location": "Whitefield", "area_sqft": 1200}'),
(8, 'security_purchase', 'equity', '2023-05-10', 80080.00, 'Purchased 200 shares of WIPRO at ₹400', '{"symbol": "WIPRO", "quantity": 200, "price": 400, "broker": "Zerodha"}'),
(8, 'asset_purchase', 'commercial_real_estate', '2021-12-05', 3030000.00, 'Purchased office space in BKC', '{"property_type": "office", "location": "BKC", "area_sqft": 800}'),
(9, 'security_purchase', 'equity', '2023-08-20', 180180.00, 'Purchased 150 shares of HCLTECH at ₹1200', '{"symbol": "HCLTECH", "quantity": 150, "price": 1200, "broker": "Motilal Oswal"}'),
(9, 'asset_purchase', 'residential_real_estate', '2023-05-10', 2525000.00, 'Purchased 1BHK apartment in Dwarka', '{"property_type": "apartment", "location": "Dwarka", "area_sqft": 800}'),
(10, 'security_purchase', 'equity', '2023-10-10', 360360.00, 'Purchased 20 shares of NESTLEIND at ₹18000', '{"symbol": "NESTLEIND", "quantity": 20, "price": 18000, "broker": "HDFC Securities"}'),
(10, 'asset_purchase', 'retail_real_estate', '2022-03-12', 1515000.00, 'Purchased retail shop in Cyber City', '{"property_type": "shop", "location": "Cyber City", "area_sqft": 400}'),
(11, 'security_purchase', 'equity', '2023-09-15', 140140.00, 'Purchased 500 shares of COALINDIA at ₹280', '{"symbol": "COALINDIA", "quantity": 500, "price": 280, "broker": "ICICI Direct"}'),
(11, 'asset_purchase', 'residential_real_estate', '2021-10-30', 6060000.00, 'Purchased 3BHK villa in Satellite', '{"property_type": "villa", "location": "Satellite", "area_sqft": 2500}');

-- =====================================================
-- 22. COMPREHENSIVE SAMPLE DATA SUMMARY
-- =====================================================

-- Display summary of dummy records created
DO $$
DECLARE
    user_count INTEGER;
    broker_count INTEGER;
    security_count INTEGER;
    bank_count INTEGER;
    fd_count INTEGER;
    rd_count INTEGER;
    asset_count INTEGER;
    transaction_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO broker_count FROM brokers;
    SELECT COUNT(*) INTO security_count FROM securities;
    SELECT COUNT(*) INTO bank_count FROM banks;
    SELECT COUNT(*) INTO fd_count FROM fixed_deposits;
    SELECT COUNT(*) INTO rd_count FROM recurring_deposits;
    SELECT COUNT(*) INTO asset_count FROM user_assets;
    SELECT COUNT(*) INTO transaction_count FROM security_transactions;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY RECORDS CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Brokers: %', broker_count;
    RAISE NOTICE 'Securities: %', security_count;
    RAISE NOTICE 'Banks: %', bank_count;
    RAISE NOTICE 'Fixed Deposits: %', fd_count;
    RAISE NOTICE 'Recurring Deposits: %', rd_count;
    RAISE NOTICE 'Assets: %', asset_count;
    RAISE NOTICE 'Security Transactions: %', transaction_count;
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total Portfolio Value: ~₹50+ Crores';
    RAISE NOTICE 'Total Investment: ~₹45+ Crores';
    RAISE NOTICE 'Total P&L: ~₹5+ Crores';
    RAISE NOTICE '==========================================';
END $$;