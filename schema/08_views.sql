-- 08_views.sql
-- Helpful views for portfolio summaries

BEGIN;

-- Latest asset valuation per asset
CREATE OR REPLACE VIEW v_asset_latest_valuation AS
SELECT av.asset_id,
       av.valuation_date,
       av.value_per_unit,
       av.currency
FROM asset_valuations av
JOIN (
  SELECT asset_id, MAX(valuation_date) AS max_date
  FROM asset_valuations
  GROUP BY asset_id
) latest ON latest.asset_id = av.asset_id AND latest.max_date = av.valuation_date;

-- Security positions per account and instrument
-- Aggregates quantities using v_transaction_effects
CREATE OR REPLACE VIEW v_security_positions AS
SELECT
  t.account_id,
  t.instrument_id,
  SUM(t.quantity_effect) AS quantity,
  SUM(CASE WHEN t.txn_type IN ('buy','subscription') THEN (t.quantity * t.price + t.fees + t.taxes)
           WHEN t.txn_type IN ('sell','redemption') THEN -(t.quantity * t.price - t.fees - t.taxes)
           ELSE 0 END) AS net_invested_amount
FROM v_transaction_effects t
GROUP BY t.account_id, t.instrument_id
HAVING SUM(t.quantity_effect) <> 0;

COMMIT;
