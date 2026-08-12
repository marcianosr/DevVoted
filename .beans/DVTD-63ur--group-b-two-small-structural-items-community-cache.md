---
# DVTD-63ur
title: 'Group B: Two small structural items (community cache, dex/polldex layout)'
status: todo
type: task
priority: low
created_at: 2026-08-12T09:12:25Z
updated_at: 2026-08-12T09:12:25Z
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

- [ ] Invalidate the community key from `useRunActions`
- [ ] Add `useRunCommunity` to match `useTodaysRun`
- [ ] Invalidate owned swatches after a gate clear

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

- [ ] Pick one layout for the three dex panels
- [ ] Decide where `ConfigChip` and `SwatchChips` belong if two modules need them
