# (modules) Route Group

This route group hosts self-contained plug-and-play feature modules.

## What "route group" means

The parentheses `(modules)` make Next.js treat this as a **group** — it does
NOT appear in the URL. So `app/(modules)/deal-room/page.tsx` is served at `/deal-room`.

## Isolated layout

`app/(modules)/layout.tsx` is a **full** `<html>/<body>` layout. This means
any route inside `(modules)/` gets its own HTML shell, completely bypassing the
root layout (which renders Prismic nav + footer). Modules render their own chrome.

## Adding a new module

1. Create `app/(modules)/your-module/` with its own `layout.tsx`, `page.tsx`, etc.
2. Add any required env vars to `.env.local`.
3. If the module has its own auth API routes, add its paths to `DEAL_ROOM_PATHS`
   in `middleware.ts` (or create a similar guard).

## Current modules

| Module      | Route        | Auth          | Description                        |
|-------------|--------------|---------------|------------------------------------|
| `deal-room` | `/deal-room` | next-auth JWT | Investor portal + document vault   |
