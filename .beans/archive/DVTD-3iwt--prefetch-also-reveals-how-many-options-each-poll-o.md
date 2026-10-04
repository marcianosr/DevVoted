---
# DVTD-3iwt
title: Prefetch also reveals how many options each poll offers
status: completed
type: feature
priority: normal
created_at: 2026-09-05T08:25:13Z
updated_at: 2026-09-05T08:32:47Z
---

Prep's window panel gains an 'options' reading next to 'type': how many answer options the remaining polls of this gate offer. Same slice and same prefetcherFor gate as answerTypesThisGate, so all three Prefetch lines describe the same set.

- [x] RunView.optionCountsThisGate gated on prefetcherFor (mapped inline, like upcomingCategories)
- [x] Prep's options row fills when Prefetch is in the build, ??? otherwise
- [x] Config copy and wiki line 470 name the new reveal

## Summary of Changes

Prep's window panel gains an **options** row under **type**: how many answers each remaining poll of this gate offers, in play order (4 · 4 · 5 · 6 · 4), credited to Prefetch like the rows around it. Same slice and same `prefetcherFor` gate as `answerTypesThisGate`, so the three reveals always describe one set; an empty window redacts to ??? the way the categories row already does.

UI: `RevealedCounts` + `CountLine` sit next to `Revealed` + `TallyLine` in PrepScreen.ui; `Divider` and `Source` extracted so both pairs share the separator and the credit badge.

## Design consequence

DVTD-8alw deliberately kept v1 selling the DISTRIBUTION, not the ORDER, reserving per-poll precision for a Prefetch v2. Play order was picked anyway (Marciano's call from three offered shapes), so v2 now needs a different axis: which poll is the multi-answer one, or the questions themselves.
