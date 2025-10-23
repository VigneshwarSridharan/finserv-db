#!/bin/bash
set -e

echo "========================================="
echo "Initializing Portfolio Management Database..."
echo "========================================="

# Note: During docker-entrypoint-initdb.d execution, PostgreSQL is already running
# and we're connected as the POSTGRES_USER to the POSTGRES_DB database

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
  "09_additional_sample_data.sql"
)

for file in "${SCHEMA_FILES[@]}"; do
  if [ -f "/docker-entrypoint-initdb.d/schema/$file" ]; then
    echo "  ✓ Executing $file..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "/docker-entrypoint-initdb.d/schema/$file"
  else
    echo "  ✗ Warning: $file not found, skipping..."
  fi
done

# Create dummy records for understanding (DISABLED - has conflicts with main sample data)
# Uncomment below to load optional dummy data
# echo "Creating dummy data..."
#
# DUMMY_FILES=(
#   "01_dummy_users.sql"
#   "02_dummy_brokers.sql"
#   "03_dummy_securities.sql"
#   "04_dummy_banks.sql"
#   "05_dummy_assets.sql"
#   "06_dummy_portfolio.sql"
#   "07_dummy_transactions.sql"
# )
#
# for file in "${DUMMY_FILES[@]}"; do
#   if [ -f "/docker-entrypoint-initdb.d/schema/dummy/$file" ]; then
#     echo "  ✓ Executing $file..."
#     psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "/docker-entrypoint-initdb.d/schema/dummy/$file"
#   else
#     echo "  ✗ Warning: $file not found, skipping..."
#   fi
# done
echo "Skipping dummy data (disabled to avoid conflicts)"

# Update portfolio summaries
echo "Updating portfolio summaries..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT calculate_portfolio_summary(user_id) FROM users;
EOSQL

echo "========================================="
echo "✓ Database initialization completed successfully!"
echo "========================================="
echo ""
echo "Connection Details:"
echo "  Host: localhost (or 'postgres' from other containers)"
echo "  Port: 5432"
echo "  Database: $POSTGRES_DB"
echo "  Username: $POSTGRES_USER"
echo ""
echo "PgAdmin: http://localhost:8080"
echo "  Email: admin@portfolio.com"
echo "  Password: admin123"
echo "========================================="
