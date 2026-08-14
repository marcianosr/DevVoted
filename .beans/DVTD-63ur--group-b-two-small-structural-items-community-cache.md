---
# DVTD-63ur
title: 'Group B: Two small structural items (community cache, dex/polldex layout)'
status: completed
type: task
priority: low
created_at: 2026-08-12T09:12:25Z
updated_at: 2026-08-13T17:37:58Z
parent: DVTD-82c4
---

Two small findings from the architecture review, neither worth its own bean.

## The community query is never invalidated
`sessionRunQueryKeys.community(date)` appears exactly once in the codebase
(`presentation/community/RunCommunity.component.tsx:26`) and nothing ever
writes or invalidates it. Answering a poll changes the community view (new
answer, new standouts, moved climb marker) but nothing tells that query.

It works today only because the root `QueryClient` (`src/routes/__root.tsx:141`)
uses default options, so `staleTime: 0` refetches on remount. Any future global
`staleTime` breaks the board silently.

There is also no `useRunCommunity` hook mirroring `useTodaysRun`; the component
calls `useQuery` directly.

Separately: `Dex.component.tsx:45` calls `getOwnedSwatches` under
`userQueryKeys.swatches`, so swatches earned by `awardGateSwatch`
(`api/queries.ts:293`) are never invalidated after a gate clear.

- [x] Invalidate the community key from `useRunActions`
- [x] Add `useRunCommunity` to match `useTodaysRun`
- [x] Invalidate owned swatches after a gate clear

## presentation/dex vs presentation/polldex is inverted
`Dex` is the tab shell holding all three panels, but two panels
(`ConfigdexPanel`, `SwatchdexPanel`) live in `presentation/dex/` and the third
(`PolldexPanel`) sits as a sibling in `presentation/polldex/`, imported across
the boundary at `Dex.component.tsx:21`.

Not duplication: there is no overlapping code, and `polldex/` genuinely holds a
bigger concept (its own model plus api). The boundary is just drawn one level
too low. Either all three panels move into `presentation/dex/`, or polldex
becomes `presentation/dex/polldex/`.

Note `SwatchdexPanel.ui.tsx:2` and `ConfigdexPanel.ui.tsx:5` import Tier 1
visuals from another module (`~/modules/run/presentation/...`), which ADR-002
and ADR-010 do not describe. Those two chips are de-facto global primitives
living in `run/`.

- [x] Pick one layout for the three dex panels (already done by DVTD-36ct)
- [x] Decide where `ConfigChip` and `SwatchChips` belong if two modules need them

## Summary of Changes

### The community cache

`useRunCommunity` (`run/community/application/`) now owns the key and the fetch,
mirroring `useTodaysRun`. `RunCommunity.component.tsx` calls it instead of
building a `useQuery` inline, which is what left the key unreachable from
anywhere that could invalidate it.

`useRunActions.commit` invalidates the community board and the swatch
collection. Every action invalidates both rather than only the ones that
qualify: an answer moves the board, a gate clear awards a swatch, and a stale
mark on an unmounted query is cheaper than a rule about which action did what.
`abandon` does the same, since quitting takes you off the climb map.

`userQueryKeys.swatches` moved the concern **ahead** of the userId
(`["users","swatches",id]`, was `["users",id,"swatches"]`) and gained a
`swatchesAll` prefix. The run flow has no userId to build the old key with — the
server derives it from the session — so without the reorder the only options
were invalidating all of `["users"]` (taking profiles with it) or threading a
userId through the run, which the auth rules push against.

Mutation-verified: dropping the community line from `invalidateSideViews` fails
"commit stales the community board and the swatch collection".

### While in the file (DVTD-cmqj's shape, again)

A failed community fetch rendered "Nothing to see yet — answer some of today's
polls first", the same wrong story cmqj fixed on the run query: an error and an
empty board both leave `view` null and read as opposites to a player. The hook
folds `query.error` into `errorMessage` and the screen says the board failed and
the run is unaffected.

### The dex/polldex layout

Already resolved by DVTD-36ct — all three panels sit in
`collection/dex/presentation/`, no cross-boundary import between them.

`ConfigChip` / `SwatchChips` stay where they are, and ADR-002's shared-boundary
section now says why: a Tier 1 component that draws a game concept cannot move
to `src/ui/`, because rendering it needs the concept's runtime values and
`src/ui` may take only types from modules. It belongs to the aggregate that owns
the concept; other aggregates import it (cross-aggregate `presentation →
presentation`, already allowed). The bean's claim that the ADRs did not describe
this was written before the 2026-08-12 revision.

### Verification

1480 passing (was 1479), tsc clean, oxlint clean, dependency-cruiser 0
violations across 533 modules.
