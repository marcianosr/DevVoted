---
# DVTD-owpb
title: The Dex reads its collection through one hook
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:29:05Z
updated_at: 2026-10-01T18:33:57Z
parent: DVTD-y3vn
---

**What:** The collection screen gets everything it shows from one place, and the screen itself only remembers which tab, row and filter you picked.

**Why:** The screen was fetching five things itself and unpacking each answer by hand, which is the job of the layer below it.

## Done when

- [x] The collection screen asks one place for its data and keeps only the picked tab, row and filter
- [x] A failed or empty answer still shows an empty collection rather than breaking the screen
- [x] The collection cannot be pointed at another player by accident: it is named as the viewer's own
- [x] Every existing collection test stays green

## Notes

- Dex.component.tsx ran five inline useQuery calls, imported server functions into presentation, called configdex/gatedex/controldex/auditdex, and checked data?.success five times.
- New: collection/dex/application/useDex.hook.ts, built on useApiQuery (the one convention for reading an ApiResponse query).
- ADR-129: the userId was only a cache key; every server function resolves the user from the session. The hook names its argument viewerId.

## Summary of Changes

- New `collection/dex/application/useDex.hook.ts`: `useDex(viewerId)` runs the five queries through `useApiQuery` and returns `DexCollection` (polls, configs, controls, gates, audits, runs), already passed through the domain functions. A failed answer empties only its own tab.
- `Dex.component.tsx` keeps only pick/filter state and the per-tab viewmodel calls; no server function or query import left. Its prop is renamed `viewerId` (one-line edit in `ProfilePage.component.tsx`).
- `useDex.hook.spec.tsx`: three tests (all answers, one failure, before any answer).
