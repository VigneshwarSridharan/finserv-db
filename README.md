# Portfolio Management Database Schema

This repository contains the comprehensive database schema definitions for the Portfolio Management Project, designed to help users track and manage their financial investments across multiple asset classes.

## Overview

The database supports tracking of:
- **Financial Securities**: Stocks, bonds, mutual funds, ETFs from various brokers
- **Bank Deposits**: Fixed deposits and recurring deposits across different banks  
- **Physical Assets**: Gold, real estate, and other tangible assets
- **Portfolio Management**: Comprehensive portfolio tracking, performance analysis, and goal setting

## Quick Start

1. **Database Setup**: Create a PostgreSQL database and execute the schema files in order
2. **Sample Data**: Load sample data to explore the features
3. **Views**: Use the provided views for common queries and reporting

## Schema Files

- `schema/01_users.sql` - User management and authentication
- `schema/02_brokers_securities.sql` - Financial instruments and broker accounts
- `schema/03_banks_deposits.sql` - Bank accounts and deposit products
- `schema/04_assets.sql` - Physical assets (gold, real estate, etc.)
- `schema/05_portfolio.sql` - Portfolio management and analytics
- `schema/06_constraints_triggers.sql` - Data integrity and automation
- `schema/07_views.sql` - Pre-built views for common queries
- `schema/08_sample_data.sql` - Sample data for testing

## Key Features

- **Multi-Asset Support**: Track securities, deposits, and physical assets
- **Real-time P&L**: Automatic calculation of profits and losses
- **Goal Tracking**: Set and monitor financial goals
- **Performance Analytics**: Historical performance tracking
- **Asset Allocation**: Monitor and rebalance portfolio allocation
- **Comprehensive Reporting**: Built-in views for portfolio analysis

## Documentation

For detailed documentation, see [schema/README.md](schema/README.md).

## Installation

```bash
# Create database
createdb portfolio_db

# Execute schema files
psql -d portfolio_db -f schema/01_users.sql
psql -d portfolio_db -f schema/02_brokers_securities.sql
psql -d portfolio_db -f schema/03_banks_deposits.sql
psql -d portfolio_db -f schema/04_assets.sql
psql -d portfolio_db -f schema/05_portfolio.sql
psql -d portfolio_db -f schema/06_constraints_triggers.sql
psql -d portfolio_db -f schema/07_views.sql
psql -d portfolio_db -f schema/08_sample_data.sql
```

## Usage Example

```sql
-- Get portfolio overview for a user
SELECT * FROM v_portfolio_overview WHERE user_id = 1;

-- Get security holdings with current values
SELECT * FROM v_security_holdings WHERE user_id = 1;

-- Calculate portfolio summary
SELECT calculate_portfolio_summary(1);
```
