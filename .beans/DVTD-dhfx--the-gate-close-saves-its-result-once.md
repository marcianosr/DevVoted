---
# DVTD-dhfx
title: The gate close saves its result once
status: completed
type: task
priority: high
created_at: 2026-09-25T19:45:46Z
updated_at: 2026-09-30T16:42:37Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-yifo
---

**What:** When a gate closes, the run records the verdict, the hold reason, the coverage held, the ladder and the band once, and every screen reads that record.

**Why:** Three screens recompute those from state with three verdict vocabularies and a clamp that already showed a flawless first gate as twenty percent.

## Done when
- [x] The close record carries verdict, hold reason, held coverage, ladder, band and the day's count for a clear, a floor hold, a band hold, a catch and a fatal
- [x] The debrief's bar equals the record with no clamp
- [x] One band classifier lives in the domain and no viewmodel imports the kit's classifier (the lint rule waits for the copy imports, see the follow-up bean in Notes)
- [x] A run saved before this change still renders its debrief
- [x] The changelog states the honest debrief bar

## Notes
Plan section "Slice 1". Extend `LastClose` (keep `gate`/`band`/`cleared`; add optional `closing`, `heldBy`, `held`, `ladder`, `correct`). `bandAtLadder(held, ladder)` in `gate.model.ts`; keep `bandFor(ratio, gate)` with an agreement spec. `COVERAGE_BAND_WORD` → `shared/lib/copy.ts`. Delete `closedBarFor`/`closedHeldFor`, the duplicated `GateClosing`, the four verdict switch helpers and `CLOSING_OF`. **Config change:** new depcruise rule `modules-not-into-ui` (runtime only), added to ADR-002 §9. Absorbs DVTD-rose. Must not change: payouts (DVTD-tjc7 out of scope), ADR-076 ruling order, ADR-094 floor, ADR-096 SLA/catch.

## Summary of Changes (2026-09-30)

ADR-160. `LastClose` carries closing, heldBy, held, ladder and correct; `closeWindow` writes it on every exit with the band the ruling used (`closingBandFor`). `gate.model.ts` owns `bandAtLadder` / `bandAtClose` / `heldAtClose` / `ladderAtClose`. New `gateClose.viewmodel.ts` (`GateCloseView`, `gateCloseViewOf`) fills pre-record snapshots; `RunView.lastClose`. `gateOutcome.viewmodel.ts` lost `GateClosing`, `closedBarFor`, `closedHeldFor` and every `clearsAt` re-ruling; `GateOutcomeView` takes no verdict and draws nothing without a close. `GatePayout` lost `clearedGateLadder`, `clearedCoverageHeld`, `heldBy`. The hub bands the coming gate on the audited ladder; `runOverScreen` reads `freeWeight` / `emptyCreditKb` / `perGateKb` from `BuildSpaceView` (the vendor-lock upkeep bug). The kit's `coverageBandOf` is deleted and `CoverageBarProps.band` is required (DVTD-st9v). The config-story rig closes a full window before drawing a debrief. Not done: the `modules-not-into-ui` dependency-cruiser rule, because fifteen application files still import kit copy values (follow-up bean filed).
