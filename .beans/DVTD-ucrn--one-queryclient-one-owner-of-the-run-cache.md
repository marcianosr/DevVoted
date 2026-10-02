---
# DVTD-ucrn
title: One QueryClient, one owner of the run cache
status: completed
type: task
priority: normal
created_at: 2026-09-25T19:45:51Z
updated_at: 2026-09-30T17:09:17Z
parent: DVTD-y3vn
---

**What:** The app keeps one query client for its lifetime, and one module owns today's run cache and the list of caches a run action moves.

**Why:** The root creates a new client on every render so nothing is cached and every stale-time setting is decoration; once the client is stable, two hooks with overlapping invalidation lists and query keys that carry no user id would show one account another's run.

## Done when
- [x] The query client is created once with the router and read from router context; no component creates one
- [x] Signing in, signing up, signing out and the auth callback clear the cache
- [x] One hook owns the write of today's run and the invalidation list, and the fire-audit path commits through it
- [x] Every cache a run action moves is invalidated per the commit hook's spec; poll create and edit now stale the poll keys; title and border mutations already staled theirs
- [x] The poll detail and poll edit screens share one reader under one key
- [x] A shared test helper provides the query client to the four specs that built their own

## Notes
Plan section "Slice 7". `getRouter()` creates the client, `context: { queryClient }`, `createRootRouteWithContext`; regenerate the route tree. No ssr-query package (nothing dehydrates). Default `staleTime` stays 0. New `run/run/application/useRunCommit.hook.ts`; readers stay. New `polls/poll/application/usePollDetail.hook.ts`. New `src/test/queryClient.harness.tsx`. Check `.storybook/preview` decorators. CLAUDE.md Development Notes gain the one-client rule. Live checks (navigation keeps data; second account in the same tab never sees the first's run) are Marciano's.

## Summary of Changes (2026-09-30)

- `router.tsx` creates the one `QueryClient` and hands it to routes as `context.queryClient`; `__root.tsx` is a `createRootRouteWithContext` route and reads it. No component news a client.
- Login, sign-up, the auth callback (`beforeLoad`) and logout (`loader`) call `queryClient.clear()`, because the run keys carry a date and not an account.
- `useRunCommit.hook.ts` owns `commit(result)` and `refresh()`: today's run is written or staled, and community, attack targets, incidents, approval slots, run number, every users key, titles, archive and the polldex are invalidated. `useRunActions` (which gained `sendThen` so the shop, prep and gate wirings no longer hand-roll commit-then-navigate), `useFireAudit` and `useLootFallenRun` go through it. Spec: `useRunCommit.hook.spec.tsx`.
- `queryKeys.ts`: the five dead keys are gone (`withCategoryXp`, `lastRun`, `active`, `daily`, `seenInRun`, `withOptions`, `pollSplit`) and the date-bound run keys live there as `sessionRunQueryKeys.todays*`, so the hooks no longer export their own factories.
- `usePollDetail.hook.ts` is shared by PollDetail and PollEdit under one key and one shape. PollEdit and PollCreate invalidate the poll keys after a save, which the per-render client used to hide.
- `src/test/queryClient.harness.tsx` (`createTestQueryClient`, `withQueryClient`) replaces the six inline clients in specs.
- Left as the plan chose: `staleTime` stays 0; the eleven pass-through reader hooks stay, each owning its key's use; `useTodaysRun` is still called per screen (React Query dedupes on the stable client).
