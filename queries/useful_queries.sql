-- Useful Queries for Financial Services Database

-- ==========================================
-- FIXED DEPOSIT QUERIES
-- ==========================================

-- 1. Get all active Fixed Deposits with customer details
SELECT 
    fd.fd_number,
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    fd.principal_amount,
    fd.interest_rate,
    fd.tenure_months,
    fd.deposit_date,
    fd.maturity_date,
    fd.maturity_amount,
    fd.fd_status
FROM fixed_deposits fd
JOIN customers c ON fd.customer_id = c.customer_id
JOIN users u ON c.user_id = u.user_id
WHERE fd.fd_status = 'ACTIVE'
ORDER BY fd.deposit_date DESC;

-- 2. Get Fixed Deposits maturing in the next 30 days
SELECT 
    fd.fd_number,
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email,
    u.phone_number,
    fd.principal_amount,
    fd.maturity_amount,
    fd.maturity_date,
    fd.maturity_date - CURRENT_DATE AS days_to_maturity
FROM fixed_deposits fd
JOIN customers c ON fd.customer_id = c.customer_id
JOIN users u ON c.user_id = u.user_id
WHERE fd.fd_status = 'ACTIVE'
    AND fd.maturity_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY fd.maturity_date ASC;

-- 3. Calculate total interest earned on all FDs by customer
SELECT 
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    COUNT(fd.fd_id) AS total_fds,
    SUM(fd.principal_amount) AS total_principal,
    SUM(fd.maturity_amount - fd.principal_amount) AS total_interest_to_earn
FROM customers c
JOIN users u ON c.user_id = u.user_id
LEFT JOIN fixed_deposits fd ON c.customer_id = fd.customer_id
WHERE fd.fd_status IN ('ACTIVE', 'MATURED')
GROUP BY c.customer_number, u.first_name, u.last_name
ORDER BY total_principal DESC;

-- 4. Get FD interest payment history
SELECT 
    fd.fd_number,
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    ip.payment_date,
    ip.interest_amount,
    ip.tax_deducted,
    ip.net_amount,
    ip.payment_status
FROM fd_interest_payments ip
JOIN fixed_deposits fd ON ip.fd_id = fd.fd_id
JOIN customers c ON fd.customer_id = c.customer_id
JOIN users u ON c.user_id = u.user_id
ORDER BY ip.payment_date DESC;

-- 5. Calculate expected interest for an FD (using the helper function)
SELECT 
    fd_number,
    principal_amount,
    interest_rate,
    tenure_months,
    interest_type,
    calculate_fd_maturity_amount(principal_amount, interest_rate, tenure_months, interest_type) AS calculated_maturity,
    maturity_amount AS stored_maturity
FROM fixed_deposits
WHERE fd_status = 'ACTIVE';

-- ==========================================
-- ACCOUNT QUERIES
-- ==========================================

-- 6. Get customer portfolio overview
SELECT 
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    COUNT(DISTINCT a.account_id) AS total_accounts,
    COUNT(DISTINCT fd.fd_id) AS total_fds,
    COALESCE(SUM(a.current_balance), 0) AS total_account_balance,
    COALESCE(SUM(fd.principal_amount), 0) AS total_fd_principal,
    COALESCE(SUM(a.current_balance), 0) + COALESCE(SUM(fd.principal_amount), 0) AS total_portfolio_value
FROM customers c
JOIN users u ON c.user_id = u.user_id
LEFT JOIN accounts a ON c.customer_id = a.customer_id AND a.account_status = 'ACTIVE'
LEFT JOIN fixed_deposits fd ON c.customer_id = fd.customer_id AND fd.fd_status = 'ACTIVE'
GROUP BY c.customer_number, u.first_name, u.last_name
ORDER BY total_portfolio_value DESC;

-- 7. Get account transaction history
SELECT 
    t.transaction_reference,
    t.transaction_type,
    t.transaction_amount,
    t.transaction_status,
    t.description,
    t.balance_after,
    t.transaction_date
FROM transactions t
WHERE t.from_account_id = 1 OR t.to_account_id = 1
ORDER BY t.transaction_date DESC
LIMIT 50;

-- ==========================================
-- CUSTOMER QUERIES
-- ==========================================

-- 8. Get customers pending KYC verification
SELECT 
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email,
    u.phone_number,
    c.kyc_status,
    c.created_at
FROM customers c
JOIN users u ON c.user_id = u.user_id
WHERE c.kyc_status IN ('PENDING', 'IN_PROGRESS')
ORDER BY c.created_at ASC;

-- 9. Get high-risk customers
SELECT 
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    c.risk_rating,
    c.annual_income,
    COUNT(DISTINCT a.account_id) AS total_accounts,
    COUNT(DISTINCT fd.fd_id) AS total_fds,
    COALESCE(SUM(a.current_balance), 0) AS total_balance
FROM customers c
JOIN users u ON c.user_id = u.user_id
LEFT JOIN accounts a ON c.customer_id = a.customer_id
LEFT JOIN fixed_deposits fd ON c.customer_id = fd.customer_id
WHERE c.risk_rating = 'HIGH'
GROUP BY c.customer_number, u.first_name, u.last_name, c.risk_rating, c.annual_income
ORDER BY total_balance DESC;

-- ==========================================
-- ANALYTICS & REPORTING QUERIES
-- ==========================================

-- 10. Daily deposit summary
SELECT 
    DATE(t.transaction_date) AS transaction_date,
    COUNT(*) AS total_deposits,
    SUM(t.transaction_amount) AS total_amount
FROM transactions t
WHERE t.transaction_type = 'DEPOSIT'
    AND t.transaction_status = 'COMPLETED'
    AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(t.transaction_date)
ORDER BY transaction_date DESC;

-- 11. FD statistics by interest rate range
SELECT 
    CASE 
        WHEN interest_rate < 5 THEN '0-5%'
        WHEN interest_rate < 7 THEN '5-7%'
        WHEN interest_rate < 9 THEN '7-9%'
        ELSE '9%+'
    END AS interest_rate_range,
    COUNT(*) AS total_fds,
    SUM(principal_amount) AS total_principal,
    AVG(tenure_months) AS avg_tenure_months
FROM fixed_deposits
WHERE fd_status = 'ACTIVE'
GROUP BY interest_rate_range
ORDER BY interest_rate_range;

-- 12. Monthly FD creation trend
SELECT 
    DATE_TRUNC('month', deposit_date) AS month,
    COUNT(*) AS fds_created,
    SUM(principal_amount) AS total_principal,
    AVG(principal_amount) AS avg_principal
FROM fixed_deposits
WHERE deposit_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', deposit_date)
ORDER BY month DESC;

-- 13. Customer lifetime value (CLV)
SELECT 
    c.customer_number,
    u.first_name || ' ' || u.last_name AS customer_name,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'DEPOSIT' THEN t.transaction_amount ELSE 0 END), 0) AS total_deposits,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'WITHDRAWAL' THEN t.transaction_amount ELSE 0 END), 0) AS total_withdrawals,
    COUNT(DISTINCT a.account_id) AS total_accounts,
    COUNT(DISTINCT fd.fd_id) AS total_fds_created,
    EXTRACT(DAYS FROM CURRENT_DATE - c.created_at) AS days_as_customer
FROM customers c
JOIN users u ON c.user_id = u.user_id
LEFT JOIN accounts a ON c.customer_id = a.customer_id
LEFT JOIN fixed_deposits fd ON c.customer_id = fd.customer_id
LEFT JOIN transactions t ON (t.from_account_id = a.account_id OR t.to_account_id = a.account_id)
GROUP BY c.customer_number, u.first_name, u.last_name, c.created_at
ORDER BY total_deposits DESC;

-- 14. Audit trail for specific FD
SELECT 
    al.audit_id,
    al.action_type,
    al.action_description,
    al.username,
    al.old_values,
    al.new_values,
    al.created_at
FROM audit_logs al
WHERE al.table_name = 'fixed_deposits'
    AND al.record_id = 1
ORDER BY al.created_at DESC;

-- 15. Account balance summary by account type
SELECT 
    at.account_type_name,
    COUNT(a.account_id) AS total_accounts,
    SUM(a.current_balance) AS total_balance,
    AVG(a.current_balance) AS avg_balance,
    MIN(a.current_balance) AS min_balance,
    MAX(a.current_balance) AS max_balance
FROM accounts a
JOIN account_types at ON a.account_type_id = at.account_type_id
WHERE a.account_status = 'ACTIVE'
GROUP BY at.account_type_name
ORDER BY total_balance DESC;
