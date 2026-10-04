# ADR-088: The run has no id in its URL, and the status owns the screen

## Status

Accepted (2026-09-16, Marciano). Renames the `/run/*` paths after the screens
they mount and merges the two gate-outcome routes into one. (DVTD-jgcr,
DVTD-t3lt)

## Context

The `/run/*` routes and the status-to-route sync in `runRoutes.viewmodel.ts`
were built without an ADR, so two questions kept being reopened: whether a run
should carry its id in the URL, and what decides which screen a player is
allowed to be on.

Both had already been answered by the code, and neither answer was written down.

## Decision

1. **The live run carries no id.** `getTodaysRun()` resolves the run from the
   session, and at most one session run is active per account
   (`findActiveSessionRun`). A `/run/43` segment would name something the
   server already knows and hand the client an id to tamper with. A run is a
   place you are, not a resource you fetch.

2. **Finished runs do carry one, under a plural prefix.** The archive holds
   many runs, they are immutable, and they are worth linking, so `/runs/$runId`
   is a read-only recap. `/runs/` is the archive and `/run/` is the climb, which
   is also why the two prefixes cannot collide. The id arrives from the URL, so
   the service checks it against the session and refuses another account's run
   in the same words it refuses one that never existed.

3. **`RunStatus` decides which screens are legal.** `routesForStatus` maps one
   status to an ordered list of paths and `syncTarget` moves anyone standing
   off it, so a typed URL, a reload and the back button all land somewhere the
   run agrees with. Screens never navigate on a status change; they commit and
   let the sync react.

4. **Paths are named after the screens they mount**: `/run/new`, `/run/prep`,
   `/run/poll`, `/run/gate`, `/run/review`, `/run/shop`, `/run/over`. The shop
   keeps its name because the Registry is a panel on it, and on `/run/new` too
   (CONTEXT.md retired terms).

5. **One gate outcome, one route.** The clear and the hold are one component
   wearing two verdicts (ADR-076) and they live in different statuses, so
   `/run/gate` serves both and reads the verdict off `view.status`. Prep does
   **not** merge into it: ADR-032 makes prep the post-shop hub, so during
   `rewarding` the outcome of gate N and the stake of gate N+1 are both live,
   and one URL cannot mean two screens within one status.

6. **Prep is legal before the run starts.** `configuring` allows `/run/new` and
   `/run/prep`, so gate 0 states its terms the way every later gate does
   instead of hiding them behind a flag inside the build screen.

## Consequences

- `RUN_ROUTES` is the only place a run path is spelled; a rename is one edit
  plus the route files.
- `/run/community` stays outside the table on purpose — it is a breather off
  the climb, so the sync may target it but never polices it.
- A screen that needs a new status becomes a new entry in `routesForStatus`,
  not a `beforeLoad` guard. Routes may not import `application/`
  (ADR-002), which is what keeps the decision in one testable function.
- The archive route is the only run URL taking client input, so it is the only
  one carrying an ownership check.
