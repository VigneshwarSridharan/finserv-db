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

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose v3.8+

### 1. Start the Database Stack

```bash
# Clone the repository
git clone <repository-url>
cd portfolio-management-db

# Start all services (PostgreSQL, PgAdmin, Redis)
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Access the Services

- **PostgreSQL Database**: `localhost:5432`
  - Database: `portfolio_management`
  - Username: `portfolio_user`
  - Password: `portfolio_password`

- **PgAdmin Web Interface**: http://localhost:8080
  - Email: `admin@portfolio.com`
  - Password: `admin123`

- **Redis Cache**: `localhost:6379`

### 3. Run Setup Script (Optional)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run automated setup
./scripts/setup.sh

# Run setup with example queries
./scripts/setup.sh --with-examples
```

## 📊 Manual Installation

### Prerequisites
- PostgreSQL 12+ (recommended: PostgreSQL 14+)
- Database user with CREATE privileges

### Installation Steps

```bash
# Create database
createdb portfolio_management

# Execute schema files (in order)
psql -d portfolio_management -f schema/01_users.sql
psql -d portfolio_management -f schema/02_brokers_securities.sql
psql -d portfolio_management -f schema/03_banks_deposits.sql
psql -d portfolio_management -f schema/04_assets.sql
psql -d portfolio_management -f schema/05_portfolio.sql
psql -d portfolio_management -f schema/06_constraints_triggers.sql
psql -d portfolio_management -f schema/07_views.sql
psql -d portfolio_management -f schema/08_sample_data.sql
psql -d portfolio_management -f schema/09_additional_sample_data.sql
```

## 📊 Usage Examples

### Basic Portfolio Queries

```sql
-- Get complete portfolio overview for a user
SELECT * FROM v_portfolio_overview WHERE user_id = 1;

-- Get security holdings with performance metrics
SELECT 
    symbol, security_name, sector,
    quantity, average_price, current_price,
    total_investment, current_value, unrealized_pnl,
    return_percentage
FROM v_security_holdings 
WHERE user_id = 1
ORDER BY current_value DESC;

-- Get fixed deposits with maturity status
SELECT 
    bank_name, fd_number, principal_amount,
    interest_rate, maturity_date, status,
    days_to_maturity
FROM v_fixed_deposits 
WHERE user_id = 1
ORDER BY maturity_date;

-- Get asset allocation analysis
SELECT 
    asset_type, target_percentage, current_percentage,
    allocation_status, deviation_percentage
FROM v_asset_allocation 
WHERE user_id = 1;
```

### Advanced Analytics

```sql
-- Get portfolio performance over time
SELECT 
    performance_date, total_portfolio_value,
    total_return_percentage, day_change_percentage
FROM v_portfolio_performance 
WHERE user_id = 1
ORDER BY performance_date DESC;

-- Get top performing securities across all users
SELECT 
    symbol, security_name, sector,
    COUNT(*) as holders_count,
    AVG(return_percentage) as avg_return_percentage
FROM v_security_holdings
GROUP BY symbol, security_name, sector
ORDER BY avg_return_percentage DESC;

-- Get portfolio goals with progress
SELECT 
    goal_name, goal_type, target_amount,
    current_amount, progress_percentage,
    days_remaining
FROM portfolio_goals 
WHERE user_id = 1
ORDER BY priority DESC;
```

### Run Example Queries

```bash
# Using Docker
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/queries.sql

# Using local PostgreSQL
psql -d portfolio_management -f examples/queries.sql
```

### Understanding Database Structure

```bash
# Run understanding queries to explore database relationships
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/understanding_queries.sql

# Or with local PostgreSQL
psql -d portfolio_management -f examples/understanding_queries.sql
```

## 🛠️ Database Management

### Backup and Restore

```bash
# Create backup
./scripts/backup.sh --compress

# List existing backups
./scripts/backup.sh --list

# Restore from backup
./scripts/backup.sh --restore backups/portfolio_backup_20240115_120000.sql
```

### Maintenance Commands

```bash
# Update portfolio summaries
docker exec portfolio_db psql -U portfolio_user -d portfolio_management -c "SELECT calculate_portfolio_summary(user_id) FROM users;"

# Check database health
docker exec portfolio_db psql -U portfolio_user -d portfolio_management -c "SELECT version();"

# View logs
docker-compose logs -f postgres
```

## 📁 Repository Structure

```
portfolio-management-db/
├── README.md                    # This file
├── docker-compose.yml          # Docker Compose configuration
├── .env.example                # Environment variables template
├── schema/                     # Database schema files
│   ├── 01_users.sql           # User management schema
│   ├── 02_brokers_securities.sql # Brokers and securities schema
│   ├── 03_banks_deposits.sql  # Banks and deposits schema
│   ├── 04_assets.sql          # Assets schema
│   ├── 05_portfolio.sql       # Portfolio management schema
│   ├── 06_constraints_triggers.sql # Constraints and triggers
│   ├── 07_views.sql           # Database views
│   ├── 08_sample_data.sql     # Sample data
│   ├── 09_additional_sample_data.sql # Additional sample data
│   └── README.md              # Detailed schema documentation
├── examples/                   # Example queries and usage
│   └── queries.sql            # Comprehensive example queries
├── docker/                    # Docker configuration
│   ├── README.md             # Docker setup documentation
│   ├── init-db.sh            # Database initialization script
│   └── Dockerfile            # Custom PostgreSQL image
├── scripts/                   # Utility scripts
│   ├── setup.sh              # Automated setup script
│   └── backup.sh             # Backup and restore script
└── backups/                   # Database backups (created automatically)
```

## 📚 Documentation

- **Main Documentation**: [README.md](README.md) - This file
- **Schema Documentation**: [schema/README.md](schema/README.md) - Detailed database schema
- **Docker Setup**: [docker/README.md](docker/README.md) - Docker configuration and usage
- **Example Queries**: [examples/queries.sql](examples/queries.sql) - Comprehensive query examples
