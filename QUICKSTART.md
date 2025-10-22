# Quick Start Guide

Get started with the Portfolio Management Database in 5 minutes!

## Prerequisites

- PostgreSQL 12+ installed and running
- Basic knowledge of SQL
- Terminal/Command line access

## Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd finserv-db
```

### Step 2: Create and Setup Database
```bash
# Using the setup script (recommended)
./scripts/setup_database.sh portfolio_db

# OR manually
createdb portfolio_db
psql -d portfolio_db -f schema/01_users.sql
psql -d portfolio_db -f schema/02_brokers_securities.sql
psql -d portfolio_db -f schema/03_banks_deposits.sql
psql -d portfolio_db -f schema/04_assets.sql
psql -d portfolio_db -f schema/05_portfolio_analytics.sql
psql -d portfolio_db -f schema/06_seed_data.sql
```

### Step 3: Verify Installation
```bash
psql -d portfolio_db -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
```

You should see approximately 30+ tables.

## Your First Data

### 1. Create a User
```sql
psql -d portfolio_db

INSERT INTO users (email, username, password_hash, first_name, last_name)
VALUES ('demo@example.com', 'demouser', 'hashed_password_123', 'Demo', 'User')
RETURNING user_id;
```

Note the `user_id` returned (let's assume it's `1`).

### 2. Add a Stock Purchase
```sql
-- Record the transaction
INSERT INTO securities_transactions (
    user_id, security_id, transaction_type, 
    quantity, price_per_unit, total_amount, transaction_date
)
VALUES (1, 1, 'BUY', 10, 2850.00, 28500.00, CURRENT_DATE);

-- Add to holdings
INSERT INTO user_securities_holdings (
    user_id, security_id, quantity, average_buy_price, current_price
)
VALUES (1, 1, 10, 2850.00, 2900.00);
```

### 3. Create a Fixed Deposit
```sql
INSERT INTO fixed_deposits (
    user_id, bank_id, fd_number, principal_amount, 
    interest_rate, tenure_months, start_date, maturity_date, maturity_amount
)
VALUES (
    1, 1, 'FD001', 100000.00, 
    7.00, 12, CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months', 107000.00
);
```

### 4. Add Gold Holdings
```sql
INSERT INTO gold_holdings (
    user_id, gold_type, form, weight_grams, purity,
    purchase_price_per_gram, total_purchase_price, purchase_date
)
VALUES (
    1, 'Physical Gold', 'Coins', 10.00, 99.99,
    6000.00, 60000.00, CURRENT_DATE
);
```

### 5. View Your Portfolio
```sql
-- Overall summary
SELECT * FROM user_portfolio_summary WHERE user_id = 1;

-- Securities holdings
SELECT 
    s.symbol,
    s.security_name,
    h.quantity,
    h.average_buy_price,
    h.current_price,
    (h.quantity * h.current_price) as current_value
FROM user_securities_holdings h
JOIN securities s ON h.security_id = s.security_id
WHERE h.user_id = 1;

-- Active FDs
SELECT 
    b.bank_name,
    fd.fd_number,
    fd.principal_amount,
    fd.interest_rate,
    fd.maturity_date
FROM fixed_deposits fd
JOIN banks b ON fd.bank_id = b.bank_id
WHERE fd.user_id = 1 AND fd.status = 'ACTIVE';

-- Gold holdings
SELECT 
    gold_type,
    SUM(weight_grams) as total_grams,
    SUM(total_purchase_price) as invested
FROM gold_holdings
WHERE user_id = 1
GROUP BY gold_type;
```

## Common Operations

### Update Stock Prices
```sql
UPDATE user_securities_holdings
SET current_price = 2950.00,
    last_updated = CURRENT_TIMESTAMP
WHERE user_id = 1 AND security_id = 1;
```

### Record a Stock Sale
```sql
-- Record the transaction
INSERT INTO securities_transactions (
    user_id, security_id, transaction_type,
    quantity, price_per_unit, total_amount, transaction_date
)
VALUES (1, 1, 'SELL', 5, 2950.00, 14750.00, CURRENT_DATE);

-- Update holdings
UPDATE user_securities_holdings
SET quantity = quantity - 5
WHERE user_id = 1 AND security_id = 1;
```

### Check Upcoming FD Maturities
```sql
SELECT 
    fd_number,
    principal_amount,
    maturity_date,
    maturity_amount,
    (maturity_date - CURRENT_DATE) as days_remaining
FROM fixed_deposits
WHERE user_id = 1 
    AND status = 'ACTIVE'
    AND maturity_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY maturity_date;
```

## Useful Views

The schema includes pre-built views for common queries:

```sql
-- Portfolio overview
SELECT * FROM user_portfolio_summary;

-- All active stock holdings with P&L
SELECT * FROM active_securities_holdings;

-- Active FDs
SELECT * FROM active_fixed_deposits;

-- Active RDs
SELECT * FROM active_recurring_deposits;

-- Gold holdings summary
SELECT * FROM total_gold_holdings;

-- Real estate portfolio
SELECT * FROM real_estate_portfolio;
```

## Sample Data

The database includes sample data for:
- 10 Indian banks (SBI, HDFC, ICICI, etc.)
- 7 popular brokers (Zerodha, Upstox, etc.)
- 10 common Indian stocks (Reliance, TCS, Infosys, etc.)
- Security types (Stock, Bond, Mutual Fund, ETF)
- Asset categories (Gold, Silver, Real Estate, etc.)

## Next Steps

1. **Explore the documentation:**
   - [README.md](README.md) - Overview and installation
   - [docs/EXAMPLE_QUERIES.md](docs/EXAMPLE_QUERIES.md) - More query examples
   - [docs/SCHEMA_DESIGN.md](docs/SCHEMA_DESIGN.md) - Design decisions
   - [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) - Entity relationships

2. **Build your application:**
   - Use your favorite programming language
   - Implement proper authentication
   - Add business logic layer
   - Create RESTful APIs

3. **Customize the schema:**
   - Add custom fields as needed
   - Create additional views
   - Add triggers for automation
   - Implement row-level security

## Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection
psql -d portfolio_db -c "SELECT version();"
```

### Reset Database
```bash
# Warning: This deletes all data!
./scripts/reset_database.sh portfolio_db
```

### Verify Tables
```sql
-- List all tables
\dt

-- Check a specific table
\d users

-- Count records
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'securities', COUNT(*) FROM securities
UNION ALL
SELECT 'banks', COUNT(*) FROM banks;
```

## Support

- **Documentation Issues**: Open an issue on GitHub
- **Questions**: Check [docs/EXAMPLE_QUERIES.md](docs/EXAMPLE_QUERIES.md) first
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## Example Application Flow

Here's how a typical application would use this schema:

```
1. User Registration
   → Insert into `users` table
   → Create entry in `user_preferences`

2. User Login
   → Verify credentials
   → Create entry in `user_sessions`

3. Add Investment
   → Securities: `securities_transactions` + `user_securities_holdings`
   → FD: `fixed_deposits`
   → Gold: `gold_holdings`

4. View Portfolio
   → Query `user_portfolio_summary`
   → Query specific asset views

5. Get Alerts
   → Query `portfolio_alerts` for unread notifications

6. Generate Reports
   → Use pre-built views or custom queries
   → Calculate returns, allocations, etc.
```

## Tips

- Always filter by `user_id` for security
- Use transactions for multi-table operations
- Update `current_price` regularly for accurate portfolio values
- Create alerts for important dates (FD maturity, lease expiry, etc.)
- Use the audit log for tracking changes
- Implement connection pooling in your application
- Create database backups regularly

---

Happy Portfolio Management! 📊💰🚀
