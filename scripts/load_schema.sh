#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/load_schema.sh "$DATABASE_URL" or export PG* env vars
# Accepts either DATABASE_URL env var or standard PG* variables

if [[ ${1:-} != "" ]]; then
  export DATABASE_URL="$1"
fi

run_sql() {
  local file="$1"
  echo "Applying: $file"
  if [[ -n "${DATABASE_URL:-}" ]]; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  else
    psql -v ON_ERROR_STOP=1 -f "$file"
  fi
}

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
SCHEMA_DIR="$ROOT_DIR/schema"

files=(
  "01_extensions.sql"
  "02_enums.sql"
  "03_users_institutions.sql"
  "04_accounts.sql"
  "05_instruments_transactions.sql"
  "06_deposits.sql"
  "07_assets_valuations.sql"
  "08_views.sql"
)

for f in "${files[@]}"; do
  run_sql "$SCHEMA_DIR/$f"
done

echo "Schema applied successfully."
