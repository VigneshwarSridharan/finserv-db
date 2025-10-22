-- 03_users_institutions.sql
-- Users and institutions

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  country country_code,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type institution_type NOT NULL,
  country country_code,
  website TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, type)
);

CREATE INDEX IF NOT EXISTS institutions_type_idx ON institutions(type);

CREATE TRIGGER institutions_set_updated_at
BEFORE UPDATE ON institutions
FOR EACH ROW
EXECUTE FUNCTION util.set_updated_at();

COMMIT;
