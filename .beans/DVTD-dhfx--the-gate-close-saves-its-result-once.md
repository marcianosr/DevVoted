---
# DVTD-dhfx
title: The gate close saves its result once
status: todo
type: task
priority: high
created_at: 2026-09-25T19:45:46Z
updated_at: 2026-09-25T19:45:46Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-yifo
---

**What:** When a gate closes, the run records the verdict, the hold reason, the coverage held, the ladder and the band once, and every screen reads that record.

**Why:** Three screens recompute those from state with three verdict vocabularies and a clamp that already showed a flawless first gate as twenty percent.

## Done when
- [ ] The close record carries verdict, hold reason, held coverage, ladder, band and the day's count for a clear, a floor hold, a band hold, a catch and a fatal
- [ ] The debrief's bar equals the record with no clamp
- [ ] One band classifier lives in the domain, no viewmodel imports a runtime value from the UI kit, and the architecture lint enforces it
- [ ] A run saved before this change still renders its debrief
- [ ] The changelog states the honest debrief bar

## Notes
Plan section "Slice 1". Extend `LastClose` (keep `gate`/`band`/`cleared`; add optional `closing`, `heldBy`, `held`, `ladder`, `correct`). `bandAtLadder(held, ladder)` in `gate.model.ts`; keep `bandFor(ratio, gate)` with an agreement spec. `COVERAGE_BAND_WORD` → `shared/lib/copy.ts`. Delete `closedBarFor`/`closedHeldFor`, the duplicated `GateClosing`, the four verdict switch helpers and `CLOSING_OF`. **Config change:** new depcruise rule `modules-not-into-ui` (runtime only), added to ADR-002 §9. Absorbs DVTD-rose. Must not change: payouts (DVTD-tjc7 out of scope), ADR-076 ruling order, ADR-094 floor, ADR-096 SLA/catch.
