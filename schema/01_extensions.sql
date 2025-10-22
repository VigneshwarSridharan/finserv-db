-- 01_extensions.sql
-- Initialize extensions, utility schema, domains, and updated_at trigger function

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- optional, some tools expect it

-- Utility schema
CREATE SCHEMA IF NOT EXISTS util;

-- Domains for consistency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_code') THEN
    CREATE DOMAIN currency_code AS CHAR(3)
      CHECK (VALUE ~ '^[A-Z]{3}$');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'country_code') THEN
    CREATE DOMAIN country_code AS CHAR(2)
      CHECK (VALUE ~ '^[A-Z]{2}$');
  END IF;
END
$$;

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION util.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMIT;
