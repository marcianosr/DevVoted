---
# DVTD-x5y1
title: Reladder slots to a uniform x1.25 climb
status: completed
type: task
priority: normal
created_at: 2026-09-06T12:41:29Z
updated_at: 2026-09-06T12:48:31Z
---

The slot ladder doubles every second rung (16 KB to 32768 KB). Too steep to climb, and slots 21-24 cost more than the largest storage cap holds, so they cannot be bought in any run of any length. Reprice to a uniform ~x1.25 climb from a 32 KB floor, 20 rungs, MAX_SLOTS unchanged at 24.

- [x] SLOT_PRICES_KB repriced in rules.model.ts
- [x] rules.model.spec.ts: drop the two doubling-shape tests, add step-band + geometric-mean + 8 KB grid + every-rung-under-the-cap
- [x] rules.model.spec.ts: fix the off-by-one perfectRunKb formula (2496 -> 2912, summed from gateBaseMultiplier)
- [x] Value-asserting specs moved (runView.viewmodel, shopAction, ShopScreen, ShopView, StartView)
- [x] Stories with hard-coded prices
- [x] ADR-046 Decision 1 amendment + cross-note to ADR-049
- [x] wiki + CHANGELOG amended in place
- [x] lint, typecheck, tests

## Summary of Changes

`SLOT_PRICES_KB` is now a uniform ~x1.25 climb from a 32 KB floor, snapped to the 8 KB grid:
32 40 48 64 80 96 120 160 192 240 288 384 480 576 704 896 1152 1408 1792 2304.
Twenty rungs, so MAX_SLOTS stays 24 and nothing depending on the ceiling moved.

**What it fixes.** The old top four rungs (12288-32768 KB) cost more than the largest storage
plan holds (10240 KB), so they could not be bought in a run of any length -- `canBuySlot`
tests the balance against the price while `cappedStorage` clamps the balance to the cap.
Every rung is now at or below the top cap, asserted as a new law. Reaching 16 slots drops
from 6960 KB to 1744 KB against a measured perfect-run income of 2912 KB.

**What it preserves.** The whole ladder is 11056 KB against a ~9833 KB absolute income
ceiling, so 24 slots stays endless-run territory. The spec now asserts a floor of three
perfect climbs rather than a bare inequality, since the margin fell from 46x to 3.8x and its
size is now the design decision.

**Tests.** Dropped the two doubling-shape tests; added a step band [1.2, 1.35], a geometric
mean of 1.25, an 8 KB grid check, and every-rung-under-TOP_PLAN.capKb. The opening-rung test
now asserts against CHEAPEST_DRAFT_COST_KB rather than a literal, so the cross-module fact
cannot go stale in prose again. Fixed the off-by-one in perfectRunKb (was GATE_COUNT *
(GATE_COUNT-1)/2 = 2496; a perfect climb is 2912) by summing gateBaseMultiplier under
GATE_REWARD_MULTIPLIER_CAP rather than patching the closed form.

**Docs.** ADR-046 Decision 1 amended with a dated reladder note naming all three softened
brakes; Decision 2's example numbers corrected. ADR-049 amended -- its Decision 2 argument is
now materially wrong, not just stale. wiki 3, 5.1, action table, glossary and numbers
appendix updated. The two CHANGELOG entries stating the old ladder were amended in place
rather than contradicted by a third.

Verified: lint clean, 404 slot-related tests pass, 3690 pass overall. The 9 remaining
failures (RewardScreen, PrepScreen, its story smoke) are the same three files as the
pre-change baseline: RewardScreen is pre-existing at HEAD, PrepScreen belongs to parallel
edits in the working tree. Two tsc errors (`coverageFor` unused in ShopView.component,
PrepScreen.spec's dropped `ready` prop) are likewise from those parallel edits.
