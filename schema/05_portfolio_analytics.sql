-- Portfolio Analytics and Reporting Schema
-- Provides views and tables for portfolio analysis and reporting

-- Portfolio Summary View
CREATE OR REPLACE VIEW user_portfolio_summary AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(DISTINCT ush.security_id) as total_securities,
    COUNT(DISTINCT fd.fd_id) as total_fixed_deposits,
    COUNT(DISTINCT rd.rd_id) as total_recurring_deposits,
    COUNT(DISTINCT gh.gold_id) as total_gold_holdings,
    COUNT(DISTINCT re.property_id) as total_properties
FROM users u
LEFT JOIN user_securities_holdings ush ON u.user_id = ush.user_id
LEFT JOIN fixed_deposits fd ON u.user_id = fd.user_id
LEFT JOIN recurring_deposits rd ON u.user_id = rd.user_id
LEFT JOIN gold_holdings gh ON u.user_id = gh.user_id
LEFT JOIN real_estate re ON u.user_id = re.user_id
GROUP BY u.user_id, u.username, u.email;

-- Active Securities Holdings View
CREATE OR REPLACE VIEW active_securities_holdings AS
SELECT 
    ush.holding_id,
    ush.user_id,
    u.username,
    s.symbol,
    s.security_name,
    st.type_name as security_type,
    ush.quantity,
    ush.average_buy_price,
    ush.current_price,
    (ush.quantity * ush.current_price) as current_value,
    (ush.quantity * (ush.current_price - ush.average_buy_price)) as unrealized_gain_loss,
    ush.purchase_date,
    b.broker_name,
    uba.account_number
FROM user_securities_holdings ush
JOIN users u ON ush.user_id = u.user_id
JOIN securities s ON ush.security_id = s.security_id
JOIN security_types st ON s.security_type_id = st.security_type_id
LEFT JOIN user_broker_accounts uba ON ush.account_id = uba.account_id
LEFT JOIN brokers b ON uba.broker_id = b.broker_id
WHERE ush.quantity > 0;

-- Active Fixed Deposits View
CREATE OR REPLACE VIEW active_fixed_deposits AS
SELECT 
    fd.fd_id,
    fd.user_id,
    u.username,
    b.bank_name,
    fd.fd_number,
    fd.principal_amount,
    fd.interest_rate,
    fd.tenure_months,
    fd.start_date,
    fd.maturity_date,
    fd.maturity_amount,
    fd.interest_payout_frequency,
    EXTRACT(DAY FROM (fd.maturity_date - CURRENT_DATE)) as days_to_maturity,
    fd.status
FROM fixed_deposits fd
JOIN users u ON fd.user_id = u.user_id
JOIN banks b ON fd.bank_id = b.bank_id
WHERE fd.status = 'ACTIVE';

-- Active Recurring Deposits View
CREATE OR REPLACE VIEW active_recurring_deposits AS
SELECT 
    rd.rd_id,
    rd.user_id,
    u.username,
    b.bank_name,
    rd.rd_number,
    rd.monthly_installment,
    rd.interest_rate,
    rd.tenure_months,
    rd.total_installments,
    rd.installments_paid,
    (rd.total_installments - rd.installments_paid) as installments_remaining,
    rd.start_date,
    rd.maturity_date,
    rd.maturity_amount,
    EXTRACT(DAY FROM (rd.maturity_date - CURRENT_DATE)) as days_to_maturity,
    rd.status
FROM recurring_deposits rd
JOIN users u ON rd.user_id = u.user_id
JOIN banks b ON rd.bank_id = b.bank_id
WHERE rd.status = 'ACTIVE';

-- Total Gold Holdings View
CREATE OR REPLACE VIEW total_gold_holdings AS
SELECT 
    gh.user_id,
    u.username,
    gh.gold_type,
    SUM(gh.weight_grams) as total_weight_grams,
    AVG(gh.purchase_price_per_gram) as avg_purchase_price_per_gram,
    SUM(gh.total_purchase_price) as total_invested,
    MAX(gh.current_price_per_gram) as current_price_per_gram,
    SUM(gh.weight_grams * gh.current_price_per_gram) as current_value
FROM gold_holdings gh
JOIN users u ON gh.user_id = u.user_id
GROUP BY gh.user_id, u.username, gh.gold_type;

-- Real Estate Portfolio View
CREATE OR REPLACE VIEW real_estate_portfolio AS
SELECT 
    re.property_id,
    re.user_id,
    u.username,
    re.property_type,
    re.property_subtype,
    re.property_name,
    re.city,
    re.state,
    re.area_sqft,
    re.purchase_price,
    re.current_valuation,
    re.is_mortgaged,
    re.outstanding_loan_amount,
    re.is_rented,
    re.monthly_rental_income,
    (re.monthly_rental_income * 12) as annual_rental_income,
    CASE 
        WHEN re.current_valuation IS NOT NULL 
        THEN ((re.current_valuation - re.purchase_price) / re.purchase_price * 100)
        ELSE NULL 
    END as appreciation_percentage
FROM real_estate re
JOIN users u ON re.user_id = u.user_id;

-- Alerts and Notifications Table
CREATE TABLE IF NOT EXISTS portfolio_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'FD_MATURITY', 'RD_PAYMENT_DUE', 'INSURANCE_EXPIRY', 'PRICE_TARGET'
    alert_category VARCHAR(50), -- 'Deposit', 'Security', 'Asset', 'Document'
    reference_id BIGINT, -- ID of the related entity
    alert_message TEXT NOT NULL,
    alert_date DATE NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (alert_type IN ('FD_MATURITY', 'RD_PAYMENT_DUE', 'INSURANCE_EXPIRY', 'PRICE_TARGET', 'DOCUMENT_EXPIRY', 'LEASE_EXPIRY'))
);

-- User Preferences for Portfolio Management
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    default_currency VARCHAR(3) DEFAULT 'USD',
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    alert_days_before_maturity INT DEFAULT 30, -- Days before FD/RD maturity to alert
    alert_days_before_expiry INT DEFAULT 15, -- Days before document/insurance expiry to alert
    display_mode VARCHAR(20) DEFAULT 'LIGHT', -- 'LIGHT', 'DARK'
    date_format VARCHAR(20) DEFAULT 'DD-MM-YYYY',
    number_format VARCHAR(20) DEFAULT 'en-US',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log for Tracking Changes
CREATE TABLE IF NOT EXISTS audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_portfolio_alerts_user_id ON portfolio_alerts(user_id);
CREATE INDEX idx_portfolio_alerts_type ON portfolio_alerts(alert_type);
CREATE INDEX idx_portfolio_alerts_date ON portfolio_alerts(alert_date);
CREATE INDEX idx_portfolio_alerts_is_read ON portfolio_alerts(is_read);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);
