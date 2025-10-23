-- =====================================================
-- Views for Portfolio Management
-- =====================================================

-- Comprehensive portfolio view
CREATE VIEW v_portfolio_overview AS
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.last_name,
    COALESCE(ps_securities.current_value, 0) as securities_value,
    COALESCE(ps_fd.current_value, 0) as fixed_deposits_value,
    COALESCE(ps_rd.current_value, 0) as recurring_deposits_value,
    COALESCE(ps_assets.current_value, 0) as assets_value,
    COALESCE(ps_securities.current_value, 0) + 
    COALESCE(ps_fd.current_value, 0) + 
    COALESCE(ps_rd.current_value, 0) + 
    COALESCE(ps_assets.current_value, 0) as total_portfolio_value,
    COALESCE(ps_securities.total_investment, 0) + 
    COALESCE(ps_fd.total_investment, 0) + 
    COALESCE(ps_rd.total_investment, 0) + 
    COALESCE(ps_assets.total_investment, 0) as total_investment,
    COALESCE(ps_securities.unrealized_pnl, 0) + 
    COALESCE(ps_assets.unrealized_pnl, 0) as total_unrealized_pnl
FROM users u
LEFT JOIN portfolio_summary ps_securities ON u.user_id = ps_securities.user_id AND ps_securities.asset_type = 'securities'
LEFT JOIN portfolio_summary ps_fd ON u.user_id = ps_fd.user_id AND ps_fd.asset_type = 'fixed_deposits'
LEFT JOIN portfolio_summary ps_rd ON u.user_id = ps_rd.user_id AND ps_rd.asset_type = 'recurring_deposits'
LEFT JOIN portfolio_summary ps_assets ON u.user_id = ps_assets.user_id AND ps_assets.asset_type = 'other_assets'
WHERE u.is_active = TRUE;

-- Securities holdings detailed view
CREATE VIEW v_security_holdings AS
SELECT 
    ush.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    b.broker_name,
    uba.account_number,
    s.symbol,
    s.name as security_name,
    s.security_type,
    s.exchange,
    s.sector,
    ush.quantity,
    ush.average_price,
    ush.current_price,
    ush.total_investment,
    ush.current_value,
    ush.unrealized_pnl,
    CASE 
        WHEN ush.average_price > 0 THEN 
            ROUND(((ush.current_price - ush.average_price) / ush.average_price) * 100, 2)
        ELSE 0 
    END as return_percentage,
    ush.first_purchase_date,
    ush.last_purchase_date
FROM user_security_holdings ush
JOIN users u ON ush.user_id = u.user_id
JOIN user_broker_accounts uba ON ush.account_id = uba.account_id
JOIN brokers b ON uba.broker_id = b.broker_id
JOIN securities s ON ush.security_id = s.security_id
WHERE u.is_active = TRUE AND s.is_active = TRUE;

-- Fixed deposits detailed view
CREATE VIEW v_fixed_deposits AS
SELECT 
    fd.fd_id,
    fd.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    b.bank_name,
    uba.account_number,
    fd.fd_number,
    fd.principal_amount,
    fd.interest_rate,
    fd.tenure_months,
    fd.maturity_amount,
    fd.start_date,
    fd.maturity_date,
    fd.interest_payout_frequency,
    fd.auto_renewal,
    CASE 
        WHEN fd.maturity_date < CURRENT_DATE THEN 'Matured'
        WHEN fd.maturity_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Maturity Soon'
        ELSE 'Active'
    END as status,
    (fd.maturity_date - CURRENT_DATE) as days_to_maturity
FROM fixed_deposits fd
JOIN users u ON fd.user_id = u.user_id
JOIN user_bank_accounts uba ON fd.account_id = uba.account_id
JOIN banks b ON uba.bank_id = b.bank_id
WHERE fd.is_active = TRUE AND u.is_active = TRUE;

-- Recurring deposits detailed view
CREATE VIEW v_recurring_deposits AS
SELECT 
    rd.rd_id,
    rd.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    b.bank_name,
    uba.account_number,
    rd.rd_number,
    rd.monthly_installment,
    rd.interest_rate,
    rd.tenure_months,
    rd.maturity_amount,
    rd.start_date,
    rd.maturity_date,
    rd.installment_day,
    rd.auto_debit,
    CASE 
        WHEN rd.maturity_date < CURRENT_DATE THEN 'Matured'
        WHEN rd.maturity_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Maturity Soon'
        ELSE 'Active'
    END as status,
    (rd.maturity_date - CURRENT_DATE) as days_to_maturity,
    (SELECT COUNT(*) FROM rd_installments ri WHERE ri.rd_id = rd.rd_id AND ri.payment_status = 'paid') as paid_installments,
    (SELECT COUNT(*) FROM rd_installments ri WHERE ri.rd_id = rd.rd_id) as total_installments
FROM recurring_deposits rd
JOIN users u ON rd.user_id = u.user_id
JOIN user_bank_accounts uba ON rd.account_id = uba.account_id
JOIN banks b ON uba.bank_id = b.bank_id
WHERE rd.is_active = TRUE AND u.is_active = TRUE;

-- Assets detailed view
CREATE VIEW v_user_assets AS
SELECT 
    ua.asset_id,
    ua.user_id,
    u.first_name || ' ' || u.last_name as user_name,
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
    ua.storage_location,
    CASE 
        WHEN ua.current_value > 0 AND ua.purchase_price > 0 THEN 
            ROUND(((ua.current_value - ua.purchase_price) / ua.purchase_price) * 100, 2)
        ELSE 0 
    END as return_percentage,
    ua.insurance_policy_number,
    ua.insurance_company,
    ua.insurance_amount,
    ua.insurance_expiry_date
FROM user_assets ua
JOIN users u ON ua.user_id = u.user_id
JOIN asset_categories ac ON ua.category_id = ac.category_id
LEFT JOIN asset_subcategories asc ON ua.subcategory_id = asc.subcategory_id
WHERE ua.is_active = TRUE AND u.is_active = TRUE;

-- Portfolio performance view
CREATE VIEW v_portfolio_performance AS
SELECT 
    pp.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    pp.performance_date,
    pp.total_portfolio_value,
    pp.total_investment,
    pp.total_pnl,
    pp.total_return_percentage,
    pp.day_change,
    pp.day_change_percentage,
    pp.week_change,
    pp.week_change_percentage,
    pp.month_change,
    pp.month_change_percentage,
    pp.year_change,
    pp.year_change_percentage
FROM portfolio_performance pp
JOIN users u ON pp.user_id = u.user_id
WHERE u.is_active = TRUE
ORDER BY pp.user_id, pp.performance_date DESC;

-- Asset allocation view
CREATE VIEW v_asset_allocation AS
SELECT 
    aat.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    aat.asset_type,
    aat.target_percentage,
    aat.current_percentage,
    aat.tolerance_band,
    CASE 
        WHEN ABS(aat.current_percentage - aat.target_percentage) > aat.tolerance_band THEN 'Out of Range'
        ELSE 'Within Range'
    END as allocation_status,
    aat.current_percentage - aat.target_percentage as deviation_percentage
FROM asset_allocation_targets aat
JOIN users u ON aat.user_id = u.user_id
WHERE aat.is_active = TRUE AND u.is_active = TRUE;

-- Watchlist view
CREATE VIEW v_user_watchlist AS
SELECT 
    uw.watchlist_id,
    uw.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    s.symbol,
    s.name as security_name,
    s.security_type,
    s.exchange,
    s.sector,
    sp.close_price as current_price,
    uw.target_price,
    CASE 
        WHEN uw.target_price > 0 AND sp.close_price > 0 THEN 
            ROUND(((sp.close_price - uw.target_price) / uw.target_price) * 100, 2)
        ELSE NULL 
    END as target_achievement_percentage,
    uw.notes,
    uw.added_date
FROM user_watchlist uw
JOIN users u ON uw.user_id = u.user_id
JOIN securities s ON uw.security_id = s.security_id
LEFT JOIN security_prices sp ON s.security_id = sp.security_id 
    AND sp.price_date = (SELECT MAX(price_date) FROM security_prices WHERE security_id = s.security_id)
WHERE u.is_active = TRUE AND s.is_active = TRUE;

-- Recent transactions view
CREATE VIEW v_recent_transactions AS
SELECT 
    'Security' as transaction_category,
    st.transaction_id,
    st.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    s.symbol as asset_symbol,
    s.name as asset_name,
    st.transaction_type,
    st.transaction_date,
    st.quantity,
    st.price,
    st.total_amount,
    st.net_amount,
    st.notes
FROM security_transactions st
JOIN users u ON st.user_id = u.user_id
JOIN securities s ON st.security_id = s.security_id

UNION ALL

SELECT 
    'Asset' as transaction_category,
    at.transaction_id,
    at.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    ua.asset_name as asset_symbol,
    ua.asset_name as asset_name,
    at.transaction_type,
    at.transaction_date,
    at.quantity,
    at.price_per_unit as price,
    at.total_amount,
    at.net_amount,
    at.notes
FROM asset_transactions at
JOIN users u ON at.user_id = u.user_id
JOIN user_assets ua ON at.asset_id = ua.asset_id

ORDER BY transaction_date DESC, transaction_id DESC;

-- Security transactions detailed view
CREATE VIEW v_security_transactions AS
SELECT 
    st.transaction_id,
    st.user_id,
    u.username,
    u.first_name || ' ' || u.last_name as user_name,
    u.email,
    b.broker_name,
    b.broker_code,
    uba.account_number,
    uba.account_type,
    s.symbol,
    s.name as security_name,
    s.security_type,
    s.exchange,
    s.sector,
    s.industry,
    s.isin,
    st.transaction_type,
    st.transaction_date,
    st.quantity,
    st.price,
    st.total_amount,
    st.brokerage,
    st.taxes,
    st.other_charges,
    st.net_amount,
    -- Calculate effective price per unit (including all charges)
    CASE 
        WHEN st.quantity > 0 THEN 
            ROUND(st.net_amount / st.quantity, 4)
        ELSE 0 
    END as effective_price_per_unit,
    -- Calculate total charges
    (st.brokerage + st.taxes + st.other_charges) as total_charges,
    -- Calculate charges percentage
    CASE 
        WHEN st.total_amount > 0 THEN 
            ROUND(((st.brokerage + st.taxes + st.other_charges) / st.total_amount) * 100, 2)
        ELSE 0 
    END as charges_percentage,
    -- Get current holding information
    ush.average_price as current_avg_price,
    ush.quantity as current_holding_quantity,
    ush.current_price,
    -- Calculate unrealized P&L for current holdings
    CASE 
        WHEN st.transaction_type IN ('buy', 'bonus', 'split') THEN
            CASE 
                WHEN ush.current_price IS NOT NULL AND ush.average_price > 0 THEN
                    ROUND((ush.current_price - ush.average_price) * st.quantity, 2)
                ELSE NULL
            END
        ELSE NULL
    END as unrealized_pnl_contribution,
    -- Calculate realized P&L for sell transactions
    CASE 
        WHEN st.transaction_type = 'sell' AND ush.average_price IS NOT NULL THEN
            ROUND((st.price - ush.average_price) * st.quantity - (st.brokerage + st.taxes + st.other_charges), 2)
        ELSE NULL
    END as realized_pnl,
    -- Calculate return percentage for sell transactions
    CASE 
        WHEN st.transaction_type = 'sell' AND ush.average_price > 0 THEN
            ROUND(((st.price - ush.average_price) / ush.average_price) * 100, 2)
        ELSE NULL
    END as return_percentage,
    st.notes,
    st.created_at,
    -- Days held (for sell transactions)
    CASE 
        WHEN st.transaction_type = 'sell' AND ush.first_purchase_date IS NOT NULL THEN
            st.transaction_date - ush.first_purchase_date
        ELSE NULL
    END as days_held,
    -- Transaction classification
    CASE 
        WHEN st.transaction_type IN ('buy', 'bonus', 'split') THEN 'Acquisition'
        WHEN st.transaction_type = 'sell' THEN 'Disposal'
        WHEN st.transaction_type = 'dividend' THEN 'Income'
        ELSE 'Other'
    END as transaction_classification,
    -- Calculate investment impact
    CASE 
        WHEN st.transaction_type = 'buy' THEN st.net_amount
        WHEN st.transaction_type = 'sell' THEN -st.net_amount
        WHEN st.transaction_type = 'dividend' THEN -st.net_amount
        ELSE 0
    END as cash_flow_impact
FROM security_transactions st
JOIN users u ON st.user_id = u.user_id
JOIN user_broker_accounts uba ON st.account_id = uba.account_id
JOIN brokers b ON uba.broker_id = b.broker_id
JOIN securities s ON st.security_id = s.security_id
LEFT JOIN user_security_holdings ush ON st.user_id = ush.user_id 
    AND st.account_id = ush.account_id 
    AND st.security_id = ush.security_id
WHERE u.is_active = TRUE
ORDER BY st.transaction_date DESC, st.transaction_id DESC;