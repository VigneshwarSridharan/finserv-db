-- =====================================================
-- Dummy Securities Data
-- =====================================================
-- This file contains additional securities and holdings
-- to help understand security management and performance

-- =====================================================
-- 1. ADDITIONAL SECURITIES WITH REALISTIC DATA
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

-- =====================================================
-- 2. SECURITY PRICES
-- =====================================================

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
-- 3. SECURITY HOLDINGS
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
-- 4. SUMMARY
-- =====================================================

-- Display summary of securities created
DO $$
DECLARE
    security_count INTEGER;
    price_count INTEGER;
    holding_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO security_count FROM securities;
    SELECT COUNT(*) INTO price_count FROM security_prices;
    SELECT COUNT(*) INTO holding_count FROM user_security_holdings;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY SECURITIES CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total Securities: %', security_count;
    RAISE NOTICE 'Security Prices: %', price_count;
    RAISE NOTICE 'Security Holdings: %', holding_count;
    RAISE NOTICE '==========================================';
END $$;