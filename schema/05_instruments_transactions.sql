-- 05_instruments_transactions.sql
-- Securities master and transactions

BEGIN;

CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL, -- e.g., AAPL
  isin TEXT,
  cusip TEXT,
  name TEXT NOT NULL,
  type instrument_type NOT NULL,
  currency currency_code NOT NULL,
  country country_code,
  exchange TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (symbol, exchange)
);

CREATE INDEX IF NOT EXISTS instruments_type_idx ON instruments(type);
CREATE INDEX IF NOT EXISTS instruments_currency_idx ON instruments(currency);

CREATE TRIGGER instruments_set_updated_at
BEFORE UPDATE ON instruments
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

-- Holdings accounts mapping (optional if instruments are not account-specific)
CREATE TABLE IF NOT EXISTS account_instruments (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, instrument_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id UUID REFERENCES instruments(id) ON DELETE SET NULL,
  txn_type transaction_type NOT NULL,
  trade_date DATE NOT NULL,
  settle_date DATE,
  quantity NUMERIC(24,8) NOT NULL DEFAULT 0,
  price NUMERIC(24,8) NOT NULL DEFAULT 0,
  fees NUMERIC(24,8) NOT NULL DEFAULT 0,
  taxes NUMERIC(24,8) NOT NULL DEFAULT 0,
  amount NUMERIC(24,8) NOT NULL DEFAULT 0, -- signed cash impact in account currency
  currency currency_code NOT NULL,
  description TEXT,
  external_ref TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (quantity >= 0 OR txn_type IN ('sell','transfer_out','redemption','other'))
);

CREATE INDEX IF NOT EXISTS transactions_account_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_instrument_idx ON transactions(instrument_id);
CREATE INDEX IF NOT EXISTS transactions_trade_date_idx ON transactions(trade_date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(txn_type);

CREATE TRIGGER transactions_set_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

-- Helpful view: signed quantity by type
CREATE OR REPLACE VIEW v_transaction_effects AS
SELECT
  t.*,
  CASE
    WHEN t.txn_type IN ('buy','subscription','bonus','rights','split') THEN t.quantity
    WHEN t.txn_type IN ('sell','redemption','transfer_out','reverse_split') THEN -t.quantity
    ELSE 0
  END AS quantity_effect,
  CASE
    WHEN t.txn_type IN ('buy','subscription') THEN -(t.quantity * t.price + t.fees + t.taxes)
    WHEN t.txn_type IN ('sell','redemption') THEN  (t.quantity * t.price - t.fees - t.taxes)
    WHEN t.txn_type IN ('dividend','interest') THEN t.amount
    WHEN t.txn_type IN ('fee','tax') THEN -t.amount
    ELSE t.amount
  END AS cash_effect
FROM transactions t;

COMMIT;
