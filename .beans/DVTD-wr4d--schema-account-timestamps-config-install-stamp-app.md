---
# DVTD-wr4d
title: 'Schema: account timestamps, config install stamp, app_visits'
status: completed
type: task
priority: high
created_at: 2026-09-23T12:48:35Z
updated_at: 2026-09-23T12:54:50Z
parent: DVTD-uwf9
---

Phase 2 of DVTD-uwf9. Three schema changes that unlock most of the analytics, none of which need the recording path or the Pulse panel to exist yet.

## Todo

- [x] `users.created_at` + `users.last_seen_at` in schema.ts, with a guarded migration that backfills created_at from each account's earliest trace
- [x] `touchLastSeen` write site in the auth sync, guarded so it is at most one write per account per day
- [x] Write `user_config_unlocks.first_installed_at` from the run write path (declared since 20260906 but never written OR read)
- [x] `visit_device` enum + `app_visits` table, one row per (visit_date, visitor_hash, route_id) with a hits counter
- [x] Guarded migrations per ADR-012, re-appliable
- [x] Specs
- [x] Verify: typecheck, lint, format, tests, and the migrations applied twice

## Notes

- `app_visits` is one row per visitor/day/screen, NOT one per page view. That bounds the table at (visitors x screens) per day and makes the abuse cap free — a flooding client cannot exceed |routes| rows for its hash per day. Cost: no event ordering, so no screen-sequence funnel. Not needed for 'daily visitors and what they do'.
- `first_installed_at` must be keyed on the state diff, not on `action.type === 'install'`: configs also enter the build via the shop draft.
- No backfill for `first_installed_at` — historical installs are unrecoverable, and faking them would corrupt the install-rate figure this exists to produce. Report it as 'since <date>'.

## Summary of Changes

All three schema changes landed.

- `src/database/schema.ts`: `visit_device` enum, `users.created_at` / `users.last_seen_at`, and the `app_visits` table with three indexes (unique on day+visitor+route, one on day+route for the screen funnel, and a partial one on user+day that excludes signed-out rows).
- `supabase/migrations/20260923120000_add_user_timestamps.sql` and `20260923120100_add_app_visits.sql`, both guarded DO-blocks per ADR-012.
- `touchLastSeen` in `user.repository.ts` — a single self-guarding UPDATE, so the common case touches zero rows and two concurrent navigations cannot both write. Called from `ensureUserExists` inside a try/catch, because `fetchUser` turns any throw there into a null user, which the router reads as logged out.
- `configsNewlyInstalled` + `stampFirstInstalls` in `run.repository.ts`, inside the existing transaction and keyed on the state diff against `settled` rather than on `action.type`, so a shop-drafted config stamps the same way an installed one does.

### Better backfill than planned

The plan backfilled `created_at` from each account's earliest run or answer. While verifying against the local DB I found **`auth.users` already holds the real signup instant** — the app's own table simply never mirrored it. The migration now reads `auth.users.created_at` first and falls back to the earliest-trace heuristic only for accounts with no auth row (seeded ones). `last_seen_at` likewise prefers `auth.users.last_sign_in_at`.

### Verification

- Both migrations applied to the local DB **twice**: the second pass is a clean no-op (NOTICEs only).
- Backfill on 14 local accounts produced real dates spanning 2025-12-16 to 2026-09-22, not all stamped today.
- `\d app_visits` shows the table and all three indexes exactly as declared, including the partial one.
- A live upsert against the real table bumped `hits` 1 to 2 through the unique constraint; the probe row was deleted afterwards.
- `drizzle-kit check` reports "Everything's fine".
- `tsc --noEmit` clean; `npm run lint` clean (depcruise: no violations); `format:check` clean; `npm test` **183 files / 3559 tests all passing**.

### Not done, deliberately

No backfill for `first_installed_at` — historical installs are unrecoverable from the state blob, and inventing them would corrupt the install-rate figure this exists to produce. It should be reported as "since 2026-09-23".

`app_visits` is an empty table until Phase 3 wires the recording path.
