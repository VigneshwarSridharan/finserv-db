#!/bin/bash

# Database Setup Script for finserv-db
# This script sets up the complete database schema

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-finserv}
DB_USER=${DB_USER:-postgres}

echo -e "${GREEN}=== Financial Services Database Setup ===${NC}"
echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local filename=$(basename "$file")
    
    echo -e "${YELLOW}Executing: $filename${NC}"
    
    if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $filename executed successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Error executing $filename${NC}"
        return 1
    fi
}

# Read password securely
echo -n "Enter database password for user '$DB_USER': "
read -s DB_PASSWORD
echo ""
echo ""

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Could not connect to database.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Execute schema files in order
echo -e "${GREEN}=== Executing Schema Files ===${NC}"
echo ""

SCHEMA_DIR="./schema"

if [ ! -d "$SCHEMA_DIR" ]; then
    echo -e "${RED}Error: Schema directory not found at $SCHEMA_DIR${NC}"
    exit 1
fi

# Get all SQL files sorted by name
for file in $(ls -1 "$SCHEMA_DIR"/*.sql | sort); do
    execute_sql_file "$file"
    echo ""
done

echo -e "${GREEN}=== Database Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the created tables"
echo "  2. Load sample data (if needed)"
echo "  3. Configure application connection settings"
echo ""
