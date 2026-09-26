---
# DVTD-ucrn
title: One QueryClient, one owner of the run cache
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:51Z
updated_at: 2026-09-25T19:45:51Z
parent: DVTD-y3vn
---

**What:** The app keeps one query client for its lifetime, and one module owns today's run cache and the list of caches a run action moves.

**Why:** The root creates a new client on every render so nothing is cached and every stale-time setting is decoration; once the client is stable, two hooks with overlapping invalidation lists and query keys that carry no user id would show one account another's run.

## Done when
- [ ] The query client is created once with the router and read from router context; no component creates one
- [ ] Signing in, signing up, signing out and the auth callback clear the cache
- [ ] One hook owns the write of today's run and the invalidation list, and the fire-audit path commits through it
- [ ] Every cache a run action, a poll edit, a title equip or a border purchase moves is invalidated, per a spec table
- [ ] The poll detail and poll edit screens share one reader under one key
- [ ] A shared test helper provides the query client to the four specs that built their own

## Notes
Plan section "Slice 7". `getRouter()` creates the client, `context: { queryClient }`, `createRootRouteWithContext`; regenerate the route tree. No ssr-query package (nothing dehydrates). Default `staleTime` stays 0. New `run/run/application/useRunCommit.hook.ts`; readers stay. New `polls/poll/application/usePollDetail.hook.ts`. New `src/test/queryClient.harness.tsx`. Check `.storybook/preview` decorators. CLAUDE.md Development Notes gain the one-client rule. Live checks (navigation keeps data; second account in the same tab never sees the first's run) are Marciano's.
