-- =====================================================
-- Dummy Transactions Data
-- =====================================================
-- This file contains all transaction data including securities,
-- assets, and portfolio transactions to help understand transaction patterns

-- =====================================================
-- 1. SECURITY TRANSACTIONS
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

-- =====================================================
-- 2. ASSET TRANSACTIONS
-- =====================================================

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
-- 3. PORTFOLIO TRANSACTIONS LOG
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
-- 4. SUMMARY
-- =====================================================

-- Display summary of transactions created
DO $$
DECLARE
    security_transaction_count INTEGER;
    asset_transaction_count INTEGER;
    portfolio_log_count INTEGER;
    total_transaction_value NUMERIC;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO security_transaction_count FROM security_transactions;
    SELECT COUNT(*) INTO asset_transaction_count FROM asset_transactions;
    SELECT COUNT(*) INTO portfolio_log_count FROM portfolio_transactions_log;
    
    -- Calculate total transaction value
    SELECT COALESCE(SUM(total_amount), 0) INTO total_transaction_value FROM security_transactions
    UNION ALL
    SELECT COALESCE(SUM(total_amount), 0) FROM asset_transactions;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY TRANSACTIONS CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Security Transactions: %', security_transaction_count;
    RAISE NOTICE 'Asset Transactions: %', asset_transaction_count;
    RAISE NOTICE 'Portfolio Log Entries: %', portfolio_log_count;
    RAISE NOTICE 'Total Transaction Value: ₹%', TO_CHAR(total_transaction_value, 'FM999,999,999,999.00');
    RAISE NOTICE '==========================================';
END $$;