-- =============================================================================
-- 02-backfill-existing-users.sql
-- Assigns an iron subscription to any existing users who don't have one for
-- this hub.  Run AFTER 01-create-price-plans.sql.
-- Safe to re-run — only inserts where no subscription exists.
-- =============================================================================

INSERT INTO subscriptions (
  user_id, price_plan_id, hub_id, current, created_at, updated_at
)
SELECT
  u.id,
  p.id,
  h.id,
  true,
  NOW(),
  NOW()
FROM users u
CROSS JOIN hubs h
JOIN price_plans p ON p.code = 'iron' AND p.hub_id = h.id
WHERE h.slug = 'moonstone'
  AND NOT EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.user_id = u.id
      AND s.hub_id = h.id
  );

-- Verify
SELECT COUNT(*) AS backfilled_users
FROM subscriptions s
JOIN hubs h ON h.id = s.hub_id
JOIN price_plans p ON p.id = s.price_plan_id
WHERE h.slug = 'moonstone'
  AND p.code = 'iron'
  AND s.current = true;
