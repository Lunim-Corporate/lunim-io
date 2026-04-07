-- =============================================================================
-- 00-create-hub.sql
-- Creates the hub record for this deal room deployment.
-- EDIT the slug, name, and host values before running.
-- Safe to re-run — uses INSERT ... WHERE NOT EXISTS.
-- =============================================================================

INSERT INTO hubs (slug, name, host, white_label, created_at, updated_at)
SELECT
  'moonstone',                   -- ← change per deployment
  'Moonstone',                   -- ← human-readable name shown in emails
  'moonstone.example.com',       -- ← production hostname (used for hub detection on login)
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM hubs WHERE slug = 'moonstone'
);

-- Verify
SELECT id, slug, name, host FROM hubs WHERE slug = 'moonstone';
