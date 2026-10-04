---
# DVTD-k8rp
title: Post-deploy checks for the observability work
status: todo
type: task
priority: high
created_at: 2026-09-23T13:22:17Z
updated_at: 2026-09-23T13:22:17Z
parent: DVTD-uwf9
---

After the observability work (DVTD-uwf9) reaches production, four things can fail **silently** — no error, no alert, just no data. This is the list that catches them.

Run it once, the day the first deploy lands.

## 1. Did the migrations apply?

CI (`.github/workflows/main.yaml`) runs `supabase db push` on merge to main, in parallel with the Vercel build. Confirm both landed:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'users'
  and column_name in ('created_at', 'last_seen_at');
-- expect 2 rows

select to_regclass('public.app_visits');
-- expect app_visits, not null
```

If the code deployed before the migration, nothing breaks: `touchLastSeen` and `upsertVisit` both throw into a catch that swallows and reports. You would see a burst of `touchLastSeen` / `recordVisit` warnings in Sentry and no data. Re-running the migration fixes it with no redeploy.

## 2. Is Sentry actually reporting, and from the right environment?

- [ ] An event exists with `environment: "production"` — not `"development"`, not `"mode"`. If it is wrong, the **Enable access to System Environment Variables** toggle in Vercel is off, so `VERCEL_ENV` never reached the build.
- [ ] The event's `release` is a real 40-char commit sha, not `local`. Same cause if wrong.
- [ ] A **server** error appears, not just a browser one. This is the whole point of the change — before it, every server-function failure was invisible. Force one if nothing has failed naturally.
- [ ] The issue is tagged `operation:<name>` (e.g. `operation:getTodaysRun`) rather than grouped by message.

If there are **no events at all**, `VITE_SENTRY_DSN` was missing when Vercel built. It is inlined at build time, so setting it now requires a redeploy.

## 3. Are visits being recorded?

This is the most likely silent failure: `VISIT_HASH_SECRET` unset makes the whole path a deliberate no-op.

```sql
select visit_date, count(*) rows, count(distinct visitor_hash) visitors, sum(hits) views
from app_visits group by visit_date order by visit_date desc limit 7;
```

- [ ] Rows exist at all. Empty after real traffic means `VISIT_HASH_SECRET` is unset in Vercel.
- [ ] `route_id` holds **patterns**, never real ids — `/_authed/runs/$runId`, never `/runs/482`:
  ```sql
  select distinct route_id from app_visits order by route_id;
  ```
- [ ] Signed-out visits are visible (this is the funnel that did not exist before):
  ```sql
  select route_id, count(*) from app_visits where user_id is null group by route_id;
  ```
  Expect `/login`, `/`, `/sign-up`.
- [ ] No row has more than one visitor per screen per day — the unique key should make this impossible:
  ```sql
  select visit_date, visitor_hash, route_id, count(*)
  from app_visits group by 1,2,3 having count(*) > 1;
  -- expect zero rows
  ```

## 4. Are the two new stamps being written?

```sql
select count(*) total, count(last_seen_at) stamped from users;
-- stamped should climb as people play

select count(*) filter (where first_installed_at is not null) installed, count(*) granted
from user_config_unlocks;
-- installed should climb from ~0 as runs happen
```

`first_installed_at` has **no backfill** — historical installs are unrecoverable, so any install-rate figure must be labelled "since the deploy date", not "all time".

## 5. Watch for one day

- [ ] **Error volume did not spike.** `handleApiOperation` now reports at `error` level instead of `warning`, so routine expected throws (`"No polls left for a run today"`, `"Border ... not found"`) will surface as real issues. They group one-per-operation, so mute them individually rather than reverting the level.
- [ ] **No latency regression on navigation.** The visit write hangs off root `beforeLoad`, which runs on every navigation. It is fire-and-forget and never awaited, but confirm p75 did not move in Sentry's performance view.

## Todo

- [ ] Section 1 — migrations applied
- [ ] Section 2 — Sentry reporting from production, with a real release
- [ ] Section 3 — visits recording, route patterns clean, signed-out visible
- [ ] Section 4 — last_seen_at and first_installed_at climbing
- [ ] Section 5 — no error spike, no latency regression
