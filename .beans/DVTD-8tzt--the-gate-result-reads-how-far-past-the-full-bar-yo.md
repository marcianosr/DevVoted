---
# DVTD-8tzt
title: The gate result reads how far past the full bar you went
status: completed
type: feature
created_at: 2026-10-04T11:00:05Z
updated_at: 2026-10-04T11:00:05Z
---

**What:** The gate result shows the real coverage reached past 100%, names the surplus overshoot, and splits Coverage into bar, Accuracy and Score sections.

**Why:** The bar capped the reading at 100%, so a strong close looked the same as a bare one, and the bonus copy explained rules instead of results.

## Done when
- [x] The bar's pin reads past 100% when the close ran over
- [x] The Surplus row says how far past the full bar
- [x] Accuracy and Score each stand in their own section, headed alike
- [x] Ledger notes read without a leading dot, in the lighter weight

## Notes
New LastClose.reached (reachedAtClose in gate.model, uncapped coverageGainPercentFor); GateCloseView.reached falls back to held for older rows. Debrief bar held = reached; CoverageBar clamps the fill.

## Summary of Changes
gate.model reachedAtClose; gateClose.model records it; gateClose.viewmodel exposes it; gateOutcome.viewmodel uses it for the bar and the surplus note, bonus detail is now 'See an overview of your results.'; LedgerRows notes lose the marker and go font-normal; GateOutcomeScreen Coverage fold has three sections.
