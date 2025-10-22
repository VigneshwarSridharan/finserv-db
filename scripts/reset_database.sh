#!/bin/bash

# Portfolio Management Database Reset Script
# Drops all tables and recreates the schema

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

echo -e "${YELLOW}WARNING: This will drop all tables in '$DB_NAME'${NC}"
echo -e "${YELLOW}All data will be permanently deleted!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}Operation cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${RED}Dropping all tables, views, and sequences...${NC}"

# Generate and execute DROP statements
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" <<EOF
-- Drop all views
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END \$\$;

-- Drop all tables
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END \$\$;

-- Drop all sequences
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END \$\$;
EOF

echo -e "${GREEN}✓ All database objects dropped${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run setup script to recreate schema
echo -e "${YELLOW}Recreating database schema...${NC}"
"$SCRIPT_DIR/setup_database.sh" "$DB_NAME" "$DB_USER" "$DB_HOST" "$DB_PORT"

echo ""
echo -e "${GREEN}Database reset completed successfully!${NC}"
