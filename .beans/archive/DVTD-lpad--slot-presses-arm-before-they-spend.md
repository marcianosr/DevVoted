---
# DVTD-lpad
title: Slot presses arm before they spend
status: completed
type: feature
priority: normal
created_at: 2026-08-31T08:29:00Z
updated_at: 2026-08-31T08:33:15Z
---

A press on the track's hatched stub or its empty cell spends KB with no visible verb: the label lives in a hover tooltip, which touch never fires. First press arms (caption carries the quote, cell border turns celadon), second press acts — the same two-step the shop's offer rows already use.

## Todo
- [x] SlotTrack renders an armed press and lends the caption to its quote
- [x] ShopView owns the armed flag and decides arm-vs-act
- [x] Story for the armed state
- [x] Update specs
- [x] lint, typecheck, tests
- [x] Wiki + changelog

## Summary of Changes

`SlotDeal` gained `armed` and `onDismiss`. An armed press swaps its cell's border to celadon (the cell is ~50px on a phone, too narrow to grow a verb into) and lends the caption line its full quote plus `· press again`; its aria-label gains `press again to confirm`. Blur and Escape call `onDismiss`, so moving focus disarms — no document listeners.

The armed flag lives in `ShopView.component.tsx`, not in `SlotTrack.ui.tsx`: no `.ui.tsx` under `src/ui/modern-theme/` uses a hook, the island's state is all CSS (`details`/`group-open`/`peer`), and arming has no CSS-only form without a `details` wrapper. Tier 2 owning it keeps that intact and matches ADR-010 — the track reports a press, its owner decides arm-or-act.

Follow-up left open: DVTD-aiyp, every other hint on the island is still hover-only.
