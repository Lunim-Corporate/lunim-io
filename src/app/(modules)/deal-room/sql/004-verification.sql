-- =============================================================================
-- 04-verification.sql
-- Run after all other scripts to confirm the DB is correctly set up.
-- =============================================================================

-- 1. Hub exists
SELECT id, slug, name, host FROM hubs WHERE slug = 'moonstone';

-- 2. Both price plans exist
SELECT id, code, name, hub_id
FROM price_plans
WHERE hub_id = (SELECT id FROM hubs WHERE slug = 'moonstone');

-- 3. All users have at least one subscription for this hub
SELECT
  (SELECT COUNT(*) FROM users) AS total_users,
  COUNT(DISTINCT s.user_id)    AS users_with_subscription
FROM subscriptions s
JOIN hubs h ON h.id = s.hub_id
WHERE h.slug = 'moonstone';

-- 4. Gold users
SELECT s.user_id, p.code
FROM subscriptions s
JOIN price_plans p ON p.id = s.price_plan_id
JOIN hubs h ON h.id = s.hub_id
WHERE h.slug = 'moonstone'
  AND p.code = 'gold'
  AND s.current = true;

-- 5. Pending access requests
SELECT s.id, s.user_id, s.state, s.created_at
FROM subscriptions s
JOIN hubs h ON h.id = s.hub_id
WHERE h.slug = 'moonstone'
  AND s.state = 'requested'
ORDER BY s.created_at DESC
LIMIT 20;
