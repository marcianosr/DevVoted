---
# DVTD-cmqj
title: Auth failure reads as "no run today" and sends the player to the start screen
status: completed
type: bug
priority: high
created_at: 2026-08-13T13:45:36Z
updated_at: 2026-08-13T15:29:18Z
parent: DVTD-82c4
---

Server functions have two error modes and callers only handle one.

Every serverfn calls `getAuthenticatedUserId()` **outside** the service's `handleApiOperation`:

```ts
const userId = await getAuthenticatedUserId();   // throws
return getTodaysRunService({ userId, ... });     // returns ApiResponse
```

So domain failures come back as `{ success: false, error }` while auth failures reject. `useTodaysRun.hook.ts:23-24` handles only the first:

```ts
const view = query.data?.success === true ? query.data.data : null;
const errorMessage = query.data?.success === false ? query.data.error : null;
```

An auth failure therefore yields `view = null` **and** `errorMessage = null`, which reaches `syncTarget(pathname, null, false)` (`runRoutes.viewmodel.ts:55-63`) and navigates the player to the start-a-run screen. "You are signed out" is presented as "you have no run today".

The unwrap is repeated at ~10 sites across `useRunActions.hook.ts` and six components (`if (!result.success) return;`).

Untested files that a deeper interface would make testable: `run.serverfn.ts`, `community.serverfn.ts`, `community.repository.ts`, `climbers.repository.ts`, `useTodaysRun.hook.ts`, `useRunRouteSync.hook.ts`. Note the split — `syncTarget` (pure) has a 247-line spec, while `useRunRouteSync`, which owns pathname normalization, `replace: true` and the effect deps, has none.

## Todo

- [x] Added `withAuthenticatedUser(operation)` in `shared/utils/authorization.ts`
- [x] Make `ApiResponse` the single error mode across run and community serverfns
- [~] Partly — the query path is fixed; the silent-mutation half is its own bean (see below)
- [x] Test that an unauthenticated read surfaces a message instead of routing to start

## Summary of Changes

The root cause was narrower than "two error modes": `getTodaysRunService` returns `ApiResponse<RunView | null>`, and **`{ success: true, data: null }` is a real answer** meaning "no run today, go start one". A rejected query also produced `view === null`, so the route sync could not tell a definite "no run" from a read that never happened — and acted on the guess.

Three changes, each closing one link in that chain.

### 1. One error mode at the server boundary

`withAuthenticatedUser(operation)` runs `getAuthenticatedUserId()` inside the same try/catch the services use, so a signed-out request returns `{ success: false, error: "Not authenticated" }` instead of rejecting. All five run server functions and the community one now use it, and each got shorter in the process.

It does not re-report to Sentry — `getAuthenticatedUserId` already captures, and double-counting would misreport the rate.

### 2. The hook stops swallowing rejections

`useTodaysRun` folded `query.error` into `errorMessage`. `RunLayout` already had the error screen wired; it was simply never given anything to show.

It also now returns **`statusUnknown`** (`isPending || errorMessage !== null`) — the one place that decides whether `view` is trustworthy, including when it is null.

### 3. The route sync holds position when it cannot know

`syncTarget`'s third parameter went from `isPending` to `statusUnknown`. Same polarity, so **all 30 existing spec call sites stayed valid** — only the meaning widened, from "still loading" to "loading or failed".

A player whose run fails to load now stays on their screen and reads why, instead of being replaced onto `/run` (which, with `replace: true`, also destroyed their history entry).

### Tests

7 new, and the two that matter were **mutation-checked**: reverting the hook to its old one-line form fails `"keeps a player whose run could not be read where they are, and says why"`. They sit directly beside the existing `"sends a day without a run to the start screen"` test, because the pair is the whole point — the same null, two meanings.

- `RunLayout.component.spec.tsx` ×2 — a rejected read and a `success: false` read both show the message and do not navigate
- `authorization.spec.ts` ×4 (new file) — signed-in passthrough, signed-out becomes a response, operation errors pass through, operation throw is caught
- `runRoutes.viewmodel.spec.ts` ×1 — null holds while unknown, null routes home once known

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (537 modules), **1487 tests passing** (was 1480).

### One concrete win beyond the reported bug

`RunAnswer`'s abandon dialog reads `abandon.data?.success === false`. An auth failure there used to reject, leaving `data` undefined and the dialog silent — the button simply did nothing. It now fills in.

### What is still open

`send`/`sendWith` failures are still silent: `useRunActions` commits on success and the six call sites `return` on failure with no UI. One error mode means the failure is now *inspectable* everywhere, but surfacing mutation errors to the player is a feature, not this fix. Filed separately.

### No changelog entry

Per `docs/changelog-maintenance.md`: the whole `/run` flow is unreleased (no released version below `[Unreleased]` mentions it), so this bug was never experienced by a player.
