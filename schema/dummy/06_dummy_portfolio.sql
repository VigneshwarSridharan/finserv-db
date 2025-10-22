-- =====================================================
-- Dummy Portfolio Data
-- =====================================================
-- This file contains portfolio goals, allocation, and performance data
-- to help understand portfolio management features

-- =====================================================
-- 1. PORTFOLIO GOALS
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
-- 2. ASSET ALLOCATION TARGETS
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
-- 3. WATCHLIST
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
-- 4. PORTFOLIO PERFORMANCE
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
-- 5. PORTFOLIO ALERTS
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
-- 6. PORTFOLIO REPORTS
-- =====================================================

-- Portfolio reports for new users
INSERT INTO portfolio_reports (user_id, report_name, report_type, report_date, report_data, generated_by) VALUES
(7, 'Monthly Portfolio Summary - December 2023', 'monthly_summary', '2023-12-31', '{"total_value": 8500000, "total_investment": 7500000, "total_return": 1000000, "return_percentage": 13.33, "top_performers": ["INFY", "TCS"], "worst_performers": ["Gold ETF"], "asset_allocation": {"equity": 55, "debt": 30, "gold": 12, "real_estate": 3}}', 'system'),
(8, 'Quarterly Performance Report - Q4 2023', 'quarterly_performance', '2023-12-31', '{"quarter": "Q4 2023", "total_value": 12000000, "quarterly_return": 2000000, "quarterly_return_percentage": 20.00, "monthly_returns": [5.5, 7.2, 6.8], "sector_performance": {"technology": 15.5, "banking": 12.3, "consumer_goods": 8.7}}', 'system'),
(9, 'Annual Portfolio Review - 2023', 'annual_review', '2023-12-31', '{"year": 2023, "total_value": 4500000, "annual_return": 500000, "annual_return_percentage": 12.50, "goal_progress": {"child_education": 33.33, "retirement": 20.00}, "risk_metrics": {"volatility": 8.5, "sharpe_ratio": 1.2}}', 'system'),
(10, 'Asset Allocation Report - December 2023', 'asset_allocation', '2023-12-31', '{"report_date": "2023-12-31", "total_value": 15000000, "asset_allocation": {"equity": 55, "debt": 25, "gold": 10, "real_estate": 10}, "rebalancing_needed": true, "recommendations": ["Reduce equity allocation by 5%", "Increase debt allocation by 5%"]}', 'system'),
(11, 'Risk Analysis Report - December 2023', 'risk_analysis', '2023-12-31', '{"report_date": "2023-12-31", "total_value": 20000000, "risk_metrics": {"portfolio_beta": 1.15, "volatility": 12.5, "var_95": 2.5, "max_drawdown": 8.2}, "risk_level": "moderate", "recommendations": ["Consider adding more defensive stocks", "Reduce concentration risk"]}', 'system');

-- =====================================================
-- 7. SUMMARY
-- =====================================================

-- Display summary of portfolio data created
DO $$
DECLARE
    goal_count INTEGER;
    allocation_count INTEGER;
    watchlist_count INTEGER;
    performance_count INTEGER;
    alert_count INTEGER;
    report_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO goal_count FROM portfolio_goals;
    SELECT COUNT(*) INTO allocation_count FROM asset_allocation_targets;
    SELECT COUNT(*) INTO watchlist_count FROM user_watchlist;
    SELECT COUNT(*) INTO performance_count FROM portfolio_performance;
    SELECT COUNT(*) INTO alert_count FROM portfolio_alerts;
    SELECT COUNT(*) INTO report_count FROM portfolio_reports;
    
    -- Display summary
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DUMMY PORTFOLIO DATA CREATED SUCCESSFULLY';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Portfolio Goals: %', goal_count;
    RAISE NOTICE 'Asset Allocations: %', allocation_count;
    RAISE NOTICE 'Watchlist Items: %', watchlist_count;
    RAISE NOTICE 'Performance Records: %', performance_count;
    RAISE NOTICE 'Portfolio Alerts: %', alert_count;
    RAISE NOTICE 'Portfolio Reports: %', report_count;
    RAISE NOTICE '==========================================';
END $$;