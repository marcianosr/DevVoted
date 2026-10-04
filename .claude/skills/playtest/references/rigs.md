# Rigs: where to play and how to get there

## Decision table

| Need to see | Rig |
|---|---|
| One run's flow, screens, reducer outcomes, configs, shop, audits | `/proto-run` |
| Persistence, warm boot, day boundary, community/climbers, titles, archive, profile | App on :3005 with a seeded login |
| Win rates, depth, build power across accuracies | Balance sim (see lenses.md) |
| One screen's layout/copy in a specific state, without playing to it | Storybook iframe |

## Prereqs (check, don't restart blindly)

- Supabase: `npx supabase status` → if down, `npx supabase start`.
- Dev server: `lsof -i :3005` → if nothing, start `npm run dev` in the background.
- Fresh/empty DB (login fails with seeded email) → ask before `npm run db:refresh`.

## /proto-run (dev only, no DB, no auth)

`http://localhost:3005/proto-run`. Real screens over a local `runReducer`; hard-coded polls; starts with 256 KB.

Dev rig panel (bottom of page):
- `✓ Answer right` / `✕ Answer wrong`: answer the current poll.
- `⏩ All right → gate` / `⏩ All wrong → gate`: finish the window and close the gate.
- `💾 +256 KB storage`: grant storage.
- Services toggle: unlock any shop service.
- Configs toggle: install any config into the build.
- New run from the over screen restarts at the planted pin's gate.

Cannot show: anything cross-run (archive, warm boot, titles, unlocks earned), other players, persistence. Memory: `proto-run-cannot-see-cross-run-state`.

## App with a seeded login

All passwords `kanto123`. None has an active run today; start one in the UI.

| Login | Role / build | Use for |
|---|---|---|
| `blue@kanto.dev` | free eight configs only, fresh | first-run UX, new-player clarity |
| `lance@kanto.dev` | admin, every config, 8 MB archive, 3 past runs | config testing, warm boot, admin, profile |
| `lorelei@kanto.dev` | coverage configs, pinned gate 4, legacy titles | mid-run state, pin, legacy rewards |
| `agatha@kanto.dev` | risk configs, 2 MB archive | risk builds |
| `bruno@kanto.dev` | economy configs, poll editor, 4 MB archive | economy/shop, poll editing |

20 climbers (Giovanni … Copycat) have live runs today, three fallen, one looted; they fill the community board. They can't log in. Source: `src/database/seed/cast.ts`.

Login: `http://localhost:3005/login`.

## Route flow (one day)

`/run` (hub) → `/run/new` → `/run/poll` → `/run/gate` → `/run/review` → `/run/shop` → `/run/prep` → `/run/poll` … → `/run/over`.
Also `/run/community`, `/profile/$userId`, `/dex`, `/runs/$runId`. A route the run status doesn't allow bounces; the map is `src/modules/run/run/application/runRoutes.viewmodel.ts`.

## SQL state recipes (local DB only)

Connect: `psql "$SUPABASE_DB_URL"` (from `.env`). Find the user: `select id from auth.users where email = 'blue@kanto.dev';`

**Advance a day** (no clock override exists): move the player's today back one day, then reload `/run`.
```sql
update runs set seed_date = to_char(seed_date::date - 1, 'YYYY-MM-DD')
  where user_id = :uid and seed_date is not null;
update polls_responses set answer_date = to_char(answer_date::date - 1, 'YYYY-MM-DD')
  where user_id = :uid;
```
Tomorrow's poll sequence is created lazily (`getOrCreateDailyRunSeed`).
This does NOT open a second gate the same real day: `rollSegmentForward` deals today's seeded sequence minus polls the run already answered, and that is the set you just played. To play another gate today, append unanswered polls instead:
```sql
insert into run_polls (run_id, position, poll_id, segment_date)
select :run, :currentIndex - 1 + row_number() over (), id, to_char(current_date, 'YYYY-MM-DD') from (
  select id from polls where status = 'published'
    and id not in (select poll_id from polls_responses where run_id = :run)
    and id not in (select poll_id from run_polls where run_id = :run)
  order by id desc limit 5) x;
```
**Positions must be packed.** The engine reads `polls[currentIndex]` from the run's `run_polls` ordered by position, not by position number. If you raise `currentIndex`/`gatesCleared` by SQL, pad the skipped positions with past-dated filler rows or the day reads as spent.
**Setting `status: "rewarding"` by SQL opens an empty registry**: only the gate-close reducer rolls `draftOptions`. Copy a draft from another rewarding run, or press Rebuild once in the shop.
**Status `configuring` is the new-run build screen** (`/run/new`), not prep. A rigged gate's audits only appear after a dispatched action in prep (`backfillGateAudits` runs on settle), e.g. one install/uninstall.
**Two logins at once:** when the browser MCPs are busy, a headless playwright-core script with one saved `storageState` per login works; Agatha's legacy modal needs "Later" pressed first.

**Shape a run** (gate, storage, build): edit `run_states.state` (the snapshot JSON) and its mirrored columns `gates_cleared`, `coverage` (stored in UNITS), `polls_answered` together, or the screens disagree. Copy the overrides `seedClimberRuns` uses in `src/database/seed/runs.ts` (`status`, `gatesCleared`, `storage`, `currentIndex`, `build.configs`, `window`, `lastClose`). Prefer proto-run or Lorelei's pin before reaching for this.

**Titles:** `npm run db:titles -- <email>` wipes and grants 5 test titles, unwears all.

## Storybook

`npx storybook dev -p 6006 --ci --no-open`, then
`http://localhost:6006/iframe.html?id=<title-path-kebab>--<export-kebab>&viewMode=story` (e.g. `kanto-screens-pollscreen--build-folded`). A page titled just "Storybook" means a wrong id.
