-- =====================================================
-- Portfolio Management Database - Example Queries
-- =====================================================

-- =====================================================
-- 1. PORTFOLIO OVERVIEW QUERIES
-- =====================================================

-- Get complete portfolio overview for all users
SELECT 
    user_id,
    username,
    first_name,
    last_name,
    securities_value,
    fixed_deposits_value,
    recurring_deposits_value,
    assets_value,
    total_portfolio_value,
    total_investment,
    total_unrealized_pnl,
    ROUND((total_unrealized_pnl / NULLIF(total_investment, 0)) * 100, 2) as total_return_percentage
FROM v_portfolio_overview
ORDER BY total_portfolio_value DESC;

-- Get portfolio overview for a specific user
SELECT * FROM v_portfolio_overview WHERE user_id = 1;

-- Get portfolio summary by asset type for a user
SELECT 
    asset_type,
    total_investment,
    current_value,
    unrealized_pnl,
    percentage_of_portfolio,
    ROUND((unrealized_pnl / NULLIF(total_investment, 0)) * 100, 2) as return_percentage
FROM portfolio_summary 
WHERE user_id = 1
ORDER BY current_value DESC;

-- =====================================================
-- 2. SECURITY HOLDINGS QUERIES
-- =====================================================

-- Get all security holdings with performance metrics
SELECT 
    user_name,
    broker_name,
    symbol,
    security_name,
    security_type,
    sector,
    quantity,
    average_price,
    current_price,
    total_investment,
    current_value,
    unrealized_pnl,
    return_percentage,
    first_purchase_date,
    last_purchase_date
FROM v_security_holdings
WHERE user_id = 1
ORDER BY current_value DESC;

-- Get top performing securities across all users
SELECT 
    symbol,
    security_name,
    security_type,
    sector,
    COUNT(*) as holders_count,
    AVG(return_percentage) as avg_return_percentage,
    MAX(return_percentage) as max_return_percentage,
    MIN(return_percentage) as min_return_percentage
FROM v_security_holdings
GROUP BY symbol, security_name, security_type, sector
HAVING COUNT(*) >= 2
ORDER BY avg_return_percentage DESC;

-- Get worst performing securities
SELECT 
    symbol,
    security_name,
    security_type,
    sector,
    COUNT(*) as holders_count,
    AVG(return_percentage) as avg_return_percentage
FROM v_security_holdings
WHERE return_percentage < 0
GROUP BY symbol, security_name, security_type, sector
ORDER BY avg_return_percentage ASC;

-- Get securities by sector performance
SELECT 
    sector,
    COUNT(*) as total_holdings,
    AVG(return_percentage) as avg_return_percentage,
    SUM(current_value) as total_value,
    SUM(unrealized_pnl) as total_pnl
FROM v_security_holdings
WHERE user_id = 1
GROUP BY sector
ORDER BY avg_return_percentage DESC;

-- Get recent security transactions
SELECT 
    st.transaction_date,
    s.symbol,
    s.name as security_name,
    st.transaction_type,
    st.quantity,
    st.price,
    st.total_amount,
    st.net_amount,
    b.broker_name,
    st.notes
FROM security_transactions st
JOIN securities s ON st.security_id = s.security_id
JOIN user_broker_accounts uba ON st.account_id = uba.account_id
JOIN brokers b ON uba.broker_id = b.broker_id
WHERE st.user_id = 1
ORDER BY st.transaction_date DESC
LIMIT 10;

-- =====================================================
-- 3. FIXED DEPOSITS QUERIES
-- =====================================================

-- Get all fixed deposits with maturity status
SELECT 
    user_name,
    bank_name,
    fd_number,
    principal_amount,
    interest_rate,
    tenure_months,
    maturity_amount,
    start_date,
    maturity_date,
    status,
    days_to_maturity,
    interest_payout_frequency,
    auto_renewal
FROM v_fixed_deposits
WHERE user_id = 1
ORDER BY maturity_date;

-- Get FDs maturing in next 30 days
SELECT 
    user_name,
    bank_name,
    fd_number,
    principal_amount,
    maturity_amount,
    maturity_date,
    days_to_maturity,
    interest_payout_frequency
FROM v_fixed_deposits
WHERE user_id = 1 
  AND days_to_maturity <= 30
  AND status = 'Active'
ORDER BY days_to_maturity;

-- Get FD interest payments summary
SELECT 
    fd.fd_number,
    b.bank_name,
    fd.principal_amount,
    fd.interest_rate,
    COUNT(fip.payment_id) as payments_made,
    COALESCE(SUM(fip.interest_amount), 0) as total_interest_paid,
    COALESCE(MAX(fip.cumulative_interest), 0) as cumulative_interest,
    fd.maturity_amount - fd.principal_amount as total_interest_due
FROM fixed_deposits fd
JOIN user_bank_accounts uba ON fd.account_id = uba.account_id
JOIN banks b ON uba.bank_id = b.bank_id
LEFT JOIN fd_interest_payments fip ON fd.fd_id = fip.fd_id
WHERE fd.user_id = 1
GROUP BY fd.fd_id, fd.fd_number, b.bank_name, fd.principal_amount, fd.interest_rate, fd.maturity_amount
ORDER BY fd.maturity_date;

-- =====================================================
-- 4. RECURRING DEPOSITS QUERIES
-- =====================================================

-- Get all recurring deposits with progress
SELECT 
    user_name,
    bank_name,
    rd_number,
    monthly_installment,
    interest_rate,
    tenure_months,
    maturity_amount,
    start_date,
    maturity_date,
    status,
    days_to_maturity,
    paid_installments,
    total_installments,
    ROUND((paid_installments::DECIMAL / total_installments) * 100, 2) as completion_percentage
FROM v_recurring_deposits
WHERE user_id = 1
ORDER BY maturity_date;

-- Get RD installment status
SELECT 
    rd.rd_number,
    b.bank_name,
    ri.installment_number,
    ri.due_date,
    ri.installment_amount,
    ri.paid_amount,
    ri.paid_date,
    ri.payment_status,
    ri.late_fee,
    CASE 
        WHEN ri.due_date < CURRENT_DATE AND ri.payment_status != 'paid' THEN 'Overdue'
        WHEN ri.due_date = CURRENT_DATE AND ri.payment_status != 'paid' THEN 'Due Today'
        WHEN ri.due_date > CURRENT_DATE AND ri.payment_status != 'paid' THEN 'Upcoming'
        ELSE 'Paid'
    END as status_description
FROM recurring_deposits rd
JOIN user_bank_accounts uba ON rd.account_id = uba.account_id
JOIN banks b ON uba.bank_id = b.bank_id
JOIN rd_installments ri ON rd.rd_id = ri.rd_id
WHERE rd.user_id = 1
ORDER BY rd.rd_number, ri.installment_number;

-- =====================================================
-- 5. ASSETS QUERIES
-- =====================================================

-- Get all user assets with performance
SELECT 
    user_name,
    category_name,
    subcategory_name,
    asset_name,
    description,
    purchase_date,
    purchase_price,
    current_value,
    quantity,
    unit,
    location,
    return_percentage,
    insurance_policy_number,
    insurance_amount,
    insurance_expiry_date
FROM v_user_assets
WHERE user_id = 1
ORDER BY current_value DESC;

-- Get real estate assets
SELECT 
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
FROM user_assets ua
JOIN real_estate_details red ON ua.asset_id = red.asset_id
WHERE ua.user_id = 1 AND ua.category_id = 2
ORDER BY ua.current_value DESC;

-- Get gold assets
SELECT 
    ua.asset_name,
    gd.gold_type,
    gd.purity,
    gd.weight_grams,
    gd.making_charges,
    gd.wastage_charges,
    gd.jeweler_name,
    gd.current_gold_rate_per_gram,
    ua.purchase_price,
    ua.current_value,
    ROUND(((ua.current_value - ua.purchase_price) / ua.purchase_price) * 100, 2) as return_percentage
FROM user_assets ua
JOIN gold_details gd ON ua.asset_id = gd.asset_id
WHERE ua.user_id = 1 AND ua.category_id = 1
ORDER BY ua.current_value DESC;

-- Get asset valuation history
SELECT 
    ua.asset_name,
    av.valuation_date,
    av.valuation_amount,
    av.valuation_method,
    av.valuation_source,
    av.notes,
    LAG(av.valuation_amount) OVER (PARTITION BY ua.asset_id ORDER BY av.valuation_date) as previous_valuation,
    av.valuation_amount - LAG(av.valuation_amount) OVER (PARTITION BY ua.asset_id ORDER BY av.valuation_date) as valuation_change
FROM user_assets ua
JOIN asset_valuations av ON ua.asset_id = av.asset_id
WHERE ua.user_id = 1
ORDER BY ua.asset_name, av.valuation_date;

-- =====================================================
-- 6. PORTFOLIO PERFORMANCE QUERIES
-- =====================================================

-- Get portfolio performance over time
SELECT 
    user_name,
    performance_date,
    total_portfolio_value,
    total_investment,
    total_pnl,
    total_return_percentage,
    day_change,
    day_change_percentage,
    week_change,
    week_change_percentage,
    month_change,
    month_change_percentage,
    year_change,
    year_change_percentage
FROM v_portfolio_performance
WHERE user_id = 1
ORDER BY performance_date DESC;

-- Get best and worst performing days
SELECT 
    user_name,
    performance_date,
    total_return_percentage,
    day_change,
    day_change_percentage
FROM v_portfolio_performance
WHERE user_id = 1
ORDER BY day_change_percentage DESC
LIMIT 5;

-- Get monthly performance summary
SELECT 
    user_id,
    DATE_TRUNC('month', performance_date) as month,
    AVG(total_portfolio_value) as avg_portfolio_value,
    AVG(total_return_percentage) as avg_return_percentage,
    MAX(total_portfolio_value) as max_portfolio_value,
    MIN(total_portfolio_value) as min_portfolio_value,
    MAX(total_return_percentage) - MIN(total_return_percentage) as volatility
FROM portfolio_performance
WHERE user_id = 1
GROUP BY user_id, DATE_TRUNC('month', performance_date)
ORDER BY month DESC;

-- =====================================================
-- 7. ASSET ALLOCATION QUERIES
-- =====================================================

-- Get asset allocation analysis
SELECT 
    user_name,
    asset_type,
    target_percentage,
    current_percentage,
    tolerance_band,
    allocation_status,
    deviation_percentage,
    CASE 
        WHEN ABS(deviation_percentage) > tolerance_band THEN 'REBALANCE NEEDED'
        ELSE 'WITHIN RANGE'
    END as rebalance_status
FROM v_asset_allocation
WHERE user_id = 1
ORDER BY current_percentage DESC;

-- Get users with allocation issues
SELECT 
    user_name,
    COUNT(*) as total_asset_types,
    COUNT(CASE WHEN allocation_status = 'Out of Range' THEN 1 END) as out_of_range_count,
    STRING_AGG(
        CASE WHEN allocation_status = 'Out of Range' 
        THEN asset_type || ' (' || ROUND(deviation_percentage, 2) || '%)' 
        END, ', '
    ) as rebalance_needed
FROM v_asset_allocation
GROUP BY user_id, user_name
HAVING COUNT(CASE WHEN allocation_status = 'Out of Range' THEN 1 END) > 0
ORDER BY out_of_range_count DESC;

-- =====================================================
-- 8. GOALS AND TARGETS QUERIES
-- =====================================================

-- Get portfolio goals with progress
SELECT 
    user_name,
    goal_name,
    goal_type,
    target_amount,
    current_amount,
    target_date,
    priority,
    ROUND((current_amount / target_amount) * 100, 2) as progress_percentage,
    target_amount - current_amount as remaining_amount,
    EXTRACT(DAYS FROM (target_date - CURRENT_DATE)) as days_remaining,
    is_achieved,
    achieved_date
FROM portfolio_goals pg
JOIN users u ON pg.user_id = u.user_id
WHERE pg.user_id = 1
ORDER BY priority DESC, target_date;

-- Get goals by type summary
SELECT 
    goal_type,
    COUNT(*) as total_goals,
    COUNT(CASE WHEN is_achieved = TRUE THEN 1 END) as achieved_goals,
    AVG(ROUND((current_amount / target_amount) * 100, 2)) as avg_progress_percentage,
    SUM(target_amount) as total_target_amount,
    SUM(current_amount) as total_current_amount
FROM portfolio_goals
WHERE user_id = 1
GROUP BY goal_type
ORDER BY total_target_amount DESC;

-- =====================================================
-- 9. WATCHLIST QUERIES
-- =====================================================

-- Get user watchlist with current prices
SELECT 
    user_name,
    symbol,
    security_name,
    security_type,
    exchange,
    sector,
    current_price,
    target_price,
    target_achievement_percentage,
    notes,
    added_date
FROM v_user_watchlist
WHERE user_id = 1
ORDER BY target_achievement_percentage DESC NULLS LAST;

-- Get watchlist alerts (target price achieved)
SELECT 
    user_name,
    symbol,
    security_name,
    current_price,
    target_price,
    target_achievement_percentage,
    added_date
FROM v_user_watchlist
WHERE user_id = 1 
  AND target_achievement_percentage IS NOT NULL
  AND target_achievement_percentage >= 0
ORDER BY target_achievement_percentage DESC;

-- =====================================================
-- 10. TRANSACTION ANALYSIS QUERIES
-- =====================================================

-- Get recent transactions across all asset types
SELECT 
    transaction_category,
    transaction_id,
    user_name,
    asset_symbol,
    asset_name,
    transaction_type,
    transaction_date,
    quantity,
    price,
    total_amount,
    net_amount,
    notes
FROM v_recent_transactions
WHERE user_id = 1
ORDER BY transaction_date DESC
LIMIT 20;

-- Get transaction summary by month
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    transaction_category,
    COUNT(*) as transaction_count,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_amount,
    SUM(net_amount) as total_net_amount
FROM v_recent_transactions
WHERE user_id = 1
GROUP BY DATE_TRUNC('month', transaction_date), transaction_category
ORDER BY month DESC, transaction_category;

-- Get transaction analysis by broker/bank
SELECT 
    CASE 
        WHEN st.transaction_id IS NOT NULL THEN b.broker_name
        WHEN at.transaction_id IS NOT NULL THEN 'Asset Purchase'
        WHEN bt.transaction_id IS NOT NULL THEN bn.bank_name
    END as institution_name,
    CASE 
        WHEN st.transaction_id IS NOT NULL THEN 'Securities'
        WHEN at.transaction_id IS NOT NULL THEN 'Assets'
        WHEN bt.transaction_id IS NOT NULL THEN 'Banking'
    END as transaction_type,
    COUNT(*) as transaction_count,
    SUM(CASE 
        WHEN st.transaction_id IS NOT NULL THEN st.total_amount
        WHEN at.transaction_id IS NOT NULL THEN at.total_amount
        WHEN bt.transaction_id IS NOT NULL THEN bt.amount
    END) as total_amount
FROM users u
LEFT JOIN security_transactions st ON u.user_id = st.user_id
LEFT JOIN user_broker_accounts uba ON st.account_id = uba.account_id
LEFT JOIN brokers b ON uba.broker_id = b.broker_id
LEFT JOIN asset_transactions at ON u.user_id = at.user_id
LEFT JOIN bank_transactions bt ON u.user_id = bt.user_id
LEFT JOIN user_bank_accounts uba2 ON bt.account_id = uba2.account_id
LEFT JOIN banks bn ON uba2.bank_id = bn.bank_id
WHERE u.user_id = 1
GROUP BY 
    CASE 
        WHEN st.transaction_id IS NOT NULL THEN b.broker_name
        WHEN at.transaction_id IS NOT NULL THEN 'Asset Purchase'
        WHEN bt.transaction_id IS NOT NULL THEN bn.bank_name
    END,
    CASE 
        WHEN st.transaction_id IS NOT NULL THEN 'Securities'
        WHEN at.transaction_id IS NOT NULL THEN 'Assets'
        WHEN bt.transaction_id IS NOT NULL THEN 'Banking'
    END
ORDER BY total_amount DESC;

-- =====================================================
-- 11. ANALYTICS AND REPORTING QUERIES
-- =====================================================

-- Get portfolio diversification analysis
SELECT 
    user_id,
    COUNT(DISTINCT CASE WHEN asset_type = 'securities' THEN 'Securities' END) as securities_count,
    COUNT(DISTINCT CASE WHEN asset_type = 'fixed_deposits' THEN 'Fixed Deposits' END) as fd_count,
    COUNT(DISTINCT CASE WHEN asset_type = 'recurring_deposits' THEN 'Recurring Deposits' END) as rd_count,
    COUNT(DISTINCT CASE WHEN asset_type = 'other_assets' THEN 'Other Assets' END) as assets_count,
    COUNT(DISTINCT symbol) as unique_securities,
    COUNT(DISTINCT broker_name) as unique_brokers,
    COUNT(DISTINCT bank_name) as unique_banks
FROM v_portfolio_overview pv
LEFT JOIN v_security_holdings vsh ON pv.user_id = vsh.user_id
LEFT JOIN v_fixed_deposits vfd ON pv.user_id = vfd.user_id
LEFT JOIN v_recurring_deposits vrd ON pv.user_id = vrd.user_id
LEFT JOIN v_user_assets vua ON pv.user_id = vua.user_id
GROUP BY pv.user_id, pv.username
ORDER BY pv.user_id;

-- Get risk analysis (volatility)
WITH daily_returns AS (
    SELECT 
        user_id,
        performance_date,
        total_return_percentage,
        LAG(total_return_percentage) OVER (PARTITION BY user_id ORDER BY performance_date) as prev_return
    FROM portfolio_performance
    WHERE user_id = 1
),
return_changes AS (
    SELECT 
        user_id,
        performance_date,
        total_return_percentage - COALESCE(prev_return, 0) as daily_change
    FROM daily_returns
)
SELECT 
    user_id,
    AVG(daily_change) as avg_daily_change,
    STDDEV(daily_change) as volatility,
    MIN(daily_change) as worst_daily_change,
    MAX(daily_change) as best_daily_change,
    COUNT(*) as trading_days
FROM return_changes
GROUP BY user_id;

-- Get correlation analysis between different asset types
SELECT 
    'Securities vs Fixed Deposits' as correlation_pair,
    CORR(ps_securities.current_value, ps_fd.current_value) as correlation_coefficient
FROM portfolio_summary ps_securities
JOIN portfolio_summary ps_fd ON ps_securities.user_id = ps_fd.user_id
WHERE ps_securities.asset_type = 'securities' AND ps_fd.asset_type = 'fixed_deposits'
UNION ALL
SELECT 
    'Securities vs Assets' as correlation_pair,
    CORR(ps_securities.current_value, ps_assets.current_value) as correlation_coefficient
FROM portfolio_summary ps_securities
JOIN portfolio_summary ps_assets ON ps_securities.user_id = ps_assets.user_id
WHERE ps_securities.asset_type = 'securities' AND ps_assets.asset_type = 'other_assets';

-- =====================================================
-- 12. MAINTENANCE AND ADMIN QUERIES
-- =====================================================

-- Update portfolio summaries for all users
SELECT calculate_portfolio_summary(user_id) FROM users;

-- Get database statistics
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND tablename IN ('users', 'securities', 'user_security_holdings', 'fixed_deposits', 'user_assets')
ORDER BY tablename, attname;

-- Get table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for data integrity issues
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
WHERE u.user_id IS NULL;