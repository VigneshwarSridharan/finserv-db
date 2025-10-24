-- =====================================================
-- Dummy Assets Data
-- =====================================================
-- This file contains additional physical assets and valuations
-- to help understand asset management and tracking

-- =====================================================
-- 1. ADDITIONAL USER ASSETS
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

-- =====================================================
-- 2. REAL ESTATE DETAILS
-- =====================================================

-- Real estate details for new properties
INSERT INTO real_estate_details (asset_id, property_type, property_address, city, state, area_sqft, built_up_area_sqft, year_built, bedrooms, bathrooms, parking_spaces, rental_income, rental_yield, occupancy_status, property_tax, maintenance_charges) VALUES
(13, 'apartment', 'Whitefield Tech Park, Bangalore', 'Bangalore', 'Karnataka', 1200, 1000, 2022, 2, 2, 1, 25000.00, 5.77, 'rented', 12000.00, 3000.00),
(15, 'office', 'BKC Commercial Complex, Mumbai', 'Mumbai', 'Maharashtra', 800, 700, 2021, 0, 2, 2, 45000.00, 15.00, 'rented', 15000.00, 5000.00),
(18, 'apartment', 'Dwarka Sector 12, Delhi', 'Delhi', 'Delhi', 800, 650, 2023, 1, 1, 1, 18000.00, 7.85, 'rented', 8000.00, 2000.00),
(20, 'shop', 'Cyber City Mall, Gurgaon', 'Gurgaon', 'Haryana', 400, 350, 2022, 0, 1, 0, 25000.00, 16.67, 'rented', 6000.00, 1500.00),
(22, 'villa', 'Satellite Area, Ahmedabad', 'Ahmedabad', 'Gujarat', 2500, 2000, 2021, 3, 3, 2, 60000.00, 9.60, 'rented', 25000.00, 8000.00);

-- =====================================================
-- 3. GOLD DETAILS
-- =====================================================

-- Gold details for new gold assets
INSERT INTO gold_details (asset_id, gold_type, purity, weight_grams, making_charges, wastage_charges, jeweler_name, current_gold_rate_per_gram, purchase_gold_rate_per_gram) VALUES
(11, 'jewelry', '22K', 45.5, 15.00, 2.00, 'Tanishq', 5500.00, 5200.00),
(12, 'coins', '24K', 60.0, 0.00, 0.00, 'Bank of India', 5800.00, 5500.00),
(14, 'jewelry', '18K', 25.0, 12.00, 1.50, 'Kalyan Jewellers', 4800.00, 4500.00),
(19, 'jewelry', '22K', 35.0, 18.00, 2.50, 'Malabar Gold', 5500.00, 5200.00),
(21, 'bars', '24K', 50.0, 0.00, 0.00, 'HDFC Bank', 5800.00, 5500.00);

-- =====================================================
-- 4. ASSET VALUATIONS
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
-- 5. ASSET PRICE INDICES
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
-- 6. SUMMARY
-- =====================================================

-- Display summary of assets created
DO $$
DECLARE
    asset_count INTEGER;
    real_estate_count INTEGER;
    gold_count INTEGER;
    valuation_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO asset_count FROM user_assets;
    SELECT COUNT(*) INTO real_estate_count FROM real_estate_details;
    SELECT COUNT(*) INTO gold_count FROM gold_details;
    SELECT COUNT(*) INTO valuation_count FROM asset_valuations;
    SELECT COUNT(*) INTO index_count FROM asset_price_indices;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY ASSETS CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total Assets: %', asset_count;
    RAISE NOTICE 'Real Estate Details: %', real_estate_count;
    RAISE NOTICE 'Gold Details: %', gold_count;
    RAISE NOTICE 'Asset Valuations: %', valuation_count;
    RAISE NOTICE 'Price Indices: %', index_count;
    RAISE NOTICE '==========================================';
END $$;