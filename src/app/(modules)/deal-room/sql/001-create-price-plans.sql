-- =============================================================================
-- 01-create-price-plans.sql
-- Creates iron and gold price plans for the hub.
-- The tech-suite backend auto-creates iron on first registration, but running
-- this script explicitly ensures the plans exist before any user signs up.
-- Safe to re-run — uses INSERT ... WHERE NOT EXISTS.
-- EDIT the hub slug if you changed it in 00-create-hub.sql.
-- =============================================================================

-- Iron (default / free tier assigned on registration)
INSERT INTO price_plans (code, name, hub_id, charge_pence, charge_pence_yearly,
  charge_us_cents, charge_us_cents_yearly, charge_eu_cents, charge_eu_cents_yearly,
  created_at, updated_at)
SELECT
  'iron', 'Iron', h.id,
  0, 0, 0, 0, 0, 0,
  NOW(), NOW()
FROM hubs h
WHERE h.slug = 'moonstone'
  AND NOT EXISTS (
    SELECT 1 FROM price_plans p WHERE p.code = 'iron' AND p.hub_id = h.id
  );

-- Gold (full deal-room access)
INSERT INTO price_plans (code, name, hub_id, charge_pence, charge_pence_yearly,
  charge_us_cents, charge_us_cents_yearly, charge_eu_cents, charge_eu_cents_yearly,
  created_at, updated_at)
SELECT
  'gold', 'Gold', h.id,
  0, 0, 0, 0, 0, 0,
  NOW(), NOW()
FROM hubs h
WHERE h.slug = 'moonstone'
  AND NOT EXISTS (
    SELECT 1 FROM price_plans p WHERE p.code = 'gold' AND p.hub_id = h.id
  );

-- Verify
SELECT id, code, name, hub_id
FROM price_plans
WHERE code IN ('iron', 'gold')
  AND hub_id = (SELECT id FROM hubs WHERE slug = 'moonstone');
