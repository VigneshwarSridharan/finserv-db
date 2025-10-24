# Portfolio Management Database Schema

This repository contains the comprehensive database schema definitions for the Portfolio Management Project. The database is designed to help users track and manage their financial investments across multiple asset classes including securities, fixed deposits, recurring deposits, and physical assets.

## 🏗️ Database Architecture

The database is organized into 8 main schema files:

### 1. **Users Schema** (`01_users.sql`)
- **users**: Core user information and authentication
- **user_profiles**: Extended user profile data including KYC information
- **user_preferences**: User-specific settings and preferences

### 2. **Brokers & Securities Schema** (`02_brokers_securities.sql`)
- **brokers**: Financial institutions and broker information
- **user_broker_accounts**: User accounts with different brokers
- **securities**: Master data for stocks, bonds, mutual funds, ETFs
- **security_prices**: Historical and current price data
- **user_security_holdings**: User's current security holdings
- **security_transactions**: All buy/sell transactions

### 3. **Banks & Deposits Schema** (`03_banks_deposits.sql`)
- **banks**: Bank information and details
- **user_bank_accounts**: User bank accounts
- **fixed_deposits**: Fixed deposit investments
- **fd_interest_payments**: Interest payment tracking
- **recurring_deposits**: Recurring deposit investments
- **rd_installments**: Monthly installment tracking
- **bank_transactions**: All bank-related transactions

### 4. **Assets Schema** (`04_assets.sql`)
- **asset_categories**: Asset type classification
- **asset_subcategories**: Detailed asset subcategories
- **user_assets**: User's physical and digital assets
- **asset_valuations**: Historical asset valuations
- **asset_transactions**: Asset purchase/sale transactions
- **real_estate_details**: Property-specific information
- **gold_details**: Gold-specific attributes
- **asset_price_indices**: Price indices for automated valuation

### 5. **Portfolio Management Schema** (`05_portfolio.sql`)
- **portfolio_summary**: Consolidated portfolio view
- **portfolio_performance**: Performance tracking over time
- **portfolio_goals**: Financial goals and targets
- **asset_allocation_targets**: Target asset allocation
- **portfolio_alerts**: Alert and notification system
- **portfolio_reports**: Generated reports and analytics
- **user_watchlist**: Securities watchlist
- **portfolio_transactions_log**: Comprehensive transaction logging

### 6. **Constraints & Triggers** (`06_constraints_triggers.sql`)
- Database constraints for data integrity
- Triggers for automatic timestamp updates
- Functions for portfolio calculations
- Transaction logging triggers

### 7. **Views** (`07_views.sql`)
- **v_portfolio_overview**: Complete portfolio summary
- **v_security_holdings**: Detailed security holdings view
- **v_fixed_deposits**: Fixed deposits with status
- **v_recurring_deposits**: Recurring deposits with progress
- **v_user_assets**: User assets with performance metrics
- **v_portfolio_performance**: Performance analytics
- **v_asset_allocation**: Asset allocation analysis
- **v_user_watchlist**: Watchlist with current prices
- **v_recent_transactions**: Recent transaction history
- **v_security_transactions**: Comprehensive security transaction view with P&L calculations

### 8. **Sample Data** (`08_sample_data.sql`)
- Sample users, brokers, banks, and securities
- Sample transactions and holdings
- Sample assets and portfolio data
- Test data for development and testing

## 🚀 Key Features

### Multi-Asset Portfolio Tracking
- **Securities**: Stocks, bonds, mutual funds, ETFs across multiple brokers
- **Fixed Deposits**: Bank FDs with interest tracking and maturity alerts
- **Recurring Deposits**: Monthly RD tracking with installment management
- **Physical Assets**: Gold, real estate, and other tangible assets

### Advanced Portfolio Management
- **Real-time Valuation**: Current market values and P&L calculations
- **Performance Analytics**: Historical performance tracking and reporting
- **Goal Tracking**: Financial goals with progress monitoring
- **Asset Allocation**: Target vs actual allocation analysis
- **Alert System**: Price alerts, maturity reminders, and goal notifications

### Comprehensive Transaction Management
- **Transaction History**: Complete audit trail of all transactions
- **Cost Basis Tracking**: Accurate cost basis for tax calculations
- **Brokerage & Fees**: Detailed fee and tax tracking
- **Multi-Currency Support**: Built-in currency handling

### Data Integrity & Security
- **Referential Integrity**: Comprehensive foreign key constraints
- **Data Validation**: Check constraints for data quality
- **Audit Trails**: Automatic transaction logging
- **User Isolation**: Complete data separation between users

## 📊 Database Schema Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Users       │    │    Brokers       │    │     Banks       │
│                 │    │                  │    │                 │
│ - user_id (PK)  │    │ - broker_id (PK) │    │ - bank_id (PK)  │
│ - username      │    │ - broker_name    │    │ - bank_name     │
│ - email         │    │ - broker_type    │    │ - bank_type     │
│ - password_hash │    │ - contact_info   │    │ - contact_info  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ User Broker     │    │   Securities     │    │ User Bank       │
│ Accounts        │    │                  │    │ Accounts        │
│                 │    │ - security_id    │    │                 │
│ - account_id    │    │ - symbol         │    │ - account_id    │
│ - user_id (FK)  │    │ - name           │    │ - user_id (FK)  │
│ - broker_id (FK)│    │ - security_type  │    │ - bank_id (FK)  │
│ - account_type  │    │ - exchange       │    │ - account_type  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Security        │    │ Security         │    │ Fixed Deposits  │
│ Holdings        │    │ Transactions     │    │                 │
│                 │    │                  │    │ - fd_id (PK)    │
│ - holding_id    │    │ - transaction_id │    │ - user_id (FK)  │
│ - user_id (FK)  │    │ - user_id (FK)   │    │ - account_id(FK)│
│ - account_id(FK)│    │ - security_id(FK)│    │ - principal_amt │
│ - security_id(FK)│   │ - transaction_type│   │ - interest_rate │
│ - quantity      │    │ - quantity       │    │ - maturity_date │
│ - avg_price     │    │ - price          │    └─────────────────┘
└─────────────────┘    └──────────────────┘             │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Recurring       │
                                               │ Deposits        │
                                               │                 │
                                               │ - rd_id (PK)    │
                                               │ - user_id (FK)  │
                                               │ - account_id(FK)│
                                               │ - monthly_amt   │
                                               │ - tenure_months │
                                               └─────────────────┘
```

## 🛠️ Installation & Setup

### Prerequisites
- PostgreSQL 12+ (recommended: PostgreSQL 14+)
- Database user with CREATE privileges

### Installation Steps

1. **Create Database**
   ```sql
   CREATE DATABASE portfolio_management;
   \c portfolio_management;
   ```

2. **Run Schema Files** (in order)
   ```bash
   psql -d portfolio_management -f schema/01_users.sql
   psql -d portfolio_management -f schema/02_brokers_securities.sql
   psql -d portfolio_management -f schema/03_banks_deposits.sql
   psql -d portfolio_management -f schema/04_assets.sql
   psql -d portfolio_management -f schema/05_portfolio.sql
   psql -d portfolio_management -f schema/06_constraints_triggers.sql
   psql -d portfolio_management -f schema/07_views.sql
   psql -d portfolio_management -f schema/08_sample_data.sql
   ```

3. **Verify Installation**
   ```sql
   -- Check if all tables are created
   \dt
   
   -- Check sample data
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM securities;
   SELECT COUNT(*) FROM user_security_holdings;
   ```

## 📈 Usage Examples

### Portfolio Overview
```sql
-- Get complete portfolio overview for a user
SELECT * FROM v_portfolio_overview WHERE user_id = 1;

-- Get asset allocation analysis
SELECT * FROM v_asset_allocation WHERE user_id = 1;
```

### Security Holdings
```sql
-- Get all security holdings with current values
SELECT * FROM v_security_holdings WHERE user_id = 1;

-- Get top performing securities
SELECT * FROM v_security_holdings 
WHERE user_id = 1 
ORDER BY return_percentage DESC;
```

### Fixed Deposits
```sql
-- Get all fixed deposits with maturity status
SELECT * FROM v_fixed_deposits WHERE user_id = 1;

-- Get FDs maturing in next 30 days
SELECT * FROM v_fixed_deposits 
WHERE user_id = 1 AND days_to_maturity <= 30;
```

### Asset Management
```sql
-- Get all user assets with performance
SELECT * FROM v_user_assets WHERE user_id = 1;

-- Get real estate assets
SELECT * FROM v_user_assets 
WHERE user_id = 1 AND category_name = 'Real Estate';
```

### Security Transactions
```sql
-- Get all transactions for a specific user
SELECT * FROM v_security_transactions WHERE user_id = 1;

-- Get only sell transactions with realized profits
SELECT * FROM v_security_transactions 
WHERE transaction_type = 'sell' AND realized_pnl > 0
ORDER BY realized_pnl DESC;

-- Get user transaction summary
SELECT 
    user_name,
    COUNT(transaction_id) as total_transactions,
    COUNT(CASE WHEN transaction_type = 'buy' THEN 1 END) as buy_count,
    COUNT(CASE WHEN transaction_type = 'sell' THEN 1 END) as sell_count,
    SUM(CASE WHEN transaction_type = 'buy' THEN net_amount ELSE 0 END) as total_invested,
    SUM(CASE WHEN transaction_type = 'sell' THEN net_amount ELSE 0 END) as total_redeemed
FROM v_security_transactions
WHERE user_id = 1
GROUP BY user_name;
```

## 📊 Security Transaction View (`v_security_transactions`)

The `v_security_transactions` view provides comprehensive transaction analysis with:

### Key Features
- User and account information (username, broker, account details)
- Security details (symbol, name, type, exchange, sector, industry, ISIN)
- Transaction details (type, date, quantity, price, amounts)
- Charge breakdown (brokerage, taxes, other charges)
- Calculated metrics:
  - **Effective price per unit** (including all charges)
  - **Total charges** and charges percentage
  - **Realized P&L** for sell transactions
  - **Return percentage** for completed trades
  - **Unrealized P&L contribution** for active holdings
  - **Days held** for sell transactions
  - **Cash flow impact** (positive for buy, negative for sell/dividend)
- Transaction classification (Acquisition, Disposal, Income)

### Common Analysis Queries

#### Portfolio Performance Analysis
```sql
-- Calculate realized returns for all sold securities
SELECT 
    symbol,
    security_name,
    COUNT(*) as times_sold,
    SUM(quantity) as total_quantity_sold,
    AVG(return_percentage) as avg_return_pct,
    SUM(realized_pnl) as total_realized_pnl,
    AVG(days_held) as avg_holding_days
FROM v_security_transactions
WHERE transaction_type = 'sell'
GROUP BY symbol, security_name
ORDER BY total_realized_pnl DESC;
```

#### Trading Cost Analysis
```sql
-- Analyze trading costs by broker
SELECT 
    broker_name,
    COUNT(*) as total_trades,
    SUM(total_amount) as total_volume,
    SUM(brokerage) as total_brokerage,
    SUM(taxes) as total_taxes,
    SUM(total_charges) as total_charges,
    ROUND(AVG(charges_percentage), 2) as avg_charge_pct
FROM v_security_transactions
GROUP BY broker_name
ORDER BY total_volume DESC;
```

#### Tax Planning - Short Term vs Long Term
```sql
-- Classify gains by holding period
SELECT 
    CASE 
        WHEN days_held <= 365 THEN 'Short Term'
        ELSE 'Long Term'
    END as capital_gain_type,
    COUNT(*) as transaction_count,
    SUM(realized_pnl) as total_gain,
    AVG(return_percentage) as avg_return_pct
FROM v_security_transactions
WHERE transaction_type = 'sell' AND days_held IS NOT NULL
GROUP BY 
    CASE 
        WHEN days_held <= 365 THEN 'Short Term'
        ELSE 'Long Term'
    END;
```

#### Win/Loss Analysis
```sql
-- Calculate win rate and statistics
WITH sell_stats AS (
    SELECT 
        COUNT(*) as total_sells,
        COUNT(CASE WHEN realized_pnl > 0 THEN 1 END) as winning_trades,
        COUNT(CASE WHEN realized_pnl < 0 THEN 1 END) as losing_trades,
        AVG(CASE WHEN realized_pnl > 0 THEN realized_pnl END) as avg_win,
        AVG(CASE WHEN realized_pnl < 0 THEN ABS(realized_pnl) END) as avg_loss,
        SUM(realized_pnl) as total_pnl
    FROM v_security_transactions
    WHERE transaction_type = 'sell' AND realized_pnl IS NOT NULL
)
SELECT 
    total_sells,
    winning_trades,
    losing_trades,
    ROUND((winning_trades::NUMERIC / total_sells) * 100, 2) as win_rate_pct,
    avg_win,
    avg_loss,
    ROUND(avg_win / NULLIF(avg_loss, 0), 2) as win_loss_ratio,
    total_pnl
FROM sell_stats;
```

#### Sector Performance Analysis
```sql
-- Analyze performance by sector
SELECT 
    sector,
    COUNT(DISTINCT security_id) as securities_count,
    COUNT(*) as total_sells,
    AVG(return_percentage) as avg_return_pct,
    SUM(realized_pnl) as total_realized_pnl,
    AVG(days_held) as avg_holding_days
FROM v_security_transactions
WHERE transaction_type = 'sell' AND sector IS NOT NULL
GROUP BY sector
ORDER BY avg_return_pct DESC;
```

#### Monthly Transaction Analysis
```sql
-- Track monthly investment patterns
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN transaction_type = 'buy' THEN net_amount ELSE 0 END) as total_invested,
    SUM(CASE WHEN transaction_type = 'sell' THEN net_amount ELSE 0 END) as total_redeemed
FROM v_security_transactions
WHERE user_id = 1
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;
```

## 🔧 Maintenance & Updates

### Portfolio Summary Updates
```sql
-- Update portfolio summary for a specific user
SELECT calculate_portfolio_summary(1);

-- Update portfolio summary for all users
SELECT calculate_portfolio_summary(user_id) FROM users;
```

### Performance Tracking
```sql
-- Insert daily performance record
INSERT INTO portfolio_performance (user_id, performance_date, total_portfolio_value, total_investment, total_pnl, total_return_percentage)
SELECT user_id, CURRENT_DATE, 
       COALESCE(securities_value, 0) + COALESCE(fixed_deposits_value, 0) + COALESCE(recurring_deposits_value, 0) + COALESCE(assets_value, 0),
       COALESCE(securities_investment, 0) + COALESCE(fd_investment, 0) + COALESCE(rd_investment, 0) + COALESCE(assets_investment, 0),
       COALESCE(securities_value, 0) + COALESCE(fixed_deposits_value, 0) + COALESCE(recurring_deposits_value, 0) + COALESCE(assets_value, 0) - 
       (COALESCE(securities_investment, 0) + COALESCE(fd_investment, 0) + COALESCE(rd_investment, 0) + COALESCE(assets_investment, 0)),
       CASE WHEN (COALESCE(securities_investment, 0) + COALESCE(fd_investment, 0) + COALESCE(rd_investment, 0) + COALESCE(assets_investment, 0)) > 0 
            THEN ((COALESCE(securities_value, 0) + COALESCE(fixed_deposits_value, 0) + COALESCE(recurring_deposits_value, 0) + COALESCE(assets_value, 0)) - 
                  (COALESCE(securities_investment, 0) + COALESCE(fd_investment, 0) + COALESCE(rd_investment, 0) + COALESCE(assets_investment, 0))) / 
                  (COALESCE(securities_investment, 0) + COALESCE(fd_investment, 0) + COALESCE(rd_investment, 0) + COALESCE(assets_investment, 0)) * 100
            ELSE 0 END
FROM v_portfolio_overview;
```

## 🔒 Security Considerations

- All user data is isolated by user_id
- Password hashes are stored (never plain text)
- Sensitive data like PAN/Aadhar numbers are stored with proper constraints
- All transactions are logged for audit purposes
- Foreign key constraints ensure data integrity

## 📝 License

This database schema is part of the Portfolio Management Project and is intended for educational and development purposes.

## 🤝 Contributing

When contributing to this schema:

1. Maintain backward compatibility
2. Add proper indexes for new queries
3. Include sample data for new tables
4. Update views if schema changes affect them
5. Test all constraints and triggers
6. Update this README with any new features

## 📞 Support

For questions or issues with the database schema, please refer to the project documentation or contact the development team.