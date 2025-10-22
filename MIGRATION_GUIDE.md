# Database Migration Guide

This guide explains how to set up and manage the finserv database schema.

## Quick Start with Docker

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if services are running
docker-compose ps
```

The schema files in the `schema/` directory will be automatically executed when the database container starts for the first time.

### 2. Access pgAdmin

- URL: http://localhost:5050
- Email: admin@finserv.local
- Password: admin

### 3. Connect to Database from pgAdmin

Add a new server with these details:
- Host: postgres
- Port: 5432
- Database: finserv
- Username: finserv_user
- Password: finserv_password

### 4. Load Sample Data (Optional)

```bash
docker exec -i finserv-postgres psql -U finserv_user -d finserv < sample_data.sql
```

## Manual Setup (Without Docker)

### Prerequisites

- PostgreSQL 12 or higher installed
- psql command-line tool

### 1. Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE finserv;
CREATE USER finserv_user WITH ENCRYPTED PASSWORD 'finserv_password';
GRANT ALL PRIVILEGES ON DATABASE finserv TO finserv_user;
\q
```

### 2. Run Setup Script

```bash
# Make the script executable (if not already)
chmod +x setup_database.sh

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=finserv
export DB_USER=finserv_user

# Run the setup script
./setup_database.sh
```

Or execute SQL files manually:

```bash
# Execute each schema file in order
for file in schema/*.sql; do
    psql -U finserv_user -d finserv -f "$file"
done
```

### 3. Load Sample Data (Optional)

```bash
psql -U finserv_user -d finserv -f sample_data.sql
```

## Verification

### Check Tables

```sql
-- List all tables
\dt

-- Expected tables:
-- users, customers, account_types, accounts, fixed_deposits,
-- transactions, fd_interest_payments, audit_logs
```

### Verify Data

```sql
-- Check record counts
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'accounts', COUNT(*) FROM accounts
UNION ALL
SELECT 'fixed_deposits', COUNT(*) FROM fixed_deposits;
```

### Test Functions

```sql
-- Test maturity calculation function
SELECT calculate_fd_maturity_amount(100000, 6.5, 12, 'SIMPLE');
-- Expected: 106500.00

SELECT calculate_fd_maturity_amount(100000, 6.5, 12, 'COMPOUND');
-- Expected: 106500.00 (approximately, compounded annually)
```

## Schema Version Control

### Current Version: 1.0.0

The schema is organized into numbered files for proper ordering:

1. `01_create_users_table.sql` - User authentication
2. `02_create_customers_table.sql` - Customer details & KYC
3. `03_create_account_types_table.sql` - Account type reference
4. `04_create_accounts_table.sql` - Customer accounts
5. `05_create_fixed_deposits_table.sql` - Fixed deposit management
6. `06_create_transactions_table.sql` - Transaction records
7. `07_create_fd_interest_payments_table.sql` - FD interest tracking
8. `08_create_audit_logs_table.sql` - Audit trail

### Adding New Migrations

When adding new schema changes:

1. Create a new file with the next sequential number (e.g., `09_add_new_feature.sql`)
2. Include both UP and DOWN migrations if possible
3. Test on a development database first
4. Update this guide with the new version number
5. Document breaking changes clearly

Example migration file structure:

```sql
-- Migration: 09_add_loan_tables.sql
-- Version: 1.1.0
-- Description: Add loan management tables

-- UP Migration
CREATE TABLE loans (
    loan_id BIGSERIAL PRIMARY KEY,
    -- ... columns ...
);

-- To rollback (DOWN Migration), run:
-- DROP TABLE IF EXISTS loans CASCADE;
```

## Rollback Procedures

### Complete Rollback

```sql
-- Drop all tables (CAUTION: This deletes all data!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS fd_interest_payments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS fixed_deposits CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS account_types CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Partial Rollback

To rollback specific tables, drop them in reverse dependency order.

## Backup and Restore

### Create Backup

```bash
# Full database backup
pg_dump -U finserv_user -d finserv -F c -f finserv_backup_$(date +%Y%m%d).dump

# Schema only
pg_dump -U finserv_user -d finserv -s -f finserv_schema_$(date +%Y%m%d).sql

# Data only
pg_dump -U finserv_user -d finserv -a -f finserv_data_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Restore full backup
pg_restore -U finserv_user -d finserv -c finserv_backup_20251022.dump

# Restore SQL backup
psql -U finserv_user -d finserv -f finserv_schema_20251022.sql
```

## Troubleshooting

### Issue: "relation already exists"

This means the table is already created. Either:
- Drop the existing tables and re-run
- Skip the specific file that's causing the error

### Issue: "permission denied"

Grant necessary permissions:

```sql
GRANT ALL PRIVILEGES ON DATABASE finserv TO finserv_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO finserv_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO finserv_user;
```

### Issue: Docker container won't start

```bash
# Check logs
docker-compose logs postgres

# Remove old volumes and restart
docker-compose down -v
docker-compose up -d
```

### Issue: Connection refused

Check if PostgreSQL is running:

```bash
# For Docker
docker-compose ps

# For system PostgreSQL
sudo systemctl status postgresql
```

## Performance Optimization

After loading data, run:

```sql
-- Analyze tables for query optimization
ANALYZE;

-- Update statistics
VACUUM ANALYZE;
```

## Security Recommendations

For production environments:

1. Change default passwords in `docker-compose.yml` or `.env`
2. Use SSL connections
3. Implement row-level security policies
4. Regular backups
5. Monitor audit logs
6. Implement database encryption at rest

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
- See `queries/useful_queries.sql` for common operations
- See `README.md` for schema documentation
