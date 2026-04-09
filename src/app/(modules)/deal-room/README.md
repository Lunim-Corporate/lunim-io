# deal-room — composable module

A self-contained, drag-and-drop Next.js App Router module that adds a gated
investor deal room to any host app. All access logic lives in **tech-suite**
(the NestJS backend). The frontend only reflects state returned by the API —
it never makes access decisions itself.

---

## What it does

| State | What the user sees |
|---|---|
| Unauthenticated | Inline sign-in / create-account form on a dark branded page |
| Authenticated, email unconfirmed | Confirmation prompt with working resend button |
| Authenticated, `iron` tier | Deal room with locked categories + "Request Access" button |
| Authenticated, access requested | Deal room with pending-review message |
| Authenticated, `gold` tier | Full deal room with all documents unlocked |

---

## Folder structure

```
app/
├── (modules)/
│   └── deal-room/
│       ├── page.tsx                  ← server component (auth + sub checks + background)
│       ├── layout.tsx                ← SessionProvider wrapper ("use client")
│       ├── config.ts                 ← reads env vars, returns DealRoomConfig
│       ├── types.ts                  ← shared TypeScript types
│       ├── index.tsx                 ← public re-exports for host apps
│       ├── components/
│       │   ├── auth-form.tsx         ← sign-in + create-account + resend confirmation
│       │   ├── deal-room-content.tsx ← document list with TOC, locked/unlocked states
│       │   ├── deal-room-nav.tsx     ← fixed top navbar with user avatar + sign out
│       │   ├── request-access-button.tsx ← triggers access request via server action
│       │   ├── logout-and-redirect.tsx   ← modal for users with no subscription
│       │   └── deal-room-downloads.tsx   ← legacy download component (unused by default)
│       ├── lib/
│       │   ├── auth.ts               ← NextAuth authOptions (CredentialsProvider)
│       │   ├── subscription.ts       ← API calls: check-access, request-access, notify
│       │   └── actions.ts            ← Next.js server actions (bridge for client→server)
│       └── sql/
│           ├── 000-create-hub.sql
│           ├── 001-create-price-plans.sql
│           ├── 002-backfill-existing-users.sql
│           ├── 003-indexes-and-constraints.sql
│           └── 004-verification.sql
├── api/
│   └── auth/[...nextauth]/route.ts   ← NextAuth catch-all route
└── confirm-email/
    └── page.tsx                      ← email confirmation landing page
```

---

## Prerequisites

- Next.js 14+ with App Router
- `next-auth` v4 (`npm install next-auth`)
- A running **tech-suite** backend

---

## Installation — step by step

### 1. Copy files into host app

```bash
# From cakeshop repo root
cp -r app/(modules)/deal-room        <host-app>/app/(modules)/deal-room
cp    app/api/auth/\[...nextauth\]/route.ts  <host-app>/app/api/auth/[...nextauth]/route.ts
cp    app/confirm-email/page.tsx     <host-app>/app/confirm-email/page.tsx
```

### 2. Add CSS variables to globals.css

In `<host-app>/app/globals.css`, add after `@import "tailwindcss"`:

```css
@layer base {
  html, body {
    background-color: #0a0a0a !important;
    color: #f1f5f9;
  }
}

:root {
  --dr-accent:           #06b6d4;   /* change to your brand colour */
  --dr-accent-hover:     #0891b2;
  --dr-accent-fg:        #000000;
  --dr-bg-page:          #0a0a0a;
  --dr-bg-card:          #141414;
  --dr-bg-nav:           rgba(10,10,10,0.88);
  --dr-bg-doc-row:       rgba(255,255,255,0.03);
  --dr-bg-doc-row-hover: rgba(255,255,255,0.07);
  --dr-bg-doc-locked:    rgba(255,255,255,0.015);
  --dr-text:             #f1f5f9;
  --dr-text-muted:       #64748b;
  --dr-text-disabled:    #334155;
  --dr-border:           rgba(255,255,255,0.08);
  --dr-input-bg:         #0d0d0d;
  --dr-input-border:     rgba(255,255,255,0.12);
  --dr-input-text:       var(--dr-text);
  --dr-input-focus:      var(--dr-accent);
  --dr-padding-top:      5rem;
  --dr-max-width:        1200px;
}
```

Copy the rest of the `dr-*` utility class definitions from this project's `globals.css`.

### 3. Set environment variables

```bash
cp app/(modules)/deal-room/.env.example .env.local
# then fill in the values
```

### 4. Run database scripts

See `SCRIPTS.md` for the full guide. Short version:

```bash
psql -U <user> -d <database> -f app/(modules)/deal-room/sql/000-create-hub.sql
psql -U <user> -d <database> -f app/(modules)/deal-room/sql/001-create-price-plans.sql
psql -U <user> -d <database> -f app/(modules)/deal-room/sql/002-backfill-existing-users.sql
psql -U <user> -d <database> -f app/(modules)/deal-room/sql/003-indexes-and-constraints.sql
psql -U <user> -d <database> -f app/(modules)/deal-room/sql/004-verification.sql
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_TECH_SUITE_URL` | Base URL of tech-suite backend |
| `NEXT_PUBLIC_DEAL_ROOM_HUB_ID` |  Hub ID from the `hubs` table (e.g. `3` for Moonstone) |
| `NEXTAUTH_SECRET` |  Random string for NextAuth JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` |  Full public URL of this Next.js app |
| `NEXT_PUBLIC_DEAL_ROOM_ALLOWED_TIERS` | optional | Comma-separated tiers with access. Default: `gold` |
| `NEXT_PUBLIC_ENABLE_ACCESS_ATTEMPT_EMAILS` | optional | `true` to email admins when a non-gold user visits |

---

## How config works

`config.ts` exports `getDealRoomConfig()` which reads environment variables on
every call. No initialisation step. Call it from any server component or server
action — it throws a clear error if required vars are missing.

Client components never call `getDealRoomConfig()` directly. They receive what
they need either as props (e.g. `backendUrl` passed from `page.tsx`) or via
server actions (e.g. `requestAccessAction` in `lib/actions.ts`).

---

## Access flow

```
GET /deal-room (server component: page.tsx)
  │
  ├─ getServerSession() ──► no session
  │                            └─ render <AuthForm /> (sign in + create account)
  │
  ├─ session.user.isEmailConfirmed = false
  │    └─ render <AuthForm message="confirm email" />
  │         └─ resend button → POST /api/auth/resend-confirmation
  │
  └─ session valid + email confirmed
       │
       ├─ GET /api/subscriptions/check-access/:userId/:hubId?allowedTiers=gold
       │    ├─ hasAccess=false, hasRequestedAccess=false
       │    │    └─ show locked categories + "Request Access" button
       │    │         └─ POST /api/subscriptions/internal/request-access (server action)
       │    ├─ hasAccess=false, hasRequestedAccess=true
       │    │    └─ show locked categories + "under review" message
       │    └─ hasAccess=true
       │         └─ fetch /api/documents/vault-files (with Bearer token)
       │              └─ render categories + signed Cloudinary URLs
       │
       └─ if ENABLE_ACCESS_ATTEMPT_EMAILS=true AND !hasAccess:
            POST /api/notifications/access-attempt (fire-and-forget)
```

---

## Theming

All UI uses `dr-*` CSS utility classes backed by CSS custom properties.
To customise: override `--dr-accent` and other variables in the host app's
`globals.css`. No code changes needed inside the module.

Light theme example:
```css
:root {
  --dr-bg-page:    #f8fafc;
  --dr-bg-card:    #ffffff;
  --dr-text:       #0f172a;
  --dr-text-muted: #64748b;
  --dr-border:     rgba(0,0,0,0.08);
}
```

---

## Card 6 — Drop-in validation checklist

Run through this state matrix after copying into a fresh Next.js App Router app:

| State | Steps | Expected result |
|---|---|---|
| Unauthenticated | Visit `/deal-room` | Auth form, dark page, "Investor Portal" badge |
| Register | Fill form + submit | Success screen, confirmation email sent |
| Confirm email | Click link in email | `/confirm-email` success screen |
| Sign in unconfirmed | Sign in before confirming | Error + resend button |
| Sign in iron tier | Sign in with confirmed iron user | Deal room, locked categories, Request Access button |
| Request access | Click Request Access | Pending message on refresh |
| Sign in gold tier | Sign in with gold user | All categories + documents accessible |
| Sign out | Click Sign out in navbar | Redirected to auth form, session cleared |

---

## Troubleshooting

**White background instead of dark** — Make sure `@layer base { html, body { background-color: #0a0a0a !important; } }` comes after `@import "tailwindcss"` in `globals.css`.

**"Missing required env var: NEXT_PUBLIC_DEAL_ROOM_HUB_ID"** — Add `NEXT_PUBLIC_DEAL_ROOM_HUB_ID=3` to `.env.local`. Run `004-verification.sql` to confirm the correct hub ID.

**Documents show as locked for gold users** — Verify `NEXT_PUBLIC_DEAL_ROOM_ALLOWED_TIERS` is unset (defaults to `gold`) or includes `gold`. Also check the subscription row: `SELECT * FROM subscriptions WHERE user_id = X AND hub_id = 3 AND current = true`.

**"Invalid credentials" for a valid account** — The hub ID in the env var may not match. Check that `NEXT_PUBLIC_DEAL_ROOM_HUB_ID` equals the `id` column from `SELECT id FROM hubs WHERE slug = 'moonstone'`.

**Request Access returns an error** — The `price_plan_id: 15` is hardcoded in tech-suite's `requestAccess()`. Confirm that `SELECT id FROM price_plans WHERE code = 'gold' AND hub_id = 3` returns `15`. If it returns a different ID, that line in tech-suite needs updating.

**Resend confirmation email returns 404** — The endpoint hasn't been added to tech-suite yet. See `tech-suite-changes/` for the code to add.
