-- 04_accounts.sql
-- Brokerage and bank accounts that belong to users at institutions

BEGIN;

-- Generic account base
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  account_number TEXT,
  display_name TEXT NOT NULL,
  currency currency_code NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  opened_on DATE,
  closed_on DATE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (closed_on IS NULL OR opened_on IS NULL OR closed_on >= opened_on)
);

CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_institution_idx ON accounts(institution_id);
CREATE INDEX IF NOT EXISTS accounts_active_idx ON accounts(is_active);

CREATE TRIGGER accounts_set_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

CREATE TABLE IF NOT EXISTS brokerage_accounts (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  broker_client_id TEXT,
  segment TEXT, -- e.g., equity, derivatives
  demat_number TEXT,
  -- Optional: uniqueness of client id may be broker-specific; enforce if desired with a functional
  -- unique index including institution via a trigger-populated column. Keeping simple for portability.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER brokerage_accounts_set_updated_at
BEFORE UPDATE ON brokerage_accounts
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

CREATE TABLE IF NOT EXISTS bank_accounts (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  ifsc_swift TEXT,
  branch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER bank_accounts_set_updated_at
BEFORE UPDATE ON bank_accounts
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

COMMIT;
