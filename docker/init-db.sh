#!/bin/bash
set -e

echo "Initializing Portfolio Management Database..."

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U portfolio_user; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Create database if it doesn't exist
psql -h localhost -U portfolio_user -d portfolio_management -c "SELECT 1" > /dev/null 2>&1 || {
  echo "Creating database portfolio_management..."
  createdb -h localhost -U portfolio_user portfolio_management
}

# Execute schema files in order
echo "Executing schema files..."

SCHEMA_FILES=(
  "01_users.sql"
  "02_brokers_securities.sql"
  "03_banks_deposits.sql"
  "04_assets.sql"
  "05_portfolio.sql"
  "06_constraints_triggers.sql"
  "07_views.sql"
  "08_sample_data.sql"
)

for file in "${SCHEMA_FILES[@]}"; do
  echo "Executing $file..."
  psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/$file"
done

# Create additional sample data
echo "Creating additional sample data..."
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/09_additional_sample_data.sql"

# Create dummy records for understanding
echo "Creating dummy records for understanding..."
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/01_dummy_users.sql"
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/02_dummy_brokers.sql"
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/03_dummy_securities.sql"
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/04_dummy_banks.sql"
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/05_dummy_assets.sql"
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/06_dummy_portfolio.sql"
psql -h localhost -U portfolio_user -d portfolio_management -f "/docker-entrypoint-initdb.d/schema/dummy/07_dummy_transactions.sql"

# Update portfolio summaries
echo "Updating portfolio summaries..."
psql -h localhost -U portfolio_user -d portfolio_management -c "
SELECT calculate_portfolio_summary(user_id) FROM users;
"

echo "Database initialization completed successfully!"
echo "You can now connect to the database using:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: portfolio_management"
echo "  Username: portfolio_user"
echo "  Password: portfolio_password"
echo ""
echo "PgAdmin is available at: http://localhost:8080"
echo "  Email: admin@portfolio.com"
echo "  Password: admin123"