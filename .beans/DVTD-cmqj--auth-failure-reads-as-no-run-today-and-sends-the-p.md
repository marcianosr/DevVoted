---
# DVTD-cmqj
title: Auth failure reads as "no run today" and sends the player to the start screen
status: todo
type: bug
priority: high
created_at: 2026-08-13T13:45:36Z
updated_at: 2026-08-13T13:45:36Z
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

- [ ] Add an `authedServerFn(handler)` adapter that runs auth inside `handleApiOperation`
- [ ] Make `ApiResponse` the single error mode across run and community serverfns
- [ ] Collapse the ~10 unwrap sites into the two hooks
- [ ] Test that an unauthenticated read surfaces a message instead of routing to start
