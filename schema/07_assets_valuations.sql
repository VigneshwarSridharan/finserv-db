-- 07_assets_valuations.sql
-- Generic assets (gold, real estate, others) with valuation history

BEGIN;

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  acquisition_date DATE,
  acquisition_cost NUMERIC(24,2) CHECK (acquisition_cost IS NULL OR acquisition_cost >= 0),
  currency currency_code NOT NULL,
  quantity NUMERIC(24,8) NOT NULL DEFAULT 1, -- e.g., grams for gold
  location TEXT, -- property address or vault info
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assets_user_idx ON assets(user_id);
CREATE INDEX IF NOT EXISTS assets_type_idx ON assets(type);

CREATE TRIGGER assets_set_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

CREATE TABLE IF NOT EXISTS asset_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  valuation_date DATE NOT NULL,
  value_per_unit NUMERIC(24,8) NOT NULL CHECK (value_per_unit >= 0),
  currency currency_code NOT NULL,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (asset_id, valuation_date)
);

CREATE INDEX IF NOT EXISTS asset_valuations_asset_idx ON asset_valuations(asset_id);
CREATE INDEX IF NOT EXISTS asset_valuations_date_idx ON asset_valuations(valuation_date);

CREATE TRIGGER asset_valuations_set_updated_at
BEFORE UPDATE ON asset_valuations
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

COMMIT;
