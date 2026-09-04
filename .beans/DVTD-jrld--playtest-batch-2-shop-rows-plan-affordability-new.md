---
# DVTD-jrld
title: 'Playtest batch 2: shop rows, plan affordability, new storage ladder'
status: completed
type: feature
priority: normal
created_at: 2026-09-03T13:34:11Z
updated_at: 2026-09-03T13:54:02Z
---

Second playtest pass on the terminal-theme shop (follows DVTD-tupk).

## Todos
- [x] 1 armed row: label the price below the description instead of a bare yellow chip beside the effect chips
- [x] 2 slot lines become full-width rows, press on the right; a bought-but-unfilled slot reads "empty" with the cash press
- [x] 3 A/B fold detail uses Figures badges (x1.25, +8KB), like shop rows do
- [x] 4 slot-line refusal text sits below the line, not squeezed beside the buttons
- [x] 5 cannot pick a storage tier whose bill you cannot pay, and cannot leave the shop while the held plan bills more than you hold
- [x] 6 new storage ladder: 256KB free, then 512KB, 1MB, 2MB, 3MB, 5MB, 10MB, with significantly steeper rent
- [x] docs: ADR amendment + wiki numbers + CHANGELOG

## Summary of Changes

**Ladder** (rules.model.ts): 256 free / 512 / 1MB / 2MB / 3MB / 5MB / 10MB, billing 0 / 32 / 96 / 224 / 448 / 768 / 1280. Every rung bills 2-3x the old ladder; the caps double rather than creep. Recorded as a reladder amendment on ADR-046 Decision 3. **The rent numbers are a balance call to tune** - the shape (bottom rung must bite, caps double) is the part worth keeping.

**Affordability** (canAffordPlan): setStoragePlan refuses any rung whose perGateKb exceeds the balance; dropping to a cheaper rung is always allowed. Surfaced as StoragePlanOption.affordable, a disabled upgrade press with an upgradeRefusal line naming both figures, and a shop Continue lock when the plan already held outruns the balance.

**Slot rows**: new src/ui/terminal-theme/SlotDeal.ui.tsx (SlotDealRow + SlotDeal), used by both the shop's Build section and the run-start screen. Full-width Rows inside the divided list: "Slot 5 - empty" with a cinnabar cash press, "Slot 6" with a viridian buy press, price tag on the right, refusal text on the line. BuyLine is no longer used by either screen for slots.

**Armed price**: moved out of the trailing cluster into a labelled line under the description (price / sell price), so the cost stops being read as one of the effect chips.

**Figures in the build rail**: fold body, skipped rows and action rows all run row.detail through Figures.

**Test fallout worth knowing**: the steeper rent broke "Moore's Law compounds" - at L5 (10% a gate) the balance only out-earns the 1 MB rung's 96 KB bill above ~640 KB held, so the spec now starts from 800 KB on tier 2. That is the intended shape, not a regression.

**Verification**: lint clean (901 modules), build exit 0, 2647 tests pass; the 8 failures are the pre-existing set (5 from the working tree's HAND_SIZE = 1000 hack, 3 in legacy modern-theme RewardScreen).
