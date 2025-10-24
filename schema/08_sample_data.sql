-- =====================================================
-- Sample Data for Portfolio Management Database
-- =====================================================

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth) VALUES
('john_doe', 'john.doe@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'John', 'Doe', '+91-9876543210', '1985-06-15'),
('jane_smith', 'jane.smith@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Jane', 'Smith', '+91-9876543211', '1990-03-22'),
('mike_wilson', 'mike.wilson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Mike', 'Wilson', '+91-9876543212', '1988-11-08');

-- Insert user profiles
INSERT INTO user_profiles (user_id, address, city, state, country, postal_code, pan_number, aadhar_number, occupation, annual_income, risk_profile) VALUES
(1, '123 Main Street, Apartment 4B', 'Mumbai', 'Maharashtra', 'India', '400001', 'ABCDE1234F', '123456789012', 'Software Engineer', 1200000.00, 'moderate'),
(2, '456 Park Avenue, Floor 2', 'Delhi', 'Delhi', 'India', '110001', 'FGHIJ5678K', '234567890123', 'Investment Banker', 2000000.00, 'aggressive'),
(3, '789 Oak Street, House 15', 'Bangalore', 'Karnataka', 'India', '560001', 'KLMNO9012P', '345678901234', 'Business Analyst', 800000.00, 'conservative');

-- Insert user preferences
INSERT INTO user_preferences (user_id, currency, timezone, notification_email, notification_sms, notification_push, portfolio_view) VALUES
(1, 'INR', 'Asia/Kolkata', TRUE, FALSE, TRUE, 'consolidated'),
(2, 'INR', 'Asia/Kolkata', TRUE, TRUE, TRUE, 'broker_wise'),
(3, 'INR', 'Asia/Kolkata', TRUE, FALSE, FALSE, 'asset_wise');

-- Insert sample brokers
INSERT INTO brokers (broker_name, broker_code, broker_type, website, contact_email, contact_phone, address, city, state) VALUES
('Zerodha', 'ZERODHA', 'discount', 'https://zerodha.com', 'support@zerodha.com', '080-4040-2020', '153/154, 4th Cross, JP Nagar 4th Phase', 'Bangalore', 'Karnataka'),
('ICICI Direct', 'ICICIDIRECT', 'full_service', 'https://icicidirect.com', 'support@icicidirect.com', '1800-200-3344', 'ICICI Bank Tower, Bandra Kurla Complex', 'Mumbai', 'Maharashtra'),
('HDFC Securities', 'HDFCSEC', 'full_service', 'https://hdfcsec.com', 'support@hdfcsec.com', '1800-3010-6767', 'HDFC House, H.T. Parekh Marg', 'Mumbai', 'Maharashtra'),
('Angel Broking', 'ANGEL', 'discount', 'https://angelbroking.com', 'support@angelbroking.com', '080-4748-0500', 'G-1, Ackruti Star, MIDC Central Road', 'Mumbai', 'Maharashtra');

-- Insert user broker accounts
INSERT INTO user_broker_accounts (user_id, broker_id, account_number, account_type, account_name, opened_date) VALUES
(1, 1, 'ZER123456', 'equity', 'John Doe Equity Account', '2023-01-15'),
(1, 2, 'ICD789012', 'equity', 'John Doe ICICI Account', '2023-02-20'),
(2, 1, 'ZER234567', 'equity', 'Jane Smith Equity Account', '2023-01-10'),
(2, 3, 'HDF345678', 'equity', 'Jane Smith HDFC Account', '2023-03-05'),
(3, 4, 'ANG456789', 'equity', 'Mike Wilson Angel Account', '2023-02-28');

-- Insert sample securities
INSERT INTO securities (symbol, name, security_type, exchange, sector, industry, market_cap_category, isin, face_value) VALUES
('RELIANCE', 'Reliance Industries Limited', 'stock', 'NSE', 'Energy', 'Oil & Gas', 'large_cap', 'INE002A01018', 10.00),
('TCS', 'Tata Consultancy Services Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE467B01029', 1.00),
('HDFCBANK', 'HDFC Bank Limited', 'stock', 'NSE', 'Financial Services', 'Banking', 'large_cap', 'INE040A01034', 1.00),
('INFY', 'Infosys Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE009A01021', 5.00),
('WIPRO', 'Wipro Limited', 'stock', 'NSE', 'Technology', 'IT Services', 'large_cap', 'INE075A01022', 2.00),
('HDFC', 'HDFC Limited', 'stock', 'NSE', 'Financial Services', 'Housing Finance', 'large_cap', 'INE001A01028', 2.00),
('ITC', 'ITC Limited', 'stock', 'NSE', 'Consumer Goods', 'Tobacco', 'large_cap', 'INE154A01025', 1.00),
('SBIN', 'State Bank of India', 'stock', 'NSE', 'Financial Services', 'Banking', 'large_cap', 'INE062A01020', 1.00),
('NIFTYBEES', 'Nippon India ETF Nifty BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I2', 10.00),
('GOLDBEES', 'Nippon India Gold BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I3', 10.00);

-- Insert sample security prices
INSERT INTO security_prices (security_id, price_date, open_price, high_price, low_price, close_price, volume) VALUES
(1, '2024-01-15', 2450.00, 2480.00, 2440.00, 2475.50, 1500000),
(2, '2024-01-15', 3850.00, 3880.00, 3830.00, 3865.25, 800000),
(3, '2024-01-15', 1680.00, 1695.00, 1675.00, 1685.75, 1200000),
(4, '2024-01-15', 1520.00, 1535.00, 1515.00, 1528.50, 900000),
(5, '2024-01-15', 420.00, 425.00, 418.00, 422.75, 1100000),
(6, '2024-01-15', 2450.00, 2470.00, 2440.00, 2460.25, 600000),
(7, '2024-01-15', 485.00, 490.00, 482.00, 487.50, 800000),
(8, '2024-01-15', 580.00, 585.00, 578.00, 582.25, 1000000),
(9, '2024-01-15', 245.50, 246.80, 245.00, 246.25, 2000000),
(10, '2024-01-15', 58.50, 59.20, 58.30, 58.85, 1500000);

-- Insert sample banks
INSERT INTO banks (bank_name, bank_code, bank_type, website, contact_email, contact_phone, address, city, state) VALUES
('State Bank of India', 'SBI', 'public', 'https://sbi.co.in', 'support@sbi.co.in', '1800-425-3800', 'State Bank Bhavan, Madame Cama Road', 'Mumbai', 'Maharashtra'),
('HDFC Bank', 'HDFC', 'private', 'https://hdfcbank.com', 'support@hdfcbank.com', '1800-202-6161', 'HDFC Bank House, Senapati Bapat Marg', 'Mumbai', 'Maharashtra'),
('ICICI Bank', 'ICICI', 'private', 'https://icicibank.com', 'support@icicibank.com', '1800-210-0109', 'ICICI Bank Tower, Bandra Kurla Complex', 'Mumbai', 'Maharashtra'),
('Axis Bank', 'AXIS', 'private', 'https://axisbank.com', 'support@axisbank.com', '1800-419-5555', 'Axis Bank House, C-2, Wadia International Centre', 'Mumbai', 'Maharashtra');

-- Insert user bank accounts
INSERT INTO user_bank_accounts (user_id, bank_id, account_number, account_type, account_name, ifsc_code, branch_name, opened_date) VALUES
(1, 1, 'SBI1234567890', 'savings', 'John Doe SBI Account', 'SBIN0001234', 'Mumbai Main Branch', '2020-01-15'),
(1, 2, 'HDFC2345678901', 'savings', 'John Doe HDFC Account', 'HDFC0001234', 'Andheri West Branch', '2021-03-20'),
(2, 2, 'HDFC3456789012', 'savings', 'Jane Smith HDFC Account', 'HDFC0002345', 'Connaught Place Branch', '2019-06-10'),
(2, 3, 'ICICI4567890123', 'savings', 'Jane Smith ICICI Account', 'ICIC0001234', 'Gurgaon Branch', '2020-08-25'),
(3, 1, 'SBI5678901234', 'savings', 'Mike Wilson SBI Account', 'SBIN0002345', 'Bangalore Main Branch', '2021-02-14'),
(3, 4, 'AXIS6789012345', 'savings', 'Mike Wilson Axis Account', 'UTIB0001234', 'Koramangala Branch', '2022-01-30');

-- Insert sample fixed deposits
INSERT INTO fixed_deposits (user_id, account_id, fd_number, principal_amount, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, interest_payout_frequency) VALUES
(1, 1, 'SBI-FD-001', 500000.00, 7.25, 12, 536250.00, '2023-06-15', '2024-06-15', 'maturity'),
(1, 2, 'HDFC-FD-001', 300000.00, 7.50, 24, 345000.00, '2023-03-20', '2025-03-20', 'quarterly'),
(2, 3, 'HDFC-FD-002', 1000000.00, 7.75, 36, 1232500.00, '2023-01-10', '2026-01-10', 'yearly'),
(3, 5, 'SBI-FD-003', 200000.00, 7.00, 12, 214000.00, '2023-08-01', '2024-08-01', 'maturity');

-- Insert sample recurring deposits
INSERT INTO recurring_deposits (user_id, account_id, rd_number, monthly_installment, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, installment_day) VALUES
(1, 1, 'SBI-RD-001', 10000.00, 7.00, 24, 256800.00, '2023-01-15', '2025-01-15', 15),
(2, 3, 'HDFC-RD-002', 25000.00, 7.25, 36, 936750.00, '2023-02-10', '2026-02-10', 10),
(3, 5, 'SBI-RD-003', 15000.00, 6.75, 18, 279675.00, '2023-04-01', '2024-10-01', 1);

-- Insert asset categories
INSERT INTO asset_categories (category_name, category_type, description) VALUES
('Precious Metals', 'precious_metal', 'Gold, Silver, Platinum, and other precious metals'),
('Real Estate', 'real_estate', 'Residential, Commercial, and other real estate properties'),
('Commodities', 'commodity', 'Agricultural commodities, metals, and other raw materials'),
('Collectibles', 'collectible', 'Art, antiques, coins, stamps, and other collectible items'),
('Other Assets', 'other', 'Miscellaneous assets not covered in other categories');

-- Insert asset subcategories
INSERT INTO asset_subcategories (category_id, subcategory_name, description) VALUES
(1, 'Gold Jewelry', 'Gold jewelry and ornaments'),
(1, 'Gold Coins', 'Gold coins and bars'),
(1, 'Gold ETF', 'Gold Exchange Traded Funds'),
(1, 'Silver', 'Silver jewelry, coins, and bars'),
(2, 'Residential Property', 'Houses, apartments, and other residential properties'),
(2, 'Commercial Property', 'Office spaces, shops, and other commercial properties'),
(2, 'Land', 'Agricultural land, plots, and other land assets'),
(3, 'Agricultural Commodities', 'Crops, grains, and other agricultural products'),
(4, 'Art and Antiques', 'Paintings, sculptures, and antique items'),
(4, 'Coins and Stamps', 'Collectible coins and stamps');

-- Insert sample user assets
INSERT INTO user_assets (user_id, category_id, subcategory_id, asset_name, description, purchase_date, purchase_price, current_value, quantity, unit, location, storage_location) VALUES
(1, 1, 1, 'Gold Necklace Set', 'Traditional gold necklace with matching earrings', '2022-12-15', 85000.00, 92000.00, 1, 'set', 'Mumbai', 'Home Safe'),
(1, 1, 2, 'Gold Coins', 'Investment gold coins', '2023-03-10', 120000.00, 135000.00, 2, 'coins', 'Mumbai', 'Bank Locker'),
(2, 2, 5, '2BHK Apartment', 'Modern 2BHK apartment in Gurgaon', '2021-08-20', 4500000.00, 5200000.00, 1, 'unit', 'Gurgaon', 'Physical Property'),
(2, 1, 3, 'Gold ETF Units', 'Nippon India Gold BeES ETF', '2023-01-15', 100000.00, 105000.00, 1700, 'units', 'Online', 'Demat Account'),
(3, 1, 1, 'Gold Ring', 'Simple gold ring', '2023-05-20', 25000.00, 27000.00, 1, 'piece', 'Bangalore', 'Home Safe'),
(3, 2, 6, 'Small Shop', 'Commercial shop in local market', '2022-11-30', 800000.00, 850000.00, 1, 'unit', 'Bangalore', 'Physical Property');

-- Insert sample portfolio goals
INSERT INTO portfolio_goals (user_id, goal_name, goal_type, target_amount, current_amount, target_date, priority) VALUES
(1, 'Retirement Fund', 'retirement', 10000000.00, 2500000.00, '2045-12-31', 'high'),
(1, 'House Purchase', 'house_purchase', 5000000.00, 1200000.00, '2026-12-31', 'medium'),
(2, 'Child Education', 'education', 2000000.00, 500000.00, '2030-06-30', 'high'),
(2, 'Vacation Fund', 'vacation', 500000.00, 150000.00, '2024-12-31', 'low'),
(3, 'Emergency Fund', 'emergency_fund', 1000000.00, 300000.00, '2024-06-30', 'high');

-- Insert sample asset allocation targets
INSERT INTO asset_allocation_targets (user_id, asset_type, target_percentage, current_percentage, tolerance_band) VALUES
(1, 'equity', 60.00, 45.00, 5.00),
(1, 'debt', 25.00, 30.00, 5.00),
(1, 'gold', 10.00, 15.00, 3.00),
(1, 'real_estate', 5.00, 10.00, 2.00),
(2, 'equity', 70.00, 65.00, 5.00),
(2, 'debt', 20.00, 25.00, 5.00),
(2, 'gold', 5.00, 5.00, 2.00),
(2, 'real_estate', 5.00, 5.00, 2.00),
(3, 'equity', 40.00, 35.00, 5.00),
(3, 'debt', 40.00, 45.00, 5.00),
(3, 'gold', 10.00, 10.00, 3.00),
(3, 'real_estate', 10.00, 10.00, 3.00);

-- Insert sample user watchlist
INSERT INTO user_watchlist (user_id, security_id, target_price, notes) VALUES
(1, 1, 2500.00, 'Reliance - Good for long term'),
(1, 2, 4000.00, 'TCS - Strong fundamentals'),
(2, 3, 1800.00, 'HDFC Bank - Banking sector recovery'),
(2, 4, 1600.00, 'Infosys - IT sector growth'),
(3, 5, 450.00, 'Wipro - Value pick'),
(3, 6, 2500.00, 'HDFC - Housing finance leader');

-- Insert sample security holdings
INSERT INTO user_security_holdings (user_id, account_id, security_id, quantity, average_price, current_price, first_purchase_date, last_purchase_date) VALUES
(1, 1, 1, 100, 2400.00, 2475.50, '2023-02-15', '2023-11-20'),
(1, 1, 2, 50, 3800.00, 3865.25, '2023-03-10', '2023-10-15'),
(1, 2, 3, 200, 1650.00, 1685.75, '2023-04-05', '2023-12-01'),
(2, 3, 4, 150, 1500.00, 1528.50, '2023-01-20', '2023-09-25'),
(2, 3, 5, 300, 400.00, 422.75, '2023-02-28', '2023-11-10'),
(2, 4, 6, 100, 2400.00, 2460.25, '2023-03-15', '2023-10-30'),
(3, 5, 7, 200, 480.00, 487.50, '2023-05-01', '2023-12-15'),
(3, 5, 8, 150, 570.00, 582.25, '2023-06-10', '2023-11-25'),
(1, 1, 9, 1000, 240.00, 246.25, '2023-07-01', '2023-12-20'),
(2, 3, 10, 2000, 55.00, 58.85, '2023-08-15', '2023-12-10');

-- Insert sample security transactions
INSERT INTO security_transactions (user_id, account_id, security_id, transaction_type, transaction_date, quantity, price, total_amount, brokerage, taxes, other_charges, net_amount) VALUES
(1, 1, 1, 'buy', '2023-02-15', 50, 2400.00, 120000.00, 120.00, 0.00, 0.00, 120120.00),
(1, 1, 1, 'buy', '2023-11-20', 50, 2400.00, 120000.00, 120.00, 0.00, 0.00, 120120.00),
(1, 1, 2, 'buy', '2023-03-10', 50, 3800.00, 190000.00, 190.00, 0.00, 0.00, 190190.00),
(1, 2, 3, 'buy', '2023-04-05', 200, 1650.00, 330000.00, 330.00, 0.00, 0.00, 330330.00),
(2, 3, 4, 'buy', '2023-01-20', 150, 1500.00, 225000.00, 225.00, 0.00, 0.00, 225225.00),
(2, 3, 5, 'buy', '2023-02-28', 300, 400.00, 120000.00, 120.00, 0.00, 0.00, 120120.00),
(2, 4, 6, 'buy', '2023-03-15', 100, 2400.00, 240000.00, 240.00, 0.00, 0.00, 240240.00),
(3, 5, 7, 'buy', '2023-05-01', 200, 480.00, 96000.00, 96.00, 0.00, 0.00, 96096.00),
(3, 5, 8, 'buy', '2023-06-10', 150, 570.00, 85500.00, 85.50, 0.00, 0.00, 85585.50),
(1, 1, 9, 'buy', '2023-07-01', 1000, 240.00, 240000.00, 240.00, 0.00, 0.00, 240240.00),
(2, 3, 10, 'buy', '2023-08-15', 2000, 55.00, 110000.00, 110.00, 0.00, 0.00, 110110.00);

-- Insert sample asset transactions
INSERT INTO asset_transactions (user_id, asset_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount, transaction_fees, net_amount, counterparty, notes) VALUES
(1, 1, 'purchase', '2022-12-15', 1, 85000.00, 85000.00, 0.00, 85000.00, 'Tanishq Store', 'Gold necklace set purchase'),
(1, 2, 'purchase', '2023-03-10', 2, 60000.00, 120000.00, 0.00, 120000.00, 'Bank of India', 'Gold coins investment'),
(2, 3, 'purchase', '2021-08-20', 1, 4500000.00, 4500000.00, 45000.00, 4545000.00, 'DLF Limited', 'Apartment purchase in Gurgaon'),
(2, 4, 'purchase', '2023-01-15', 1700, 58.82, 100000.00, 100.00, 100100.00, 'Zerodha', 'Gold ETF purchase'),
(3, 5, 'purchase', '2023-05-20', 1, 25000.00, 25000.00, 0.00, 25000.00, 'Local Jeweler', 'Gold ring purchase'),
(3, 6, 'purchase', '2022-11-30', 1, 800000.00, 800000.00, 8000.00, 808000.00, 'Property Dealer', 'Commercial shop purchase');

-- Insert sample RD installments
INSERT INTO rd_installments (rd_id, installment_number, due_date, installment_amount, paid_amount, paid_date, payment_status) VALUES
(1, 1, '2023-02-15', 10000.00, 10000.00, '2023-02-15', 'paid'),
(1, 2, '2023-03-15', 10000.00, 10000.00, '2023-03-15', 'paid'),
(1, 3, '2023-04-15', 10000.00, 10000.00, '2023-04-15', 'paid'),
(1, 4, '2023-05-15', 10000.00, 10000.00, '2023-05-15', 'paid'),
(1, 5, '2023-06-15', 10000.00, 10000.00, '2023-06-15', 'paid'),
(1, 6, '2023-07-15', 10000.00, 10000.00, '2023-07-15', 'paid'),
(1, 7, '2023-08-15', 10000.00, 10000.00, '2023-08-15', 'paid'),
(1, 8, '2023-09-15', 10000.00, 10000.00, '2023-09-15', 'paid'),
(1, 9, '2023-10-15', 10000.00, 10000.00, '2023-10-15', 'paid'),
(1, 10, '2023-11-15', 10000.00, 10000.00, '2023-11-15', 'paid'),
(1, 11, '2023-12-15', 10000.00, 10000.00, '2023-12-15', 'paid'),
(1, 12, '2024-01-15', 10000.00, 0.00, NULL, 'pending'),
(2, 1, '2023-03-10', 25000.00, 25000.00, '2023-03-10', 'paid'),
(2, 2, '2023-04-10', 25000.00, 25000.00, '2023-04-10', 'paid'),
(2, 3, '2023-05-10', 25000.00, 25000.00, '2023-05-10', 'paid'),
(2, 4, '2023-06-10', 25000.00, 25000.00, '2023-06-10', 'paid'),
(2, 5, '2023-07-10', 25000.00, 25000.00, '2023-07-10', 'paid'),
(2, 6, '2023-08-10', 25000.00, 25000.00, '2023-08-10', 'paid'),
(2, 7, '2023-09-10', 25000.00, 25000.00, '2023-09-10', 'paid'),
(2, 8, '2023-10-10', 25000.00, 25000.00, '2023-10-10', 'paid'),
(2, 9, '2023-11-10', 25000.00, 25000.00, '2023-11-10', 'paid'),
(2, 10, '2023-12-10', 25000.00, 25000.00, '2023-12-10', 'paid'),
(2, 11, '2024-01-10', 25000.00, 0.00, NULL, 'pending'),
(3, 1, '2023-05-01', 15000.00, 15000.00, '2023-05-01', 'paid'),
(3, 2, '2023-06-01', 15000.00, 15000.00, '2023-06-01', 'paid'),
(3, 3, '2023-07-01', 15000.00, 15000.00, '2023-07-01', 'paid'),
(3, 4, '2023-08-01', 15000.00, 15000.00, '2023-08-01', 'paid'),
(3, 5, '2023-09-01', 15000.00, 15000.00, '2023-09-01', 'paid'),
(3, 6, '2023-10-01', 15000.00, 15000.00, '2023-10-01', 'paid'),
(3, 7, '2023-11-01', 15000.00, 15000.00, '2023-11-01', 'paid'),
(3, 8, '2023-12-01', 15000.00, 15000.00, '2023-12-01', 'paid'),
(3, 9, '2024-01-01', 15000.00, 0.00, NULL, 'pending');

-- Insert sample FD interest payments
INSERT INTO fd_interest_payments (fd_id, payment_date, interest_amount, cumulative_interest, payment_status, credited_date) VALUES
(1, '2024-06-15', 36250.00, 36250.00, 'pending', NULL),
(2, '2023-06-20', 5625.00, 5625.00, 'credited', '2023-06-20'),
(2, '2023-09-20', 5625.00, 11250.00, 'credited', '2023-09-20'),
(2, '2023-12-20', 5625.00, 16875.00, 'credited', '2023-12-20'),
(2, '2024-03-20', 5625.00, 22500.00, 'pending', NULL),
(3, '2024-01-10', 77500.00, 77500.00, 'credited', '2024-01-10'),
(3, '2025-01-10', 77500.00, 155000.00, 'pending', NULL),
(4, '2024-08-01', 14000.00, 14000.00, 'pending', NULL);