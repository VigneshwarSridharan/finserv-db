# Example SQL Queries

This document contains useful SQL queries for common portfolio management operations.

## User Management

### Create a New User
```sql
INSERT INTO users (email, username, password_hash, first_name, last_name, date_of_birth)
VALUES (
    'jane.smith@example.com',
    'janesmith',
    '$2b$12$hashed_password_here',
    'Jane',
    'Smith',
    '1990-05-15'
);
```

### Get User Profile with Preferences
```sql
SELECT 
    u.*,
    up.default_currency,
    up.notification_enabled,
    up.alert_days_before_maturity
FROM users u
LEFT JOIN user_preferences up ON u.user_id = up.user_id
WHERE u.email = 'jane.smith@example.com';
```

## Securities Portfolio

### Add a Broker Account
```sql
INSERT INTO user_broker_accounts (user_id, broker_id, account_number, account_type, account_holder_name, opened_date)
VALUES (1, 1, 'ZD123456', 'Trading', 'Jane Smith', '2025-01-15');
```

### Record Stock Purchase
```sql
-- First, record the transaction
INSERT INTO securities_transactions (
    user_id, account_id, security_id, transaction_type, 
    quantity, price_per_unit, total_amount, fees, taxes, transaction_date
)
VALUES (
    1, 1, 1, 'BUY', 
    50, 2850.00, 142500.00, 50.00, 75.00, '2025-10-15'
);

-- Then, update or insert the holding
INSERT INTO user_securities_holdings (user_id, account_id, security_id, quantity, average_buy_price, current_price)
VALUES (1, 1, 1, 50, 2850.00, 2850.00)
ON CONFLICT (user_id, account_id, security_id) 
DO UPDATE SET 
    quantity = user_securities_holdings.quantity + EXCLUDED.quantity,
    average_buy_price = (
        (user_securities_holdings.quantity * user_securities_holdings.average_buy_price) + 
        (EXCLUDED.quantity * EXCLUDED.average_buy_price)
    ) / (user_securities_holdings.quantity + EXCLUDED.quantity);
```

### View Current Portfolio Value
```sql
SELECT 
    s.symbol,
    s.security_name,
    st.type_name,
    ush.quantity,
    ush.average_buy_price,
    ush.current_price,
    (ush.quantity * ush.average_buy_price) as invested_amount,
    (ush.quantity * ush.current_price) as current_value,
    ((ush.current_price - ush.average_buy_price) * ush.quantity) as unrealized_pnl,
    (((ush.current_price - ush.average_buy_price) / ush.average_buy_price) * 100) as return_percentage
FROM user_securities_holdings ush
JOIN securities s ON ush.security_id = s.security_id
JOIN security_types st ON s.security_type_id = st.security_type_id
WHERE ush.user_id = 1 AND ush.quantity > 0
ORDER BY current_value DESC;
```

### Get Transaction History for a Security
```sql
SELECT 
    st.transaction_date,
    st.transaction_type,
    st.quantity,
    st.price_per_unit,
    st.total_amount,
    st.fees,
    st.taxes,
    (st.total_amount + st.fees + st.taxes) as total_cost
FROM securities_transactions st
JOIN securities s ON st.security_id = s.security_id
WHERE st.user_id = 1 
    AND s.symbol = 'RELIANCE'
ORDER BY st.transaction_date DESC;
```

### Calculate Sector-wise Allocation
```sql
SELECT 
    s.sector,
    COUNT(DISTINCT ush.security_id) as num_securities,
    SUM(ush.quantity * ush.current_price) as total_value,
    ROUND(
        (SUM(ush.quantity * ush.current_price) / 
         (SELECT SUM(quantity * current_price) FROM user_securities_holdings WHERE user_id = 1) * 100),
        2
    ) as allocation_percentage
FROM user_securities_holdings ush
JOIN securities s ON ush.security_id = s.security_id
WHERE ush.user_id = 1 AND ush.quantity > 0
GROUP BY s.sector
ORDER BY total_value DESC;
```

## Fixed and Recurring Deposits

### Create a Fixed Deposit
```sql
INSERT INTO fixed_deposits (
    user_id, bank_id, account_id, fd_number, 
    principal_amount, interest_rate, tenure_months, 
    start_date, maturity_date, maturity_amount, 
    interest_payout_frequency, auto_renew
)
VALUES (
    1, 1, 1, 'FD2025001',
    1000000.00, 7.25, 36,
    '2025-10-01', '2028-10-01', 1245000.00,
    'At Maturity', TRUE
);
```

### View FDs Maturing in Next 90 Days
```sql
SELECT 
    b.bank_name,
    fd.fd_number,
    fd.principal_amount,
    fd.interest_rate,
    fd.maturity_date,
    fd.maturity_amount,
    (fd.maturity_date - CURRENT_DATE) as days_to_maturity,
    (fd.maturity_amount - fd.principal_amount) as interest_earned
FROM fixed_deposits fd
JOIN banks b ON fd.bank_id = b.bank_id
WHERE fd.user_id = 1 
    AND fd.status = 'ACTIVE'
    AND fd.maturity_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY fd.maturity_date;
```

### Calculate Total FD Investment and Returns
```sql
SELECT 
    COUNT(*) as total_fds,
    SUM(fd.principal_amount) as total_invested,
    SUM(CASE WHEN fd.status = 'ACTIVE' THEN fd.principal_amount ELSE 0 END) as active_investment,
    SUM(CASE WHEN fd.status = 'MATURED' THEN fd.maturity_amount ELSE 0 END) as matured_amount,
    AVG(fd.interest_rate) as average_interest_rate
FROM fixed_deposits fd
WHERE fd.user_id = 1;
```

### Create a Recurring Deposit
```sql
INSERT INTO recurring_deposits (
    user_id, bank_id, account_id, rd_number,
    monthly_installment, interest_rate, tenure_months,
    start_date, maturity_date, maturity_amount,
    total_installments, auto_debit
)
VALUES (
    1, 2, 2, 'RD2025001',
    10000.00, 6.75, 60,
    '2025-10-01', '2030-10-01', 700000.00,
    60, TRUE
);
```

### Record RD Payment
```sql
INSERT INTO rd_payment_history (
    rd_id, payment_date, amount, payment_mode, transaction_reference
)
VALUES (
    1, '2025-10-05', 10000.00, 'Auto Debit', 'TXN123456789'
);

-- Update RD installments paid
UPDATE recurring_deposits
SET installments_paid = installments_paid + 1,
    last_payment_date = '2025-10-05'
WHERE rd_id = 1;
```

### Check RD Payment Status
```sql
SELECT 
    rd.rd_number,
    b.bank_name,
    rd.monthly_installment,
    rd.total_installments,
    rd.installments_paid,
    (rd.total_installments - rd.installments_paid) as remaining_installments,
    rd.last_payment_date,
    (rd.monthly_installment * rd.installments_paid) as total_paid,
    rd.maturity_amount
FROM recurring_deposits rd
JOIN banks b ON rd.bank_id = b.bank_id
WHERE rd.user_id = 1 AND rd.status = 'ACTIVE';
```

## Gold and Precious Metals

### Add Gold Purchase
```sql
INSERT INTO gold_holdings (
    user_id, gold_type, form, weight_grams, purity,
    purchase_price_per_gram, total_purchase_price, 
    purchase_date, vendor_name, storage_location
)
VALUES (
    1, 'Physical Gold', 'Coins', 100.00, 99.99,
    6200.00, 620000.00,
    '2025-10-10', 'Tanishq', 'Bank Locker'
);
```

### Calculate Gold Holdings Summary
```sql
SELECT 
    gold_type,
    form,
    COUNT(*) as num_holdings,
    SUM(weight_grams) as total_weight,
    SUM(total_purchase_price) as total_invested,
    AVG(purchase_price_per_gram) as avg_purchase_price,
    (SELECT MAX(current_price_per_gram) FROM gold_holdings WHERE user_id = 1) as current_market_price,
    (SUM(weight_grams) * (SELECT MAX(current_price_per_gram) FROM gold_holdings WHERE user_id = 1)) as current_value
FROM gold_holdings
WHERE user_id = 1
GROUP BY gold_type, form;
```

### Update Current Gold Prices
```sql
UPDATE gold_holdings
SET current_price_per_gram = 6500.00,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;
```

## Real Estate Portfolio

### Add Property
```sql
INSERT INTO real_estate (
    user_id, property_type, property_subtype, property_name,
    address_line1, city, state, postal_code,
    area_sqft, purchase_price, current_valuation, purchase_date,
    ownership_type, ownership_percentage, is_mortgaged
)
VALUES (
    1, 'Residential', 'Apartment', 'Park View Apartment 401',
    '123 Park Avenue', 'Mumbai', 'Maharashtra', '400001',
    1200.00, 8500000.00, 9500000.00, '2023-05-15',
    'Freehold', 100.00, FALSE
);
```

### Add Property with Rental Income
```sql
INSERT INTO real_estate (
    user_id, property_type, property_subtype,
    city, state, area_sqft, purchase_price, current_valuation,
    purchase_date, is_rented, monthly_rental_income,
    tenant_name, lease_start_date, lease_end_date
)
VALUES (
    1, 'Commercial', 'Shop',
    'Bangalore', 'Karnataka', 800.00, 5000000.00, 6000000.00,
    '2022-03-01', TRUE, 45000.00,
    'ABC Retail Pvt Ltd', '2024-04-01', '2027-03-31'
);
```

### Calculate Real Estate Portfolio Summary
```sql
SELECT 
    property_type,
    COUNT(*) as total_properties,
    SUM(area_sqft) as total_area_sqft,
    SUM(purchase_price) as total_invested,
    SUM(current_valuation) as current_total_value,
    SUM(current_valuation - purchase_price) as total_appreciation,
    ROUND(((SUM(current_valuation) - SUM(purchase_price)) / SUM(purchase_price) * 100), 2) as appreciation_percentage,
    SUM(CASE WHEN is_rented THEN monthly_rental_income * 12 ELSE 0 END) as annual_rental_income
FROM real_estate
WHERE user_id = 1
GROUP BY property_type;
```

### Properties with Expiring Leases (Next 6 Months)
```sql
SELECT 
    property_name,
    city,
    tenant_name,
    monthly_rental_income,
    lease_end_date,
    (lease_end_date - CURRENT_DATE) as days_to_expiry
FROM real_estate
WHERE user_id = 1 
    AND is_rented = TRUE
    AND lease_end_date <= CURRENT_DATE + INTERVAL '6 months'
ORDER BY lease_end_date;
```

## Portfolio Analytics

### Overall Portfolio Summary
```sql
SELECT 
    -- Securities
    (SELECT COALESCE(SUM(quantity * current_price), 0) 
     FROM user_securities_holdings 
     WHERE user_id = 1) as securities_value,
    
    -- Fixed Deposits
    (SELECT COALESCE(SUM(principal_amount), 0) 
     FROM fixed_deposits 
     WHERE user_id = 1 AND status = 'ACTIVE') as fd_value,
    
    -- Recurring Deposits (total paid so far)
    (SELECT COALESCE(SUM(monthly_installment * installments_paid), 0) 
     FROM recurring_deposits 
     WHERE user_id = 1 AND status = 'ACTIVE') as rd_value,
    
    -- Gold
    (SELECT COALESCE(SUM(weight_grams * current_price_per_gram), 0) 
     FROM gold_holdings 
     WHERE user_id = 1) as gold_value,
    
    -- Real Estate
    (SELECT COALESCE(SUM(current_valuation), 0) 
     FROM real_estate 
     WHERE user_id = 1) as real_estate_value,
    
    -- Total Portfolio Value
    (SELECT COALESCE(SUM(quantity * current_price), 0) FROM user_securities_holdings WHERE user_id = 1) +
    (SELECT COALESCE(SUM(principal_amount), 0) FROM fixed_deposits WHERE user_id = 1 AND status = 'ACTIVE') +
    (SELECT COALESCE(SUM(monthly_installment * installments_paid), 0) FROM recurring_deposits WHERE user_id = 1 AND status = 'ACTIVE') +
    (SELECT COALESCE(SUM(weight_grams * current_price_per_gram), 0) FROM gold_holdings WHERE user_id = 1) +
    (SELECT COALESCE(SUM(current_valuation), 0) FROM real_estate WHERE user_id = 1)
    as total_portfolio_value;
```

### Monthly Income Summary
```sql
SELECT 
    -- Rental Income
    COALESCE(SUM(monthly_rental_income), 0) as total_rental_income,
    
    -- FD Interest (prorated monthly for annual/quarterly payouts)
    (SELECT COALESCE(SUM(
        CASE 
            WHEN interest_payout_frequency = 'Monthly' THEN (principal_amount * interest_rate / 100 / 12)
            WHEN interest_payout_frequency = 'Quarterly' THEN (principal_amount * interest_rate / 100 / 4) / 3
            WHEN interest_payout_frequency = 'Annual' THEN (principal_amount * interest_rate / 100 / 12)
            ELSE 0
        END
    ), 0)
    FROM fixed_deposits 
    WHERE user_id = 1 AND status = 'ACTIVE') as estimated_monthly_fd_interest,
    
    -- Total Monthly Passive Income
    COALESCE(SUM(monthly_rental_income), 0) +
    (SELECT COALESCE(SUM(
        CASE 
            WHEN interest_payout_frequency = 'Monthly' THEN (principal_amount * interest_rate / 100 / 12)
            ELSE 0
        END
    ), 0)
    FROM fixed_deposits WHERE user_id = 1 AND status = 'ACTIVE')
    as total_monthly_passive_income
    
FROM real_estate
WHERE user_id = 1 AND is_rented = TRUE;
```

### Top Performing Securities (Last Year)
```sql
WITH purchase_summary AS (
    SELECT 
        security_id,
        SUM(CASE WHEN transaction_type = 'BUY' THEN quantity ELSE 0 END) as total_bought,
        SUM(CASE WHEN transaction_type = 'SELL' THEN quantity ELSE 0 END) as total_sold,
        SUM(CASE WHEN transaction_type = 'BUY' THEN total_amount ELSE 0 END) as total_invested
    FROM securities_transactions
    WHERE user_id = 1 
        AND transaction_date >= CURRENT_DATE - INTERVAL '1 year'
    GROUP BY security_id
)
SELECT 
    s.symbol,
    s.security_name,
    ps.total_invested,
    (ush.quantity * ush.current_price) as current_value,
    ((ush.quantity * ush.current_price) - ps.total_invested) as absolute_gain,
    ROUND((((ush.quantity * ush.current_price) - ps.total_invested) / ps.total_invested * 100), 2) as return_percentage
FROM purchase_summary ps
JOIN securities s ON ps.security_id = s.security_id
LEFT JOIN user_securities_holdings ush ON s.security_id = ush.security_id AND ush.user_id = 1
WHERE ps.total_invested > 0
ORDER BY return_percentage DESC
LIMIT 10;
```

## Alerts and Notifications

### Create Maturity Alerts for FDs
```sql
INSERT INTO portfolio_alerts (user_id, alert_type, alert_category, reference_id, alert_message, alert_date)
SELECT 
    user_id,
    'FD_MATURITY',
    'Deposit',
    fd_id,
    'Your FD ' || fd_number || ' of ₹' || principal_amount || ' will mature on ' || maturity_date,
    maturity_date - INTERVAL '30 days'
FROM fixed_deposits
WHERE status = 'ACTIVE' 
    AND maturity_date > CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM portfolio_alerts 
        WHERE alert_type = 'FD_MATURITY' 
            AND reference_id = fixed_deposits.fd_id
            AND is_dismissed = FALSE
    );
```

### Get Unread Alerts
```sql
SELECT 
    alert_type,
    alert_category,
    alert_message,
    alert_date,
    created_at
FROM portfolio_alerts
WHERE user_id = 1 
    AND is_read = FALSE
    AND is_dismissed = FALSE
    AND alert_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY alert_date, created_at;
```

### Mark Alerts as Read
```sql
UPDATE portfolio_alerts
SET is_read = TRUE
WHERE user_id = 1 AND alert_id IN (1, 2, 3);
```

## Data Maintenance

### Update All Current Security Prices (Batch Update)
```sql
-- Example: Update prices from external source
UPDATE user_securities_holdings ush
SET current_price = price_data.new_price,
    last_updated = CURRENT_TIMESTAMP
FROM (VALUES
    (1, 2900.00),  -- security_id, new_price
    (2, 3850.00),
    (3, 1520.00)
) AS price_data(security_id, new_price)
WHERE ush.security_id = price_data.security_id;
```

### Clean Up Old Sessions
```sql
DELETE FROM user_sessions
WHERE expires_at < CURRENT_TIMESTAMP
    OR (is_active = FALSE AND created_at < CURRENT_DATE - INTERVAL '30 days');
```

### Archive Completed Transactions (Older than 5 years)
```sql
-- Create archive table first
CREATE TABLE IF NOT EXISTS securities_transactions_archive (LIKE securities_transactions);

-- Move old transactions
INSERT INTO securities_transactions_archive
SELECT * FROM securities_transactions
WHERE transaction_date < CURRENT_DATE - INTERVAL '5 years';

-- Delete from main table
DELETE FROM securities_transactions
WHERE transaction_date < CURRENT_DATE - INTERVAL '5 years';
```

## Reporting Queries

### Year-to-Date Investment Summary
```sql
SELECT 
    'Securities' as category,
    SUM(total_amount) as ytd_investment
FROM securities_transactions
WHERE user_id = 1 
    AND transaction_type = 'BUY'
    AND transaction_date >= DATE_TRUNC('year', CURRENT_DATE)

UNION ALL

SELECT 
    'Fixed Deposits' as category,
    SUM(principal_amount) as ytd_investment
FROM fixed_deposits
WHERE user_id = 1 
    AND start_date >= DATE_TRUNC('year', CURRENT_DATE)

UNION ALL

SELECT 
    'Gold' as category,
    SUM(total_purchase_price) as ytd_investment
FROM gold_holdings
WHERE user_id = 1 
    AND purchase_date >= DATE_TRUNC('year', CURRENT_DATE)

ORDER BY ytd_investment DESC;
```

---

**Note**: Replace user_id values (1) with actual user IDs in your application. All currency values in examples are in Indian Rupees (INR).
