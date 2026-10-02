---
# DVTD-5kak
title: The public key can read and write every table
status: completed
type: bug
priority: critical
created_at: 2026-10-02T08:39:45Z
updated_at: 2026-10-02T09:04:47Z
parent: DVTD-erjz
---

**What:** Turn on row-level security for every table, so the public key reaches no rows.

**Why:** The public key ships to every browser, and with it anyone can read and write any table directly.

## Done when
- [x] The public key alone reads no rows from any table
- [x] The app works exactly as before
- [x] A new table without row-level security fails the tests

## Notes

Confirmed 2026-10-02 on local: `curl $VITE_SUPABASE_URL/rest/v1/users?select=id&limit=1 -H apikey:$VITE_SUPABASE_ANON_KEY` returned a user id with HTTP 200.

Safe with zero policies: the browser client only does auth (`Login.component.tsx`); all table access is Drizzle as the table owner, which bypasses RLS.

Two halves kept in sync: `.enableRLS()` on every table in `schema.ts` (so `db:push` does not see drift and disable it) and a guarded migration that enables it on the live database.

## Summary of Changes

- `schema.ts`: `.enableRLS()` on all 24 tables, so `db:push` keeps it on.
- Migration `20261002120000_enable_rls_on_public_tables.sql`: enables RLS on every public table still without it, adds no policy, and does nothing on a re-run.
- `src/database/schema.spec.ts` fails and names any table without RLS. `enableRlsOnPublicTables.spec.ts` checks the migration's shape.
- Verified on local: the public-key curl on `users` now returns `[]`, and a run plays as before. Production gets it on merge to main.
- `docs/roadmap.md`: Check RLS ticked.
