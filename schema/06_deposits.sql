-- 06_deposits.sql
-- Fixed deposits (FD) and recurring deposits (RD)

BEGIN;

CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(account_id) ON DELETE SET NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  type deposit_type NOT NULL,
  status deposit_status NOT NULL DEFAULT 'open',
  principal NUMERIC(24,2) NOT NULL CHECK (principal >= 0),
  interest_rate NUMERIC(8,4) NOT NULL CHECK (interest_rate >= 0), -- annual %
  compounding compounding_frequency,
  payout payout_frequency NOT NULL,
  currency currency_code NOT NULL,
  started_on DATE NOT NULL,
  matures_on DATE NOT NULL,
  closed_on DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  external_ref TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (matures_on >= started_on),
  CHECK (closed_on IS NULL OR closed_on >= started_on)
);

CREATE INDEX IF NOT EXISTS deposits_user_idx ON deposits(user_id);
CREATE INDEX IF NOT EXISTS deposits_status_idx ON deposits(status);
CREATE INDEX IF NOT EXISTS deposits_dates_idx ON deposits(started_on, matures_on);

CREATE TRIGGER deposits_set_updated_at
BEFORE UPDATE ON deposits
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

-- RD installments (recurring contributions)
CREATE TABLE IF NOT EXISTS deposit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
  due_on DATE NOT NULL,
  paid_on DATE,
  amount NUMERIC(24,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled/paid/missed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deposit_payments_deposit_idx ON deposit_payments(deposit_id);
CREATE INDEX IF NOT EXISTS deposit_payments_due_idx ON deposit_payments(due_on);

CREATE TRIGGER deposit_payments_set_updated_at
BEFORE UPDATE ON deposit_payments
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

COMMIT;
