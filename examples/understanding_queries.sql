-- =====================================================
-- Understanding Queries - Database Structure & Relationships
-- =====================================================
-- These queries help understand the database structure,
-- relationships, and data patterns

-- =====================================================
-- 1. DATABASE STRUCTURE OVERVIEW
-- =====================================================

-- Get all tables and their row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as current_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Get table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 2. USER PROFILES AND PREFERENCES
-- =====================================================

-- Get user profiles with their preferences
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    u.email,
    up.occupation,
    up.annual_income,
    up.risk_profile,
    up.city,
    up.state,
    pref.currency,
    pref.portfolio_view,
    pref.notification_email,
    pref.notification_sms
FROM users u
LEFT JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN user_preferences pref ON u.user_id = pref.user_id
ORDER BY u.user_id;

-- Get users by risk profile
SELECT 
    up.risk_profile,
    COUNT(*) as user_count,
    AVG(up.annual_income) as avg_annual_income,
    STRING_AGG(u.username, ', ') as usernames
FROM users u
JOIN user_profiles up ON u.user_id = up.user_id
GROUP BY up.risk_profile
ORDER BY user_count DESC;

-- =====================================================
-- 3. BROKER AND ACCOUNT RELATIONSHIPS
-- =====================================================

-- Get all broker accounts with user and broker details
SELECT 
    u.username,
    u.first_name,
    u.last_name,
    b.broker_name,
    b.broker_type,
    uba.account_number,
    uba.account_type,
    uba.opened_date,
    EXTRACT(DAYS FROM (CURRENT_DATE - uba.opened_date)) as days_since_opened
FROM users u
JOIN user_broker_accounts uba ON u.user_id = uba.user_id
JOIN brokers b ON uba.broker_id = b.broker_id
ORDER BY u.username, b.broker_name;

-- Get broker statistics
SELECT 
    b.broker_name,
    b.broker_type,
    COUNT(uba.account_id) as total_accounts,
    COUNT(DISTINCT uba.user_id) as unique_users,
    MIN(uba.opened_date) as first_account_date,
    MAX(uba.opened_date) as latest_account_date
FROM brokers b
LEFT JOIN user_broker_accounts uba ON b.broker_id = uba.broker_id
GROUP BY b.broker_id, b.broker_name, b.broker_type
ORDER BY total_accounts DESC;

-- =====================================================
-- 4. SECURITIES AND HOLDINGS ANALYSIS
-- =====================================================

-- Get securities by sector and type
SELECT 
    sector,
    security_type,
    COUNT(*) as security_count,
    AVG(face_value) as avg_face_value,
    STRING_AGG(symbol, ', ') as symbols
FROM securities
GROUP BY sector, security_type
ORDER BY sector, security_type;

-- Get current security holdings with performance
SELECT 
    u.username,
    s.symbol,
    s.name as security_name,
    s.sector,
    s.security_type,
    ush.quantity,
    ush.average_price,
    ush.current_price,
    ush.total_investment,
    ush.current_value,
    ush.unrealized_pnl,
    ROUND(ush.return_percentage, 2) as return_percentage,
    ush.first_purchase_date,
    ush.last_purchase_date
FROM users u
JOIN user_security_holdings ush ON u.user_id = ush.user_id
JOIN securities s ON ush.security_id = s.security_id
ORDER BY u.username, ush.current_value DESC;

-- Get top performing securities across all users
SELECT 
    s.symbol,
    s.name as security_name,
    s.sector,
    COUNT(DISTINCT ush.user_id) as holders_count,
    AVG(ush.return_percentage) as avg_return_percentage,
    MAX(ush.return_percentage) as max_return_percentage,
    MIN(ush.return_percentage) as min_return_percentage,
    SUM(ush.current_value) as total_value_held
FROM securities s
JOIN user_security_holdings ush ON s.security_id = ush.security_id
GROUP BY s.security_id, s.symbol, s.name, s.sector
HAVING COUNT(DISTINCT ush.user_id) >= 2
ORDER BY avg_return_percentage DESC;

-- =====================================================
-- 5. BANK ACCOUNTS AND DEPOSITS
-- =====================================================

-- Get bank accounts with deposit details
SELECT 
    u.username,
    b.bank_name,
    b.bank_type,
    uba.account_number,
    uba.account_type,
    uba.opened_date,
    COUNT(fd.fd_id) as fd_count,
    COUNT(rd.rd_id) as rd_count,
    COALESCE(SUM(fd.principal_amount), 0) as total_fd_amount,
    COALESCE(SUM(rd.monthly_installment * rd.tenure_months), 0) as total_rd_amount
FROM users u
JOIN user_bank_accounts uba ON u.user_id = uba.user_id
JOIN banks b ON uba.bank_id = b.bank_id
LEFT JOIN fixed_deposits fd ON uba.account_id = fd.account_id
LEFT JOIN recurring_deposits rd ON uba.account_id = rd.account_id
GROUP BY u.user_id, u.username, b.bank_id, b.bank_name, b.bank_type, uba.account_id, uba.account_number, uba.account_type, uba.opened_date
ORDER BY u.username, b.bank_name;

-- Get fixed deposits with maturity analysis
SELECT 
    u.username,
    b.bank_name,
    fd.fd_number,
    fd.principal_amount,
    fd.interest_rate,
    fd.tenure_months,
    fd.maturity_amount,
    fd.start_date,
    fd.maturity_date,
    EXTRACT(DAYS FROM (fd.maturity_date - CURRENT_DATE)) as days_to_maturity,
    CASE 
        WHEN fd.maturity_date <= CURRENT_DATE THEN 'Matured'
        WHEN fd.maturity_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Maturing Soon'
        ELSE 'Active'
    END as maturity_status
FROM users u
JOIN fixed_deposits fd ON u.user_id = fd.user_id
JOIN user_bank_accounts uba ON fd.account_id = uba.account_id
JOIN banks b ON uba.bank_id = b.bank_id
ORDER BY fd.maturity_date;

-- =====================================================
-- 6. ASSETS AND VALUATIONS
-- =====================================================

-- Get all assets with their details
SELECT 
    u.username,
    ac.category_name,
    asc.subcategory_name,
    ua.asset_name,
    ua.description,
    ua.purchase_date,
    ua.purchase_price,
    ua.current_value,
    ua.quantity,
    ua.unit,
    ua.location,
    ROUND(((ua.current_value - ua.purchase_price) / ua.purchase_price) * 100, 2) as return_percentage,
    ua.insurance_policy_number,
    ua.insurance_amount
FROM users u
JOIN user_assets ua ON u.user_id = ua.user_id
JOIN asset_categories ac ON ua.category_id = ac.category_id
JOIN asset_subcategories asc ON ua.subcategory_id = asc.subcategory_id
ORDER BY u.username, ua.current_value DESC;

-- Get real estate assets with detailed information
SELECT 
    u.username,
    ua.asset_name,
    red.property_type,
    red.property_address,
    red.city,
    red.state,
    red.area_sqft,
    red.built_up_area_sqft,
    red.year_built,
    red.bedrooms,
    red.bathrooms,
    red.rental_income,
    red.rental_yield,
    red.occupancy_status,
    ua.purchase_price,
    ua.current_value,
    ROUND(((ua.current_value - ua.purchase_price) / ua.purchase_price) * 100, 2) as return_percentage
FROM users u
JOIN user_assets ua ON u.user_id = ua.user_id
JOIN real_estate_details red ON ua.asset_id = red.asset_id
ORDER BY ua.current_value DESC;

-- Get gold assets with detailed information
SELECT 
    u.username,
    ua.asset_name,
    gd.gold_type,
    gd.purity,
    gd.weight_grams,
    gd.making_charges,
    gd.wastage_charges,
    gd.jeweler_name,
    gd.current_gold_rate_per_gram,
    gd.purchase_gold_rate_per_gram,
    ua.purchase_price,
    ua.current_value,
    ROUND(((ua.current_value - ua.purchase_price) / ua.purchase_price) * 100, 2) as return_percentage
FROM users u
JOIN user_assets ua ON u.user_id = ua.user_id
JOIN gold_details gd ON ua.asset_id = gd.asset_id
ORDER BY ua.current_value DESC;

-- =====================================================
-- 7. TRANSACTION PATTERNS
-- =====================================================

-- Get security transaction patterns
SELECT 
    u.username,
    s.symbol,
    s.name as security_name,
    st.transaction_type,
    COUNT(*) as transaction_count,
    SUM(st.quantity) as total_quantity,
    AVG(st.price) as avg_price,
    SUM(st.total_amount) as total_amount,
    MIN(st.transaction_date) as first_transaction,
    MAX(st.transaction_date) as last_transaction
FROM users u
JOIN security_transactions st ON u.user_id = st.user_id
JOIN securities s ON st.security_id = s.security_id
GROUP BY u.user_id, u.username, s.security_id, s.symbol, s.name, st.transaction_type
ORDER BY u.username, total_amount DESC;

-- Get asset transaction patterns
SELECT 
    u.username,
    ac.category_name,
    asc.subcategory_name,
    at.transaction_type,
    COUNT(*) as transaction_count,
    SUM(at.total_amount) as total_amount,
    AVG(at.price_per_unit) as avg_price_per_unit,
    MIN(at.transaction_date) as first_transaction,
    MAX(at.transaction_date) as last_transaction
FROM users u
JOIN asset_transactions at ON u.user_id = at.user_id
JOIN user_assets ua ON at.asset_id = ua.asset_id
JOIN asset_categories ac ON ua.category_id = ac.category_id
JOIN asset_subcategories asc ON ua.subcategory_id = asc.subcategory_id
GROUP BY u.user_id, u.username, ac.category_id, ac.category_name, asc.subcategory_id, asc.subcategory_name, at.transaction_type
ORDER BY u.username, total_amount DESC;

-- =====================================================
-- 8. PORTFOLIO GOALS AND PROGRESS
-- =====================================================

-- Get portfolio goals with progress analysis
SELECT 
    u.username,
    pg.goal_name,
    pg.goal_type,
    pg.target_amount,
    pg.current_amount,
    pg.target_date,
    pg.priority,
    ROUND((pg.current_amount / pg.target_amount) * 100, 2) as progress_percentage,
    pg.target_amount - pg.current_amount as remaining_amount,
    EXTRACT(DAYS FROM (pg.target_date - CURRENT_DATE)) as days_remaining,
    pg.is_achieved,
    pg.achieved_date
FROM users u
JOIN portfolio_goals pg ON u.user_id = pg.user_id
ORDER BY u.username, pg.priority DESC, pg.target_date;

-- Get goals by type and priority
SELECT 
    pg.goal_type,
    pg.priority,
    COUNT(*) as goal_count,
    AVG(pg.target_amount) as avg_target_amount,
    AVG(ROUND((pg.current_amount / pg.target_amount) * 100, 2)) as avg_progress_percentage,
    COUNT(CASE WHEN pg.is_achieved = TRUE THEN 1 END) as achieved_count
FROM portfolio_goals pg
GROUP BY pg.goal_type, pg.priority
ORDER BY pg.goal_type, pg.priority;

-- =====================================================
-- 9. ASSET ALLOCATION ANALYSIS
-- =====================================================

-- Get asset allocation for each user
SELECT 
    u.username,
    aat.asset_type,
    aat.target_percentage,
    aat.current_percentage,
    aat.tolerance_band,
    aat.current_percentage - aat.target_percentage as deviation_percentage,
    CASE 
        WHEN ABS(aat.current_percentage - aat.target_percentage) > aat.tolerance_band THEN 'Out of Range'
        ELSE 'Within Range'
    END as allocation_status
FROM users u
JOIN asset_allocation_targets aat ON u.user_id = aat.user_id
ORDER BY u.username, aat.asset_type;

-- Get users with allocation issues
SELECT 
    u.username,
    COUNT(*) as total_asset_types,
    COUNT(CASE WHEN ABS(aat.current_percentage - aat.target_percentage) > aat.tolerance_band THEN 1 END) as out_of_range_count,
    STRING_AGG(
        CASE WHEN ABS(aat.current_percentage - aat.target_percentage) > aat.tolerance_band 
        THEN aat.asset_type || ' (' || ROUND(aat.current_percentage - aat.target_percentage, 2) || '%)' 
        END, ', '
    ) as rebalance_needed
FROM users u
JOIN asset_allocation_targets aat ON u.user_id = aat.user_id
GROUP BY u.user_id, u.username
HAVING COUNT(CASE WHEN ABS(aat.current_percentage - aat.target_percentage) > aat.tolerance_band THEN 1 END) > 0
ORDER BY out_of_range_count DESC;

-- =====================================================
-- 10. WATCHLIST ANALYSIS
-- =====================================================

-- Get watchlist with current prices and target achievement
SELECT 
    u.username,
    s.symbol,
    s.name as security_name,
    s.sector,
    uw.target_price,
    sp.close_price as current_price,
    CASE 
        WHEN sp.close_price IS NOT NULL AND uw.target_price IS NOT NULL 
        THEN ROUND(((sp.close_price - uw.target_price) / uw.target_price) * 100, 2)
        ELSE NULL
    END as target_achievement_percentage,
    uw.notes,
    uw.added_date
FROM users u
JOIN user_watchlist uw ON u.user_id = uw.user_id
JOIN securities s ON uw.security_id = s.security_id
LEFT JOIN security_prices sp ON s.security_id = sp.security_id 
    AND sp.price_date = (SELECT MAX(price_date) FROM security_prices WHERE security_id = s.security_id)
ORDER BY u.username, target_achievement_percentage DESC NULLS LAST;

-- Get watchlist alerts (target price achieved)
SELECT 
    u.username,
    s.symbol,
    s.name as security_name,
    uw.target_price,
    sp.close_price as current_price,
    ROUND(((sp.close_price - uw.target_price) / uw.target_price) * 100, 2) as target_achievement_percentage,
    uw.added_date
FROM users u
JOIN user_watchlist uw ON u.user_id = uw.user_id
JOIN securities s ON uw.security_id = s.security_id
JOIN security_prices sp ON s.security_id = sp.security_id 
    AND sp.price_date = (SELECT MAX(price_date) FROM security_prices WHERE security_id = s.security_id)
WHERE sp.close_price >= uw.target_price
ORDER BY target_achievement_percentage DESC;

-- =====================================================
-- 11. PERFORMANCE ANALYSIS
-- =====================================================

-- Get portfolio performance summary
SELECT 
    u.username,
    pp.performance_date,
    pp.total_portfolio_value,
    pp.total_investment,
    pp.total_pnl,
    pp.total_return_percentage,
    pp.day_change,
    pp.day_change_percentage
FROM users u
JOIN portfolio_performance pp ON u.user_id = pp.user_id
WHERE pp.performance_date = (SELECT MAX(performance_date) FROM portfolio_performance WHERE user_id = pp.user_id)
ORDER BY pp.total_return_percentage DESC;

-- Get performance by risk profile
SELECT 
    up.risk_profile,
    COUNT(DISTINCT u.user_id) as user_count,
    AVG(pp.total_return_percentage) as avg_return_percentage,
    MAX(pp.total_return_percentage) as max_return_percentage,
    MIN(pp.total_return_percentage) as min_return_percentage,
    STDDEV(pp.total_return_percentage) as return_volatility
FROM users u
JOIN user_profiles up ON u.user_id = up.user_id
JOIN portfolio_performance pp ON u.user_id = pp.user_id
WHERE pp.performance_date = (SELECT MAX(performance_date) FROM portfolio_performance WHERE user_id = pp.user_id)
GROUP BY up.risk_profile
ORDER BY avg_return_percentage DESC;

-- =====================================================
-- 12. DATA QUALITY CHECKS
-- =====================================================

-- Check for orphaned records
SELECT 
    'Orphaned Security Holdings' as issue_type,
    COUNT(*) as count
FROM user_security_holdings ush
LEFT JOIN users u ON ush.user_id = u.user_id
WHERE u.user_id IS NULL
UNION ALL
SELECT 
    'Orphaned Fixed Deposits' as issue_type,
    COUNT(*) as count
FROM fixed_deposits fd
LEFT JOIN users u ON fd.user_id = u.user_id
WHERE u.user_id IS NULL
UNION ALL
SELECT 
    'Orphaned User Assets' as issue_type,
    COUNT(*) as count
FROM user_assets ua
LEFT JOIN users u ON ua.user_id = u.user_id
WHERE u.user_id IS NULL
UNION ALL
SELECT 
    'Orphaned Security Transactions' as issue_type,
    COUNT(*) as count
FROM security_transactions st
LEFT JOIN users u ON st.user_id = u.user_id
WHERE u.user_id IS NULL;

-- Check for data consistency issues
SELECT 
    'Negative Quantities' as issue_type,
    COUNT(*) as count
FROM user_security_holdings
WHERE quantity < 0
UNION ALL
SELECT 
    'Negative Prices' as issue_type,
    COUNT(*) as count
FROM security_prices
WHERE close_price < 0
UNION ALL
SELECT 
    'Future Purchase Dates' as issue_type,
    COUNT(*) as count
FROM user_assets
WHERE purchase_date > CURRENT_DATE
UNION ALL
SELECT 
    'Invalid Goal Dates' as issue_type,
    COUNT(*) as count
FROM portfolio_goals
WHERE target_date < CURRENT_DATE AND is_achieved = FALSE;

-- =====================================================
-- 13. SUMMARY STATISTICS
-- =====================================================

-- Get comprehensive summary statistics
SELECT 
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM users
UNION ALL
SELECT 
    'Total Brokers' as metric,
    COUNT(*)::TEXT as value
FROM brokers
UNION ALL
SELECT 
    'Total Securities' as metric,
    COUNT(*)::TEXT as value
FROM securities
UNION ALL
SELECT 
    'Total Banks' as metric,
    COUNT(*)::TEXT as value
FROM banks
UNION ALL
SELECT 
    'Total Fixed Deposits' as metric,
    COUNT(*)::TEXT as value
FROM fixed_deposits
UNION ALL
SELECT 
    'Total Recurring Deposits' as metric,
    COUNT(*)::TEXT as value
FROM recurring_deposits
UNION ALL
SELECT 
    'Total Assets' as metric,
    COUNT(*)::TEXT as value
FROM user_assets
UNION ALL
SELECT 
    'Total Security Transactions' as metric,
    COUNT(*)::TEXT as value
FROM security_transactions
UNION ALL
SELECT 
    'Total Asset Transactions' as metric,
    COUNT(*)::TEXT as value
FROM asset_transactions
UNION ALL
SELECT 
    'Total Portfolio Goals' as metric,
    COUNT(*)::TEXT as value
FROM portfolio_goals
UNION ALL
SELECT 
    'Total Watchlist Items' as metric,
    COUNT(*)::TEXT as value
FROM user_watchlist;

-- Get portfolio value summary
SELECT 
    'Total Portfolio Value' as metric,
    TO_CHAR(SUM(ps.current_value), 'FM999,999,999,999.00') as value
FROM portfolio_summary ps
UNION ALL
SELECT 
    'Total Investment' as metric,
    TO_CHAR(SUM(ps.total_investment), 'FM999,999,999,999.00') as value
FROM portfolio_summary ps
UNION ALL
SELECT 
    'Total P&L' as metric,
    TO_CHAR(SUM(ps.unrealized_pnl), 'FM999,999,999,999.00') as value
FROM portfolio_summary ps
UNION ALL
SELECT 
    'Average Return %' as metric,
    TO_CHAR(AVG(ps.return_percentage), 'FM999.99') || '%' as value
FROM portfolio_summary ps;