---
# DVTD-tjc7
title: 'The band decides nothing about the payout: the whole slope is unwired'
status: completed
type: bug
priority: high
created_at: 2026-09-22T06:43:06Z
updated_at: 2026-10-05T17:34:35Z
---

ADR-076's title is "The band a gate closes in decides what it costs". Two of its five
bands currently cost exactly the same.

## What is actually true

`gateClearPayout` (`build.model.ts:158`) scales by `correct / SLICE_WINDOW` — the raw
count of right answers — and never sees a band, a ratio or a ladder. `closeWindow` adds
`clearKb + interest + extraPickKb + overflowKb + committedKb` and multiplies by nothing.

**OK, HEALTHY and PERFECT pay identical KB.**

The two functions that would produce the slope are built, spec'd and unreachable:

- `payoutRatioFor` (`coverageRatio.model.ts:232`) — `ratio / healthyAt(gate)`. Only caller
  is `gatePayoutKb`, whose only caller is `src/test/kantoGate.factory.ts:107`.
- `perfectBonusFor` / `PERFECT_BONUS` 1.5 (`coverageRatio.model.ts:127`) — same story. The
  1.5 reaches the player only as UI copy in `gateOutcome.viewmodel.ts:452,721`, on a row
  whose amount is `frame.bonusKb`, which has **no production producer**.

Same family as DVTD-j3aw (the `rightsToClear` cluster), and in the same file.

## Three documents assert it is live

- **ADR-076 Decision 3**: *"The cut needs no rule of its own: `payoutRatioFor` is
  `ratio / healthyAt(gate)`, so closing at 30% against a 40% line already pays 0.75x."*
- **ADR-075** — a full bar pays a bonus.
- **wiki 2.6**, the band table's payout column ("Cut in proportion") and the paragraph
  "The OK cut is not a separate penalty".

This is not harmless: ADR-091 Decision 3 (Database, shipped 2026-09-20) justified its
"an OK close commits in full" call on the OK cut already existing. The decision stands;
the reasoning was wrong, and it was wrong because the ADR said so.

## Decision taken 2026-09-21

SLA (DVTD-owif) ships as the first band -> KB slope rather than waiting on this, because
wiring the base slope silently rebalances every gate in the game. The doc claims are
corrected in that pass; the wiring is this bean.

## Todo

- [x] Decide: wire `payoutRatioFor` into `closeWindow`, or delete it and let SLA own the slope
- [x] Same for `perfectBonusFor` — and give `frame.bonusKb` a producer or drop the row
- [x] Re-balance check: OK currently pays full, so wiring the cut is a nerf to every thin clear

## Summary of Changes

Decided 2026-10-05: a boost, not a cut (ADR-191). The clear is multiplied x1 at OK, x1.25 at HEALTHY and x1.5 at PERFECT through `BAND_BONUS` / `bandBonusKbFor`, which generalise the old PERFECT-only bonus. The persisted field became `bandBonusThisGateKb`. The dead `payoutRatioFor`, `gatePayoutKb`, `perfectBonusFor`, `PAYOUT_RATIO_CAP` and `KB_PER_PROVEN_SLOT` are deleted. The prep ladder (via the shared `prepPayoutFor`) now quotes three different figures. The debrief shows **Band bonus** on HEALTHY too, and the OK note no longer claims a cut. The ADR-161 balance specs still pass. Wiki 2.6 and the SLA row are updated.
