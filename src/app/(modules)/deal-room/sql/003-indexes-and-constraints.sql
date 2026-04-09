-- =============================================================================
-- 03-indexes-and-constraints.sql
-- Adds indexes that speed up the hot paths used by this module:
--   • subscription access checks  (check-access endpoint)
--   • pending-request lookups     (requestAccess + getPendingRequests)
--   • hub/plan lookups            (register + upgradeToGold)
-- All CREATE INDEX statements use IF NOT EXISTS so they are safe to re-run.
-- =============================================================================

-- subscriptions: (user_id, hub_id, current) — used on every page load
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_hub_current
  ON subscriptions (user_id, hub_id, current);

-- subscriptions: (user_id, hub_id, state) — used for pending-request check
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_hub_state
  ON subscriptions (user_id, hub_id, state);

-- subscriptions: (hub_id, state) — used for admin pending-requests list
CREATE INDEX IF NOT EXISTS idx_subscriptions_hub_state
  ON subscriptions (hub_id, state);

-- price_plans: (hub_id, code) — used on register + upgradeToGold
CREATE INDEX IF NOT EXISTS idx_price_plans_hub_code
  ON price_plans (hub_id, code);

-- hubs: slug — used for hub resolution on login/register
CREATE INDEX IF NOT EXISTS idx_hubs_slug
  ON hubs (slug);

-- hubs: host — used for host-based hub detection
CREATE INDEX IF NOT EXISTS idx_hubs_host
  ON hubs (host);

-- emails: (email, confirmed_at) — used on every login
CREATE INDEX IF NOT EXISTS idx_emails_email_confirmed
  ON emails (email, confirmed_at);

-- members: (hub_id, target_type, target_id, primary) — used for profile lookup
CREATE INDEX IF NOT EXISTS idx_members_hub_target_primary
  ON members (hub_id, target_type, target_id, "primary");

-- Verify indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname IN (
  'idx_subscriptions_user_hub_current',
  'idx_subscriptions_user_hub_state',
  'idx_subscriptions_hub_state',
  'idx_price_plans_hub_code',
  'idx_hubs_slug',
  'idx_hubs_host',
  'idx_emails_email_confirmed',
  'idx_members_hub_target_primary'
)
ORDER BY tablename, indexname;
