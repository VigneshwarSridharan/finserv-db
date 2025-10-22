# Portfolio Management Database Schema

A comprehensive database schema for managing personal financial portfolios, including securities, deposits, and physical assets.

## Overview

This repository contains PostgreSQL database schema definitions for a complete portfolio management system that enables users to:

- **Track Financial Securities**: Stocks, bonds, mutual funds, and ETFs across multiple brokers
- **Monitor Deposits**: Fixed deposits (FD) and recurring deposits (RD) from various banks
- **Manage Physical Assets**: Gold, silver, real estate, vehicles, and other valuable assets
- **Analyze Portfolio Performance**: Built-in views and analytics for portfolio insights
- **Set Alerts**: Automated notifications for maturities, expirations, and price targets

## Features

### 1. User Management
- User authentication and session management
- Email verification and account activation
- User preferences and settings

### 2. Securities Portfolio
- Multi-broker account support
- Support for stocks, bonds, mutual funds, and ETFs
- Transaction history tracking (buy, sell, dividend, bonus, split)
- Real-time holdings with profit/loss calculation
- Detailed metadata for bonds and mutual funds

### 3. Banking & Deposits
- Multiple bank account management
- Fixed deposit tracking with auto-renewal options
- Recurring deposit management with payment history
- Interest credit tracking and TDS deduction
- Maturity alerts and notifications

### 4. Asset Management
- **Gold & Silver**: Track physical holdings, digital gold, ETFs, and sovereign gold bonds
- **Real Estate**: Property portfolio with rental income tracking, mortgage details, and document management
- **Other Assets**: Vehicles, art, collectibles, and more
- Asset transaction history (buy, sell, transfer, gift)

### 5. Analytics & Reporting
- Portfolio summary views
- Active holdings across all asset classes
- Performance metrics and unrealized gains/losses
- Custom alerts and notifications

### 6. Audit & Security
- Comprehensive audit logging
- Change tracking with before/after values
- Session management and IP tracking

## Database Schema

### Schema Files

The database schema is organized into modular SQL files:

| File | Description |
|------|-------------|
| `01_users.sql` | User accounts, authentication, and sessions |
| `02_brokers_securities.sql` | Brokers, securities, holdings, and transactions |
| `03_banks_deposits.sql` | Banks, bank accounts, FDs, RDs, and payment tracking |
| `04_assets.sql` | Gold, silver, real estate, and other physical assets |
| `05_portfolio_analytics.sql` | Views, alerts, preferences, and audit logs |
| `06_seed_data.sql` | Initial seed data for lookup tables and sample data |

### Entity Relationship Overview

```
users
├── user_sessions
├── user_broker_accounts
│   └── user_securities_holdings
│       └── securities_transactions
├── user_bank_accounts
│   ├── fixed_deposits
│   │   └── fd_interest_credits
│   └── recurring_deposits
│       └── rd_payment_history
├── gold_holdings
├── silver_holdings
├── real_estate
│   └── real_estate_documents
├── other_assets
├── asset_transactions
├── portfolio_alerts
└── user_preferences
```

### Key Tables

#### User Management
- `users` - User accounts and profile information
- `user_sessions` - Active user sessions
- `user_preferences` - User settings and preferences

#### Securities
- `brokers` - Brokerage firms
- `user_broker_accounts` - User's brokerage accounts
- `securities` - Financial instruments (stocks, bonds, mutual funds)
- `security_types` - Types of securities
- `user_securities_holdings` - Current holdings
- `securities_transactions` - Buy/sell transaction history
- `mutual_funds` - Mutual fund specific details
- `bonds` - Bond specific details

#### Banking & Deposits
- `banks` - Banking institutions
- `user_bank_accounts` - User's bank accounts
- `fixed_deposits` - FD details with maturity tracking
- `recurring_deposits` - RD details with payment tracking
- `rd_payment_history` - Individual RD payment records
- `fd_interest_credits` - FD interest credit history

#### Assets
- `gold_holdings` - Gold assets (physical, digital, ETF, bonds)
- `silver_holdings` - Silver assets
- `real_estate` - Property portfolio
- `real_estate_documents` - Property-related documents
- `other_assets` - Vehicles, art, collectibles, etc.
- `asset_categories` - Asset classification
- `asset_transactions` - Asset buy/sell/transfer history

#### Analytics
- `portfolio_alerts` - User notifications and alerts
- `audit_log` - System-wide audit trail

### Views

Pre-built views for common queries:

- `user_portfolio_summary` - Overview of user's entire portfolio
- `active_securities_holdings` - Current stock/bond/fund holdings with P&L
- `active_fixed_deposits` - Active FDs with days to maturity
- `active_recurring_deposits` - Active RDs with payment status
- `total_gold_holdings` - Aggregated gold holdings by type
- `real_estate_portfolio` - Property portfolio with rental income

## Installation

### Prerequisites
- PostgreSQL 12 or higher
- Database user with CREATE privileges

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finserv-db
   ```

2. **Create a database**
   ```bash
   createdb portfolio_db
   ```

3. **Run the schema files in order**
   ```bash
   psql -d portfolio_db -f schema/01_users.sql
   psql -d portfolio_db -f schema/02_brokers_securities.sql
   psql -d portfolio_db -f schema/03_banks_deposits.sql
   psql -d portfolio_db -f schema/04_assets.sql
   psql -d portfolio_db -f schema/05_portfolio_analytics.sql
   psql -d portfolio_db -f schema/06_seed_data.sql
   ```

4. **Or use the setup script**
   ```bash
   chmod +x scripts/setup_database.sh
   ./scripts/setup_database.sh portfolio_db
   ```

## Usage Examples

### Insert a User
```sql
INSERT INTO users (email, username, password_hash, first_name, last_name)
VALUES ('john.doe@example.com', 'johndoe', 'hashed_password', 'John', 'Doe');
```

### Add a Stock Purchase
```sql
-- First, add the holding
INSERT INTO user_securities_holdings (user_id, account_id, security_id, quantity, average_buy_price, current_price)
VALUES (1, 1, 1, 100, 2500.00, 2600.00);

-- Then, record the transaction
INSERT INTO securities_transactions (user_id, account_id, security_id, transaction_type, quantity, price_per_unit, total_amount, transaction_date)
VALUES (1, 1, 1, 'BUY', 100, 2500.00, 250000.00, '2025-10-01');
```

### Create a Fixed Deposit
```sql
INSERT INTO fixed_deposits (user_id, bank_id, fd_number, principal_amount, interest_rate, tenure_months, start_date, maturity_date, maturity_amount)
VALUES (1, 1, 'FD123456', 500000.00, 7.50, 12, '2025-10-01', '2026-10-01', 537500.00);
```

### Track Gold Purchase
```sql
INSERT INTO gold_holdings (user_id, gold_type, form, weight_grams, purity, purchase_price_per_gram, total_purchase_price, purchase_date)
VALUES (1, 'Physical Gold', 'Coins', 50.00, 99.99, 5500.00, 275000.00, '2025-10-15');
```

### View Portfolio Summary
```sql
SELECT * FROM user_portfolio_summary WHERE user_id = 1;
```

### Check Active Fixed Deposits
```sql
SELECT * FROM active_fixed_deposits WHERE user_id = 1 ORDER BY maturity_date;
```

## Data Types and Constraints

### Currency and Amounts
- All monetary values use `DECIMAL(20, 2)` for precision
- Quantities use `DECIMAL(20, 6)` for fractional shares
- Percentages use `DECIMAL(5, 4)` (e.g., 7.5000 for 7.5%)

### Date and Time
- All timestamps include timezone support
- Automatic `created_at` and `updated_at` tracking
- Date fields for maturity, purchase, and transaction dates

### Validation
- Email format validation using regex
- Enums for status fields (ACTIVE, MATURED, CLOSED, etc.)
- Check constraints for positive amounts and valid ranges
- Unique constraints to prevent duplicate entries

## Security Considerations

1. **Password Storage**: Store only hashed passwords, never plain text
2. **Session Management**: Implement token expiration and IP validation
3. **Audit Logging**: All changes are tracked in `audit_log` table
4. **Sensitive Data**: Consider encryption for PII and financial data
5. **Access Control**: Implement row-level security policies as needed

## Maintenance

### Indexes
All tables include appropriate indexes for:
- Primary keys (automatic)
- Foreign keys
- Frequently queried columns (user_id, dates, status fields)
- Unique constraints

### Triggers (Recommended)
Consider implementing triggers for:
- Updating `updated_at` timestamps
- Calculating maturity amounts automatically
- Populating audit_log on changes
- Sending alerts before maturity dates

### Backup Strategy
- Regular full database backups
- Transaction log backups for point-in-time recovery
- Test restoration procedures periodically

## Extending the Schema

### Adding New Asset Types
1. Add new tables in `04_assets.sql`
2. Update `asset_categories` with new types
3. Create corresponding views in `05_portfolio_analytics.sql`

### Adding New Transaction Types
1. Update CHECK constraints in transaction tables
2. Modify views to include new transaction types
3. Update audit triggers if needed

## Contributing

When contributing to this schema:
1. Maintain naming conventions (snake_case for tables and columns)
2. Add appropriate indexes for foreign keys
3. Include CHECK constraints for data validation
4. Document complex queries and business logic
5. Test migrations before committing

## License

[Specify your license here]

## Support

For questions or issues:
- Create an issue in the repository
- Contact: [your-email@example.com]

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-22  
**Database**: PostgreSQL 12+
