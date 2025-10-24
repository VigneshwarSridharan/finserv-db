-- =====================================================
-- Generated Columns Migration
-- =====================================================
-- This file adds generated columns to the user_security_holdings table
-- Run this AFTER the main migrations have been applied
--
-- These columns are computed by PostgreSQL automatically and cannot be
-- set manually. They are always calculated based on other column values.

-- Drop existing columns if they exist (in case they were created as regular columns)
ALTER TABLE user_security_holdings 
  DROP COLUMN IF EXISTS total_investment,
  DROP COLUMN IF EXISTS current_value,
  DROP COLUMN IF EXISTS unrealized_pnl;

-- Add generated columns
ALTER TABLE user_security_holdings
  ADD COLUMN total_investment DECIMAL(15,2) GENERATED ALWAYS AS (quantity * average_price) STORED,
  ADD COLUMN current_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity * COALESCE(current_price, average_price)) STORED,
  ADD COLUMN unrealized_pnl DECIMAL(15,2) GENERATED ALWAYS AS (quantity * (COALESCE(current_price, average_price) - average_price)) STORED;

-- Verify the columns were created
SELECT column_name, data_type, is_generated, generation_expression
FROM information_schema.columns
WHERE table_name = 'user_security_holdings'
  AND column_name IN ('total_investment', 'current_value', 'unrealized_pnl');

