-- 02_enums.sql
-- Create enum types used across the schema

BEGIN;

-- instrument_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instrument_type') THEN
    CREATE TYPE instrument_type AS ENUM (
      'stock',
      'bond',
      'mutual_fund',
      'etf',
      'reit',
      'derivative',
      'other_security'
    );
  END IF;
END $$;

-- transaction_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM (
      'buy',
      'sell',
      'dividend',
      'interest',
      'fee',
      'tax',
      'subscription',
      'redemption',
      'transfer_in',
      'transfer_out',
      'bonus',
      'rights',
      'split',
      'reverse_split',
      'other'
    );
  END IF;
END $$;

-- institution_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'institution_type') THEN
    CREATE TYPE institution_type AS ENUM (
      'broker',
      'bank',
      'asset_manager',
      'custodian',
      'registrar',
      'other_institution'
    );
  END IF;
END $$;

-- deposit_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_type') THEN
    CREATE TYPE deposit_type AS ENUM (
      'fixed_deposit',
      'recurring_deposit'
    );
  END IF;
END $$;

-- deposit_status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_status') THEN
    CREATE TYPE deposit_status AS ENUM (
      'open',
      'matured',
      'prematured',
      'closed'
    );
  END IF;
END $$;

-- interest payout frequency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_frequency') THEN
    CREATE TYPE payout_frequency AS ENUM (
      'monthly', 'quarterly', 'half_yearly', 'yearly', 'on_maturity'
    );
  END IF;
END $$;

-- compounding frequency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compounding_frequency') THEN
    CREATE TYPE compounding_frequency AS ENUM (
      'monthly', 'quarterly', 'half_yearly', 'yearly'
    );
  END IF;
END $$;

-- asset_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_type') THEN
    CREATE TYPE asset_type AS ENUM (
      'gold',
      'real_estate',
      'other_asset'
    );
  END IF;
END $$;

COMMIT;
