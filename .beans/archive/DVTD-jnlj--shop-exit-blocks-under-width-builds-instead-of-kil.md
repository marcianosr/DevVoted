---
# DVTD-jnlj
title: Shop exit blocks under-width builds instead of killing at the door
status: completed
type: bug
priority: normal
created_at: 2026-08-11T17:39:25Z
updated_at: 2026-08-11T18:12:33Z
---

Playtest report (2026-08-11): pass gate 4 via strip-replay holding 3 configs, gate 5 demands 4, leaving the shop kills the run (finishReward, ADR-027 door grading). A warned click that ends the run is still a trap.

Decision (Marciano): the shop exit is BLOCKED while the build is under minConfigsForGate and a repair move exists (affordable draft offer, or affordable rebuild, with a free slot). When no repair move exists (broke or slot-capped), the exit turns into an explicit cinnabar "End run" click — death stays at the gate door (ADR-021), but never as a surprise.

- [x] Model: canRepairWidthDemand predicate + finishReward refuses (repairable) / kills (dead end)
- [x] Viewmodel: expose repairability (widthRepairable) + shopExitFor presentation helper
- [x] Proto-run + routed RunShop: 3-state exit (continue / blocked / end-run)
- [x] Tests for model, viewmodel, shop exit states (run.model, runView, RunLayout specs)
- [x] ADR-031 (amends ADR-027 Decision 2, inline markers added); wiki §2.2/§5.2 + CHANGELOG entry amended

## Summary of Changes

- canRepairWidthDemand (run.model): free slot AND (affordable unowned offer OR storage >= rebuildCost + CHEAPEST_DRAFT_COST_KB). finishReward refuses the exit while it holds; ends the run (with a cannot-repair log line) only when provably stuck.
- shopExitFor (runView.viewmodel) renders the one exit for both surfaces: open / disabled-with-shortfall-hint / cinnabar End-run click (new variant passthrough on ScreenAction, ButtonVariant exported).
- GateStakeReceipt copy: Climbing-on-ends-the-run replaced by Install-N-more-to-climb-on.
- Specs: rewrote the ADR-027 door tests (blocked / rebuild-hope boundary at 35 vs 36KB / slot-capped), replay-exemption test now asserts the hold; viewmodel + RunLayout cover all three exit states.
