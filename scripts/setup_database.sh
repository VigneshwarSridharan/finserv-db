#!/bin/bash

# Portfolio Management Database Setup Script
# This script creates and initializes the portfolio management database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DB_NAME=${1:-portfolio_db}
DB_USER=${2:-postgres}
DB_HOST=${3:-localhost}
DB_PORT=${4:-5432}

echo -e "${GREEN}Portfolio Management Database Setup${NC}"
echo "===================================="
echo ""
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Database Host: $DB_HOST"
echo "Database Port: $DB_PORT"
echo ""

# Check if PostgreSQL is accessible
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if ! psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL${NC}"
    echo "Please ensure PostgreSQL is running and credentials are correct"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"

# Check if database already exists
echo -e "${YELLOW}Checking if database exists...${NC}"
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Warning: Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "DROP DATABASE $DB_NAME;"
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo -e "${YELLOW}Using existing database${NC}"
    fi
fi

# Create database if it doesn't exist
if ! psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Creating database...${NC}"
    createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCHEMA_DIR="$SCRIPT_DIR/../schema"

# Run schema files in order
echo ""
echo -e "${YELLOW}Running schema files...${NC}"
echo ""

schema_files=(
    "01_users.sql"
    "02_brokers_securities.sql"
    "03_banks_deposits.sql"
    "04_assets.sql"
    "05_portfolio_analytics.sql"
    "06_seed_data.sql"
)

for file in "${schema_files[@]}"; do
    echo -e "${YELLOW}Executing $file...${NC}"
    if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$SCHEMA_DIR/$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $file completed${NC}"
    else
        echo -e "${RED}✗ Error executing $file${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}===================================="
echo "Database setup completed successfully!"
echo "====================================${NC}"
echo ""
echo "You can now connect to the database:"
echo "  psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME"
echo ""
echo "Sample queries to get started:"
echo "  SELECT * FROM user_portfolio_summary;"
echo "  SELECT * FROM active_securities_holdings;"
echo "  SELECT * FROM active_fixed_deposits;"
echo ""
