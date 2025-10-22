# Portfolio Management Database Schema

This repository contains the comprehensive database schema definitions for the Portfolio Management Project, designed to help users track and manage their financial investments across multiple asset classes.

## Overview

The database supports tracking of:
- **Financial Securities**: Stocks, bonds, mutual funds, ETFs from various brokers
- **Bank Deposits**: Fixed deposits and recurring deposits across different banks
- **Physical Assets**: Gold, real estate, and other tangible assets
- **Portfolio Management**: Comprehensive portfolio tracking, performance analysis, and goal setting

## Database Architecture

### Core Components

1. **User Management** (`01_users.sql`)
2. **Brokers & Securities** (`02_brokers_securities.sql`)
3. **Banks & Deposits** (`03_banks_deposits.sql`)
4. **Assets** (`04_assets.sql`)
5. **Portfolio Management** (`05_portfolio.sql`)
6. **Constraints & Triggers** (`06_constraints_triggers.sql`)
7. **Views** (`07_views.sql`)
8. **Sample Data** (`08_sample_data.sql`)

## Schema Details

### 1. User Management Schema

**Tables:**
- `users` - Basic user information and authentication
- `user_profiles` - Extended user profile data including KYC information
- `user_preferences` - User-specific settings and preferences

**Key Features:**
- Secure password hashing
- KYC information storage (PAN, Aadhar)
- Risk profile assessment
- Notification preferences

### 2. Brokers & Securities Schema

**Tables:**
- `brokers` - Financial institutions and broker information
- `user_broker_accounts` - User accounts with different brokers
- `securities` - Master data for all financial instruments
- `security_prices` - Historical and current price data
- `user_security_holdings` - User's current security holdings
- `security_transactions` - All buy/sell transactions

**Key Features:**
- Support for multiple brokers per user
- Comprehensive security master data
- Real-time P&L calculation
- Transaction history tracking
- Support for different security types (stocks, bonds, mutual funds, ETFs)

### 3. Banks & Deposits Schema

**Tables:**
- `banks` - Bank information and details
- `user_bank_accounts` - User bank accounts
- `fixed_deposits` - Fixed deposit investments
- `fd_interest_payments` - Interest payment tracking
- `recurring_deposits` - Recurring deposit investments
- `rd_installments` - Installment payment tracking
- `bank_transactions` - Bank transaction history

**Key Features:**
- Multiple bank account support
- Fixed deposit maturity tracking
- Recurring deposit installment management
- Interest calculation and payment tracking
- Premature withdrawal penalty handling

### 4. Assets Schema

**Tables:**
- `asset_categories` - Asset type classification
- `asset_subcategories` - Detailed asset categorization
- `user_assets` - User's physical and other assets
- `asset_valuations` - Historical asset valuations
- `asset_transactions` - Asset purchase/sale transactions
- `real_estate_details` - Real estate specific information
- `gold_details` - Gold specific information
- `asset_price_indices` - Price indices for automated valuation

**Key Features:**
- Flexible asset categorization
- Real estate property details
- Gold purity and weight tracking
- Insurance information storage
- Automated valuation using price indices
- Support for various asset types (gold, real estate, collectibles)

### 5. Portfolio Management Schema

**Tables:**
- `portfolio_summary` - Consolidated portfolio view
- `portfolio_performance` - Historical performance tracking
- `portfolio_goals` - Financial goals and targets
- `asset_allocation_targets` - Target asset allocation
- `portfolio_alerts` - Custom alerts and notifications
- `portfolio_reports` - Generated reports and analytics
- `user_watchlist` - Securities watchlist
- `portfolio_transactions_log` - Comprehensive transaction logging

**Key Features:**
- Real-time portfolio valuation
- Performance tracking and analytics
- Goal-based investing support
- Asset allocation monitoring
- Custom alert system
- Comprehensive reporting

## Key Features

### Data Integrity
- Comprehensive foreign key relationships
- Check constraints for data validation
- Triggers for automated calculations
- Audit trails for all transactions

### Performance Optimization
- Strategic indexing for fast queries
- Materialized views for complex aggregations
- Partitioning support for large datasets
- Optimized query patterns

### Scalability
- Normalized design for data consistency
- Flexible schema for future enhancements
- Support for multiple asset classes
- Extensible user preference system

### Security
- Password hashing for user authentication
- Data encryption support
- Audit logging for sensitive operations
- Role-based access control ready

## Views

The schema includes comprehensive views for:
- `v_portfolio_overview` - Complete portfolio summary
- `v_security_holdings` - Detailed security holdings
- `v_fixed_deposits` - Fixed deposit details
- `v_recurring_deposits` - Recurring deposit details
- `v_user_assets` - Asset holdings overview
- `v_portfolio_performance` - Performance analytics
- `v_asset_allocation` - Asset allocation analysis
- `v_user_watchlist` - Securities watchlist
- `v_recent_transactions` - Recent transaction history

## Sample Data

The schema includes comprehensive sample data covering:
- 3 sample users with complete profiles
- 4 major brokers (Zerodha, ICICI Direct, HDFC Securities, Angel Broking)
- 4 major banks (SBI, HDFC Bank, ICICI Bank, Axis Bank)
- 7 sample securities across different sectors
- Sample fixed deposits and recurring deposits
- Sample assets including gold and real estate
- Portfolio goals and asset allocation targets
- Watchlist and alert configurations

## Installation

1. Create a PostgreSQL database
2. Execute the SQL files in order:
   ```bash
   psql -d portfolio_db -f schema/01_users.sql
   psql -d portfolio_db -f schema/02_brokers_securities.sql
   psql -d portfolio_db -f schema/03_banks_deposits.sql
   psql -d portfolio_db -f schema/04_assets.sql
   psql -d portfolio_db -f schema/05_portfolio.sql
   psql -d portfolio_db -f schema/06_constraints_triggers.sql
   psql -d portfolio_db -f schema/07_views.sql
   psql -d portfolio_db -f schema/08_sample_data.sql
   ```

## Usage Examples

### Get Portfolio Overview
```sql
SELECT * FROM v_portfolio_overview WHERE user_id = 1;
```

### Get Security Holdings
```sql
SELECT * FROM v_security_holdings WHERE user_id = 1;
```

### Calculate Portfolio Summary
```sql
SELECT calculate_portfolio_summary(1);
```

### Get Asset Allocation
```sql
SELECT * FROM v_asset_allocation WHERE user_id = 1;
```

## Future Enhancements

- Support for cryptocurrency investments
- International securities and currencies
- Advanced analytics and reporting
- Mobile app integration
- Real-time data feeds
- Tax calculation and reporting
- Estate planning features

## Contributing

This schema is designed to be extensible and maintainable. When adding new features:
1. Follow the existing naming conventions
2. Add appropriate indexes for performance
3. Include data validation constraints
4. Update relevant views
5. Add sample data for testing

## License

This database schema is part of the Portfolio Management Project and is available for use in accordance with the project's licensing terms.