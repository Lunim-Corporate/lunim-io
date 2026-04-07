# Database Scripts — Complete Guide

All scripts live in `sql/` and must be run against the PostgreSQL database
that tech-suite uses. For Moonstone: user = `shree`, database = `tabb_dev_moonstone`.

---

## Quick reference

```bash
# Run all scripts in order (from cake-shop root)
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/000-create-hub.sql"
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/001-create-price-plans.sql"
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/002-backfill-existing-users.sql"
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/003-indexes-and-constraints.sql"
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/004-verification.sql"
```

All scripts are **idempotent** — safe to run multiple times without creating duplicates.

---

## What each script does and why

### 000-create-hub.sql

**What:** Inserts a row into the `hubs` table for this deal room deployment.

**Why:** Every user, subscription, price plan, and access check in tech-suite is
scoped to a hub ID. Without a hub record, the backend cannot resolve which plans
or subscriptions to check, and registration fails to assign the correct hub.

**Before running:** Open the file and edit these three values:
```sql
'moonstone'             -- slug  (used in all other scripts)
'Moonstone'             -- name  (shown in emails sent by tech-suite)
'moonstone.tabb.cc'     -- host  (used for hub auto-detection on login/register)
```

**EXample output:**
```
INSERT 0 1           ← new hub created
 id | slug      | name      | host
  3 | moonstone | Moonstone | moonstone.tabb.cc
```
Or if it already exists:
```
INSERT 0 0           ← skipped, already exists
 id | slug      | name      | host
  3 | moonstone | Moonstone | moonstone.tabb.cc
```

---

### 001-create-price-plans.sql

**What:** Creates `iron` and `gold` price plans linked to the hub.

**Why:** Iron is the free default tier every new user gets on registration.
Gold is the full-access tier. The tech-suite `register()` function looks up the
iron plan by code+hub_id and assigns it to new users. If iron doesn't exist,
registration still creates the user but they get no subscription row at all.
Gold must exist before any admin can approve a request-access.

**Example output:**
```
INSERT 0 1           ← iron created
INSERT 0 1           ← gold created
 id | code | name | hub_id
 12 | iron | Iron |      3
 15 | gold | Gold |      3
```
Or zeros if they already exist — no duplicates created.

---

### 002-backfill-existing-users.sql

**What:** Assigns an iron subscription to every user who doesn't already have
one for this hub.

**Why :** When the deal room module is rolled out to an
existing app that already has users, those users have no subscription row for
the hub. The `check-access` endpoint returns `{ tier: null }` for them.
This backfill gives them the correct iron baseline so the state machine works
as designed.

**Moonstone status:** Before running — 9,723 total users, 1,176 with subscriptions.
After running — 9,723 users with subscriptions (8,547 rows inserted).

**Example output:**
```
INSERT 0 8547        ← number of new iron subscriptions created
 backfilled_users
          8547       ← or total iron current users after backfill
```

---

### 003-indexes-and-constraints.sql

**What:** Creates 8 database indexes on the hot paths used by the module.

**Why:** The `check-access` endpoint is called on every
single page load. Without the composite index on `(user_id, hub_id, current)`,
every page load does a full table scan on subscriptions — which has 9,723+ rows
and growing. The indexes make these lookups near-instant.

**What was created (example actual output):**

| Index | Table | Used by |
|---|---|---|
| `idx_subscriptions_user_hub_current` | subscriptions | Every page load (access check) |
| `idx_subscriptions_user_hub_state` | subscriptions | Pending request check |
| `idx_subscriptions_hub_state` | subscriptions | Admin pending-requests list |
| `idx_price_plans_hub_code` | price_plans | Register + upgradeToGold |
| `idx_hubs_slug` | hubs | Hub resolution on login/register |
| `idx_hubs_host` | hubs | Host-based hub detection |
| `idx_emails_email_confirmed` | emails | Every login |
| `idx_members_hub_target_primary` | members | Profile lookup on login |

**Expected output (example output):**
```
CREATE INDEX   × 8

             indexname              |   tablename
------------------------------------+---------------
 idx_emails_email_confirmed         | emails
 idx_hubs_host                      | hubs
 idx_hubs_slug                      | hubs
 idx_members_hub_target_primary     | members
 idx_price_plans_hub_code           | price_plans
 idx_subscriptions_hub_state        | subscriptions
 idx_subscriptions_user_hub_current | subscriptions
 idx_subscriptions_user_hub_state   | subscriptions
(8 rows)
```

If run again: outputs `CREATE INDEX` but skips creation (IF NOT EXISTS), same 8 rows shown.

---

### 004-verification.sql

**What:** Five read-only queries to confirm everything is correctly set up.

**Why:** Run this after any change, after onboarding a new deployment, or
any time something seems wrong. It gives a complete picture of the DB state.

**current example verified output:**

**Query 1 — Hub:**
```
 id | slug      | name      | host
  3 | moonstone | Moonstone | moonstone.tabb.cc
✅ Hub exists. ID = 3. Use NEXT_PUBLIC_DEAL_ROOM_HUB_ID=3
```

**Query 2 — Price plans:**
```
 id | code   | name   | hub_id
 12 | iron   | Iron   |      3
 13 | bronze |        |      3    ← exists, not used by deal room
 14 | silver |        |      3    ← exists, not used by deal room
 15 | gold   | Gold   |      3
✅ Iron (id=12) and Gold (id=15) exist. price_plan_id=15 in tech-suite is correct.
```

**Query 3 — Subscription coverage (needs backfill):**
```
Before backfill:  total_users=9723, users_with_subscription=1176 ← 8547 missing
After backfill:   total_users=9723, users_with_subscription=9723 ✅
```

**Query 4 — Gold users:**
```
20 users with gold access
✅ These users see all documents when they sign in.
```

**Query 5 — Pending requests:**
```
(0 rows)
✅ No pending requests at this time. When users click "Request Access", they appear here.
```

---

## Testing the scripts from scratch

### Scenario A — Testing on Moonstone (existing hub)

Moonstone's hub already exists. Scripts 000 and 001 will output `INSERT 0 0`
(skip) since the records already exist. This is correct behaviour.

To fully test scripts 000 and 001 without affecting Moonstone, use a test
hub slug:

```bash
# 1. Connect to psql
psql -U shree -d tabb_dev_moonstone

# 2. Insert a test hub
INSERT INTO hubs (slug, name, host, white_label, created_at, updated_at)
VALUES ('test-deal-room', 'Test Hub', 'test.localhost', true, NOW(), NOW());

-- Note the ID returned
SELECT id FROM hubs WHERE slug = 'test-deal-room';
-- e.g. returns id = 99

# 3. Temporarily edit 001-create-price-plans.sql — change 'moonstone' to 'test-deal-room'
# Then run it:
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/001-create-price-plans.sql"
-- Should output INSERT 0 1 twice, then show iron + gold rows for hub_id=99

# 4. Test backfill with the test hub
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/002-backfill-existing-users.sql"
-- (after temporarily editing slug to 'test-deal-room')

# 5. Clean up test data
psql -U shree -d tabb_dev_moonstone -c "
DELETE FROM subscriptions WHERE hub_id = (SELECT id FROM hubs WHERE slug = 'test-deal-room');
DELETE FROM price_plans   WHERE hub_id = (SELECT id FROM hubs WHERE slug = 'test-deal-room');
DELETE FROM hubs          WHERE slug = 'test-deal-room';"

# 6. Re-run with real slug to confirm idempotency
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/000-create-hub.sql"
-- Output: INSERT 0 0 (skipped — moonstone already exists)
-- Shows existing moonstone row — no change
```

---

### Scenario B — Testing on a completely fresh database (new deployment)

Use this when setting up the deal room for a brand new app like Lunum.io:

```bash
# Step 1 — Edit 000-create-hub.sql
# Change slug, name, host to the new app's values
# e.g. 'lunum', 'Lunum IO', 'lunum.io'

# Step 2 — Run in order
psql -U <user> -d <new_database> -f "app/(modules)/deal-room/sql/000-create-hub.sql"
# Expected: INSERT 0 1, then shows new hub row

psql -U <user> -d <new_database> -f "app/(modules)/deal-room/sql/001-create-price-plans.sql"
# Expected: INSERT 0 1 twice (iron + gold), then shows both rows

psql -U <user> -d <new_database> -f "app/(modules)/deal-room/sql/002-backfill-existing-users.sql"
# Expected: inserts iron subscription for all existing users

psql -U <user> -d <new_database> -f "app/(modules)/deal-room/sql/003-indexes-and-constraints.sql"
# Expected: CREATE INDEX × 8, then shows all 8 index names

psql -U <user> -d <new_database> -f "app/(modules)/deal-room/sql/004-verification.sql"
# Expected: all 5 queries return clean results
```

---

### Scenario C — Verifying idempotency (run scripts twice)

All scripts are safe to run multiple times. To verify:

```bash
# Run 001 twice
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/001-create-price-plans.sql"
# First run:  INSERT 0 0, INSERT 0 0 (already exist) — shows existing rows
# Second run: INSERT 0 0, INSERT 0 0 — identical, no duplicates

# Run 003 twice
psql -U shree -d tabb_dev_moonstone -f "app/(modules)/deal-room/sql/003-indexes-and-constraints.sql"
# Both runs: CREATE INDEX × 8 (IF NOT EXISTS skips existing) — same 8 rows shown
```

---

### What the example output means

```
tabb_dev_moonstone=# \i .../003-indexes-and-constraints.sql
CREATE INDEX    ← idx_subscriptions_user_hub_current created ✅
CREATE INDEX    ← idx_subscriptions_user_hub_state created ✅
CREATE INDEX    ← idx_subscriptions_hub_state created ✅
CREATE INDEX    ← idx_price_plans_hub_code created ✅
CREATE INDEX    ← idx_hubs_slug created ✅
CREATE INDEX    ← idx_hubs_host created ✅
CREATE INDEX    ← idx_emails_email_confirmed created ✅
CREATE INDEX    ← idx_members_hub_target_primary created ✅

             indexname              |   tablename
------------------------------------+---------------
 idx_emails_email_confirmed         | emails        ✅
 idx_hubs_host                      | hubs          ✅
 idx_hubs_slug                      | hubs          ✅
 idx_members_hub_target_primary     | members       ✅
 idx_price_plans_hub_code           | price_plans   ✅
 idx_subscriptions_hub_state        | subscriptions ✅
 idx_subscriptions_user_hub_current | subscriptions ✅
 idx_subscriptions_user_hub_state   | subscriptions ✅
(8 rows)
```

**This is exactly the expected outcome. All 8 indexes were created successfully.**
The verification query at the end of the script confirms all 8 exist in the database.
Nothing is missing. Script 003 is complete.
