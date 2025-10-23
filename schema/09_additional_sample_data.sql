-- =====================================================
-- Additional Sample Data for Portfolio Management Database
-- =====================================================

-- Additional users for more comprehensive testing
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth) VALUES
('alice_johnson', 'alice.johnson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Alice', 'Johnson', '+91-9876543213', '1992-09-12'),
('bob_brown', 'bob.brown@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Bob', 'Brown', '+91-9876543214', '1987-04-25'),
('sarah_davis', 'sarah.davis@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Qz8K2', 'Sarah', 'Davis', '+91-9876543215', '1995-11-18');

-- Additional user profiles
INSERT INTO user_profiles (user_id, address, city, state, country, postal_code, pan_number, aadhar_number, occupation, annual_income, risk_profile) VALUES
(4, '321 Garden Street, Villa 7', 'Pune', 'Maharashtra', 'India', '411001', 'QRSTU5678V', '456789012345', 'Data Scientist', 1500000.00, 'aggressive'),
(5, '654 Lake View, Apartment 12A', 'Chennai', 'Tamil Nadu', 'India', '600001', 'WXYZ1234A', '567890123456', 'Marketing Manager', 900000.00, 'moderate'),
(6, '987 Hill Station, House 25', 'Hyderabad', 'Telangana', 'India', '500001', 'BCDEF5678G', '678901234567', 'Graphic Designer', 600000.00, 'conservative');

-- Additional user preferences
INSERT INTO user_preferences (user_id, currency, timezone, notification_email, notification_sms, notification_push, portfolio_view) VALUES
(4, 'INR', 'Asia/Kolkata', TRUE, TRUE, TRUE, 'broker_wise'),
(5, 'INR', 'Asia/Kolkata', TRUE, FALSE, TRUE, 'consolidated'),
(6, 'INR', 'Asia/Kolkata', FALSE, FALSE, TRUE, 'asset_wise');

-- Additional brokers
INSERT INTO brokers (broker_name, broker_code, broker_type, website, contact_email, contact_phone, address, city, state) VALUES
('Kotak Securities', 'KOTAK', 'full_service', 'https://kotaksecurities.com', 'support@kotaksecurities.com', '1800-419-6600', 'Kotak Mahindra Bank Tower, BKC', 'Mumbai', 'Maharashtra'),
('Sharekhan', 'SHAREKHAN', 'full_service', 'https://sharekhan.com', 'support@sharekhan.com', '1800-22-7500', 'Sharekhan House, Mahalaxmi', 'Mumbai', 'Maharashtra'),
('5Paisa', '5PAISA', 'discount', 'https://5paisa.com', 'support@5paisa.com', '022-3000-5000', '5Paisa Capital Limited, Andheri', 'Mumbai', 'Maharashtra'),
('Upstox', 'UPSTOX', 'discount', 'https://upstox.com', 'support@upstox.com', '022-4179-2990', 'Upstox House, Andheri East', 'Mumbai', 'Maharashtra');

-- Additional user broker accounts
INSERT INTO user_broker_accounts (user_id, broker_id, account_number, account_type, account_name, opened_date) VALUES
(4, 5, 'KOT123456', 'equity', 'Alice Johnson Kotak Account', '2023-05-10'),
(4, 6, 'SHK234567', 'equity', 'Alice Johnson Sharekhan Account', '2023-06-15'),
(5, 7, '5PA345678', 'equity', 'Bob Brown 5Paisa Account', '2023-04-20'),
(6, 8, 'UPS456789', 'equity', 'Sarah Davis Upstox Account', '2023-07-01');

-- Additional securities
INSERT INTO securities (symbol, name, security_type, exchange, sector, industry, market_cap_category, isin, face_value) VALUES
('BHARTIARTL', 'Bharti Airtel Limited', 'stock', 'NSE', 'Telecommunications', 'Telecom Services', 'large_cap', 'INE397D01024', 5.00),
('MARUTI', 'Maruti Suzuki India Limited', 'stock', 'NSE', 'Automobile', 'Passenger Cars', 'large_cap', 'INE585B01010', 5.00),
('ASIANPAINT', 'Asian Paints Limited', 'stock', 'NSE', 'Consumer Goods', 'Paints', 'large_cap', 'INE021A01026', 1.00),
('NESTLEIND', 'Nestle India Limited', 'stock', 'NSE', 'Consumer Goods', 'Food Products', 'large_cap', 'INE239A01016', 10.00),
('ULTRACEMCO', 'UltraTech Cement Limited', 'stock', 'NSE', 'Materials', 'Cement', 'large_cap', 'INE481G01011', 10.00),
('TITAN', 'Titan Company Limited', 'stock', 'NSE', 'Consumer Goods', 'Jewelry', 'large_cap', 'INE280A01028', 1.00),
('BAJFINANCE', 'Bajaj Finance Limited', 'stock', 'NSE', 'Financial Services', 'NBFC', 'large_cap', 'INE296A01024', 2.00),
('HINDUNILVR', 'Hindustan Unilever Limited', 'stock', 'NSE', 'Consumer Goods', 'FMCG', 'large_cap', 'INE030A01027', 1.00),
('SENSEXBEES', 'Nippon India ETF Sensex BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I4', 10.00),
('BANKBEES', 'Nippon India ETF Bank BeES', 'etf', 'NSE', 'Financial Services', 'ETF', 'large_cap', 'INF204KB17I5', 10.00);

-- Additional security prices
INSERT INTO security_prices (security_id, price_date, open_price, high_price, low_price, close_price, volume) VALUES
(11, '2024-01-15', 1020.00, 1035.00, 1015.00, 1028.75, 2500000),
(12, '2024-01-15', 10850.00, 10980.00, 10820.00, 10925.50, 1800000),
(13, '2024-01-15', 3150.00, 3180.00, 3140.00, 3165.25, 1200000),
(14, '2024-01-15', 18500.00, 18650.00, 18420.00, 18575.00, 800000),
(15, '2024-01-15', 8250.00, 8320.00, 8200.00, 8285.75, 1500000),
(16, '2024-01-15', 3250.00, 3280.00, 3230.00, 3265.50, 1100000),
(17, '2024-01-15', 6850.00, 6920.00, 6820.00, 6885.25, 1300000),
(18, '2024-01-15', 2450.00, 2480.00, 2430.00, 2465.75, 2000000),
(19, '2024-01-15', 720.50, 725.80, 718.00, 722.25, 1500000),
(20, '2024-01-15', 485.50, 490.20, 483.00, 487.85, 1200000);

-- Additional banks
INSERT INTO banks (bank_name, bank_code, bank_type, website, contact_email, contact_phone, address, city, state) VALUES
('Kotak Mahindra Bank', 'KOTAK', 'private', 'https://kotak.com', 'support@kotak.com', '1800-419-6600', 'Kotak Mahindra Bank Tower, BKC', 'Mumbai', 'Maharashtra'),
('Punjab National Bank', 'PNB', 'public', 'https://pnb.co.in', 'support@pnb.co.in', '1800-180-2222', '7, Bhikaji Cama Place', 'New Delhi', 'Delhi'),
('Canara Bank', 'CANARA', 'public', 'https://canarabank.com', 'support@canarabank.com', '1800-425-0018', '112, J C Road', 'Bangalore', 'Karnataka');

-- Additional user bank accounts
-- Bank IDs: 1=SBI, 2=HDFC, 3=ICICI, 4=Axis, 5=Kotak, 6=PNB, 7=Canara
INSERT INTO user_bank_accounts (user_id, bank_id, account_number, account_type, account_name, ifsc_code, branch_name, opened_date) VALUES
(4, 5, 'KOT7890123456', 'savings', 'Alice Johnson Kotak Account', 'KKBK0001234', 'Pune Main Branch', '2021-02-15'),
(4, 4, 'AXIS8901234567', 'savings', 'Alice Johnson Axis Account', 'UTIB0001234', 'Pune Camp Branch', '2022-03-20'),
(5, 6, 'PNB9012345678', 'savings', 'Bob Brown PNB Account', 'PUNB0001234', 'Chennai Central Branch', '2020-08-10'),
(6, 7, 'CAN0123456789', 'savings', 'Sarah Davis Canara Account', 'CNRB0001234', 'Hyderabad Main Branch', '2021-11-25');

-- Additional fixed deposits
INSERT INTO fixed_deposits (user_id, account_id, fd_number, principal_amount, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, interest_payout_frequency) VALUES
(4, 7, 'KOT-FD-001', 750000.00, 7.50, 18, 831250.00, '2023-08-15', '2025-02-15', 'quarterly'),
(4, 8, 'AXIS-FD-002', 400000.00, 7.25, 24, 458000.00, '2023-05-20', '2025-05-20', 'half_yearly'),
(5, 9, 'PNB-FD-003', 300000.00, 7.00, 12, 321000.00, '2023-09-01', '2024-09-01', 'maturity'),
(6, 10, 'CAN-FD-004', 250000.00, 6.75, 36, 300625.00, '2023-03-15', '2026-03-15', 'yearly');

-- Additional recurring deposits
INSERT INTO recurring_deposits (user_id, account_id, rd_number, monthly_installment, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, installment_day) VALUES
(4, 7, 'KOT-RD-001', 20000.00, 7.25, 30, 720000.00, '2023-02-15', '2025-08-15', 15),
(5, 9, 'PNB-RD-002', 12000.00, 6.50, 24, 312000.00, '2023-04-10', '2025-04-10', 10),
(6, 10, 'CAN-RD-003', 8000.00, 6.25, 18, 150000.00, '2023-06-01', '2024-12-01', 1);

-- Additional user assets
INSERT INTO user_assets (user_id, category_id, subcategory_id, asset_name, description, purchase_date, purchase_price, current_value, quantity, unit, location, storage_location) VALUES
(4, 1, 1, 'Gold Chain Set', 'Heavy gold chain with pendant', '2023-01-20', 95000.00, 105000.00, 1, 'set', 'Pune', 'Bank Locker'),
(4, 2, 5, '3BHK Apartment', 'Luxury 3BHK apartment in Koregaon Park', '2022-05-15', 6500000.00, 7200000.00, 1, 'unit', 'Pune', 'Physical Property'),
(5, 1, 2, 'Gold Bars', 'Investment gold bars', '2023-02-28', 200000.00, 215000.00, 4, 'bars', 'Chennai', 'Bank Locker'),
(5, 2, 6, 'Office Space', 'Commercial office space in T Nagar', '2021-12-10', 2000000.00, 2200000.00, 1, 'unit', 'Chennai', 'Physical Property'),
(6, 1, 1, 'Gold Earrings', 'Traditional gold earrings', '2023-03-15', 35000.00, 38000.00, 1, 'pair', 'Hyderabad', 'Home Safe'),
(6, 4, 9, 'Art Collection', 'Contemporary Indian art pieces', '2022-08-20', 150000.00, 180000.00, 3, 'pieces', 'Hyderabad', 'Home Display');

-- Additional portfolio goals
INSERT INTO portfolio_goals (user_id, goal_name, goal_type, target_amount, current_amount, target_date, priority) VALUES
(4, 'Dream House', 'house_purchase', 8000000.00, 2000000.00, '2027-12-31', 'high'),
(4, 'World Tour', 'vacation', 1000000.00, 250000.00, '2025-06-30', 'medium'),
(5, 'Child Marriage', 'marriage', 3000000.00, 800000.00, '2030-12-31', 'high'),
(5, 'Car Purchase', 'other', 800000.00, 200000.00, '2024-12-31', 'medium'),
(6, 'Art Studio', 'other', 500000.00, 100000.00, '2025-12-31', 'medium'),
(6, 'Emergency Fund', 'emergency_fund', 500000.00, 150000.00, '2024-12-31', 'high');

-- Additional asset allocation targets
INSERT INTO asset_allocation_targets (user_id, asset_type, target_percentage, current_percentage, tolerance_band) VALUES
(4, 'equity', 50.00, 40.00, 5.00),
(4, 'debt', 30.00, 35.00, 5.00),
(4, 'gold', 15.00, 20.00, 3.00),
(4, 'real_estate', 5.00, 5.00, 2.00),
(5, 'equity', 45.00, 50.00, 5.00),
(5, 'debt', 35.00, 30.00, 5.00),
(5, 'gold', 10.00, 10.00, 3.00),
(5, 'real_estate', 10.00, 10.00, 3.00),
(6, 'equity', 30.00, 25.00, 5.00),
(6, 'debt', 50.00, 55.00, 5.00),
(6, 'gold', 10.00, 10.00, 3.00),
(6, 'real_estate', 10.00, 10.00, 3.00);

-- Additional user watchlist
INSERT INTO user_watchlist (user_id, security_id, target_price, notes) VALUES
(4, 11, 1100.00, 'Bharti Airtel - Telecom recovery play'),
(4, 12, 12000.00, 'Maruti - Auto sector growth'),
(5, 13, 3500.00, 'Asian Paints - Consumer goods leader'),
(5, 14, 20000.00, 'Nestle - FMCG defensive play'),
(6, 15, 9000.00, 'UltraTech - Infrastructure play'),
(6, 16, 3500.00, 'Titan - Jewelry sector leader');

-- Additional security holdings
-- Broker account IDs: user 4 has accounts 6,7; user 5 has account 8; user 6 has account 9
INSERT INTO user_security_holdings (user_id, account_id, security_id, quantity, average_price, current_price, first_purchase_date, last_purchase_date) VALUES
(4, 7, 11, 200, 980.00, 1028.75, '2023-06-15', '2023-12-10'),
(4, 7, 12, 50, 10500.00, 10925.50, '2023-07-20', '2023-11-25'),
(4, 6, 13, 100, 3000.00, 3165.25, '2023-08-05', '2023-12-15'),
(5, 8, 14, 25, 18000.00, 18575.00, '2023-05-10', '2023-10-20'),
(5, 8, 15, 150, 8000.00, 8285.75, '2023-06-25', '2023-11-30'),
(6, 9, 16, 100, 3100.00, 3265.50, '2023-07-15', '2023-12-05'),
(6, 9, 17, 75, 6500.00, 6885.25, '2023-08-20', '2023-12-20'),
(4, 7, 19, 2000, 700.00, 722.25, '2023-09-01', '2023-12-18'),
(5, 8, 20, 3000, 470.00, 487.85, '2023-10-10', '2023-12-12');

-- Additional security transactions
INSERT INTO security_transactions (user_id, account_id, security_id, transaction_type, transaction_date, quantity, price, total_amount, brokerage, taxes, other_charges, net_amount) VALUES
(4, 7, 11, 'buy', '2023-06-15', 100, 980.00, 98000.00, 98.00, 0.00, 0.00, 98098.00),
(4, 7, 11, 'buy', '2023-12-10', 100, 1000.00, 100000.00, 100.00, 0.00, 0.00, 100100.00),
(4, 7, 12, 'buy', '2023-07-20', 50, 10500.00, 525000.00, 525.00, 0.00, 0.00, 525525.00),
(4, 6, 13, 'buy', '2023-08-05', 100, 3000.00, 300000.00, 300.00, 0.00, 0.00, 300300.00),
(5, 8, 14, 'buy', '2023-05-10', 25, 18000.00, 450000.00, 450.00, 0.00, 0.00, 450450.00),
(5, 8, 15, 'buy', '2023-06-25', 150, 8000.00, 1200000.00, 1200.00, 0.00, 0.00, 1201200.00),
(6, 9, 16, 'buy', '2023-07-15', 100, 3100.00, 310000.00, 310.00, 0.00, 0.00, 310310.00),
(6, 9, 17, 'buy', '2023-08-20', 75, 6500.00, 487500.00, 487.50, 0.00, 0.00, 487987.50),
(4, 7, 19, 'buy', '2023-09-01', 2000, 700.00, 1400000.00, 1400.00, 0.00, 0.00, 1401400.00),
(5, 8, 20, 'buy', '2023-10-10', 3000, 470.00, 1410000.00, 1410.00, 0.00, 0.00, 1411410.00);

-- Additional asset transactions
INSERT INTO asset_transactions (user_id, asset_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount, transaction_fees, net_amount, counterparty, notes) VALUES
(4, 7, 'purchase', '2023-01-20', 1, 95000.00, 95000.00, 0.00, 95000.00, 'Tanishq Store', 'Gold chain set purchase'),
(4, 8, 'purchase', '2022-05-15', 1, 6500000.00, 6500000.00, 65000.00, 6565000.00, 'Pune Builders', 'Apartment purchase in Koregaon Park'),
(5, 9, 'purchase', '2023-02-28', 4, 50000.00, 200000.00, 0.00, 200000.00, 'Bank of India', 'Gold bars investment'),
(5, 10, 'purchase', '2021-12-10', 1, 2000000.00, 2000000.00, 20000.00, 2020000.00, 'Commercial Real Estate', 'Office space purchase'),
(6, 11, 'purchase', '2023-03-15', 1, 35000.00, 35000.00, 0.00, 35000.00, 'Local Jeweler', 'Gold earrings purchase'),
(6, 12, 'purchase', '2022-08-20', 3, 50000.00, 150000.00, 0.00, 150000.00, 'Art Gallery', 'Art collection purchase');

-- Additional RD installments
INSERT INTO rd_installments (rd_id, installment_number, due_date, installment_amount, paid_amount, paid_date, payment_status) VALUES
(4, 1, '2023-03-15', 20000.00, 20000.00, '2023-03-15', 'paid'),
(4, 2, '2023-04-15', 20000.00, 20000.00, '2023-04-15', 'paid'),
(4, 3, '2023-05-15', 20000.00, 20000.00, '2023-05-15', 'paid'),
(4, 4, '2023-06-15', 20000.00, 20000.00, '2023-06-15', 'paid'),
(4, 5, '2023-07-15', 20000.00, 20000.00, '2023-07-15', 'paid'),
(4, 6, '2023-08-15', 20000.00, 20000.00, '2023-08-15', 'paid'),
(4, 7, '2023-09-15', 20000.00, 20000.00, '2023-09-15', 'paid'),
(4, 8, '2023-10-15', 20000.00, 20000.00, '2023-10-15', 'paid'),
(4, 9, '2023-11-15', 20000.00, 20000.00, '2023-11-15', 'paid'),
(4, 10, '2023-12-15', 20000.00, 20000.00, '2023-12-15', 'paid'),
(4, 11, '2024-01-15', 20000.00, 0.00, NULL, 'pending'),
(5, 5, '2023-05-10', 12000.00, 12000.00, '2023-05-10', 'paid'),
(5, 6, '2023-06-10', 12000.00, 12000.00, '2023-06-10', 'paid'),
(5, 7, '2023-07-10', 12000.00, 12000.00, '2023-07-10', 'paid'),
(5, 8, '2023-08-10', 12000.00, 12000.00, '2023-08-10', 'paid'),
(5, 9, '2023-09-10', 12000.00, 12000.00, '2023-09-10', 'paid'),
(5, 10, '2023-10-10', 12000.00, 12000.00, '2023-10-10', 'paid'),
(5, 11, '2023-11-10', 12000.00, 12000.00, '2023-11-10', 'paid'),
(5, 12, '2023-12-10', 12000.00, 12000.00, '2023-12-10', 'paid'),
(5, 13, '2024-01-10', 12000.00, 0.00, NULL, 'pending'),
(6, 4, '2023-07-01', 8000.00, 8000.00, '2023-07-01', 'paid'),
(6, 5, '2023-08-01', 8000.00, 8000.00, '2023-08-01', 'paid'),
(6, 6, '2023-09-01', 8000.00, 8000.00, '2023-09-01', 'paid'),
(6, 7, '2023-10-01', 8000.00, 8000.00, '2023-10-01', 'paid'),
(6, 8, '2023-11-01', 8000.00, 8000.00, '2023-11-01', 'paid'),
(6, 9, '2023-12-01', 8000.00, 8000.00, '2023-12-01', 'paid'),
(6, 10, '2024-01-01', 8000.00, 0.00, NULL, 'pending');

-- Additional FD interest payments
INSERT INTO fd_interest_payments (fd_id, payment_date, interest_amount, cumulative_interest, payment_status, credited_date) VALUES
(5, '2023-11-15', 9375.00, 9375.00, 'credited', '2023-11-15'),
(5, '2024-02-15', 9375.00, 18750.00, 'pending', NULL),
(6, '2023-11-20', 7250.00, 7250.00, 'credited', '2023-11-20'),
(6, '2024-05-20', 7250.00, 14500.00, 'pending', NULL),
(7, '2024-09-01', 21000.00, 21000.00, 'pending', NULL),
(8, '2024-03-15', 16875.00, 16875.00, 'pending', NULL);

-- Additional portfolio performance data
INSERT INTO portfolio_performance (user_id, performance_date, total_portfolio_value, total_investment, total_pnl, total_return_percentage, day_change, day_change_percentage) VALUES
(1, '2024-01-01', 3500000.00, 3200000.00, 300000.00, 9.38, 15000.00, 0.43),
(1, '2024-01-02', 3515000.00, 3200000.00, 315000.00, 9.84, 15000.00, 0.43),
(1, '2024-01-03', 3480000.00, 3200000.00, 280000.00, 8.75, -35000.00, -1.00),
(2, '2024-01-01', 5500000.00, 5000000.00, 500000.00, 10.00, 25000.00, 0.46),
(2, '2024-01-02', 5525000.00, 5000000.00, 525000.00, 10.50, 25000.00, 0.45),
(2, '2024-01-03', 5490000.00, 5000000.00, 490000.00, 9.80, -35000.00, -0.63),
(3, '2024-01-01', 1800000.00, 1700000.00, 100000.00, 5.88, 8000.00, 0.45),
(3, '2024-01-02', 1808000.00, 1700000.00, 108000.00, 6.35, 8000.00, 0.44),
(3, '2024-01-03', 1792000.00, 1700000.00, 92000.00, 5.41, -16000.00, -0.88);

-- Additional portfolio alerts
INSERT INTO portfolio_alerts (user_id, alert_type, alert_name, alert_condition, alert_threshold, is_active) VALUES
(1, 'price_alert', 'Reliance Target Price', 'RELIANCE close_price >= 2500', 2500.00, TRUE),
(1, 'maturity_alert', 'FD Maturity Alert', 'fixed_deposits.maturity_date <= CURRENT_DATE + INTERVAL ''30 days''', NULL, TRUE),
(2, 'price_alert', 'TCS Target Price', 'TCS close_price >= 4000', 4000.00, TRUE),
(2, 'allocation_alert', 'Equity Allocation Alert', 'equity_percentage > 75', 75.00, TRUE),
(3, 'goal_alert', 'Emergency Fund Goal', 'emergency_fund_progress >= 80', 80.00, TRUE),
(4, 'price_alert', 'Bharti Airtel Target', 'BHARTIARTL close_price >= 1100', 1100.00, TRUE),
(5, 'performance_alert', 'Portfolio Loss Alert', 'daily_return_percentage < -5', -5.00, TRUE);

-- Additional asset valuations
INSERT INTO asset_valuations (asset_id, valuation_date, valuation_amount, valuation_method, valuation_source, notes) VALUES
(1, '2023-12-01', 90000.00, 'market_price', 'Gold Rate Today', 'Gold price based on current market rate'),
(1, '2024-01-01', 92000.00, 'market_price', 'Gold Rate Today', 'Updated gold valuation'),
(2, '2023-12-01', 130000.00, 'market_price', 'Bank Gold Rate', 'Gold coins valued at current bank rate'),
(2, '2024-01-01', 135000.00, 'market_price', 'Bank Gold Rate', 'Updated gold coins valuation'),
(3, '2023-12-01', 5000000.00, 'appraisal', 'Real Estate Appraiser', 'Annual property appraisal'),
(3, '2024-01-01', 5200000.00, 'appraisal', 'Real Estate Appraiser', 'Updated property valuation'),
(4, '2023-12-01', 100000.00, 'market_price', 'ETF NAV', 'Gold ETF valued at current NAV'),
(4, '2024-01-01', 105000.00, 'market_price', 'ETF NAV', 'Updated ETF valuation'),
(5, '2023-12-01', 26000.00, 'market_price', 'Gold Rate Today', 'Gold ring valued at current rate'),
(5, '2024-01-01', 27000.00, 'market_price', 'Gold Rate Today', 'Updated gold ring valuation'),
(6, '2023-12-01', 800000.00, 'appraisal', 'Commercial Appraiser', 'Commercial property appraisal'),
(6, '2024-01-01', 850000.00, 'appraisal', 'Commercial Appraiser', 'Updated commercial property valuation');

-- Additional asset price indices
INSERT INTO asset_price_indices (category_id, subcategory_id, index_name, index_date, index_value, base_date, base_value, source) VALUES
(1, 1, 'Gold Jewelry Index', '2024-01-15', 125.50, '2023-01-01', 100.00, 'MCX Gold'),
(1, 2, 'Gold Coins Index', '2024-01-15', 128.25, '2023-01-01', 100.00, 'MCX Gold'),
(1, 3, 'Gold ETF Index', '2024-01-15', 127.00, '2023-01-01', 100.00, 'NSE Gold ETF'),
(2, 5, 'Residential Property Index', '2024-01-15', 115.75, '2023-01-01', 100.00, 'Real Estate Index'),
(2, 6, 'Commercial Property Index', '2024-01-15', 112.50, '2023-01-01', 100.00, 'Commercial Real Estate Index'),
(4, 9, 'Art Index', '2024-01-15', 120.00, '2023-01-01', 100.00, 'Art Market Index');