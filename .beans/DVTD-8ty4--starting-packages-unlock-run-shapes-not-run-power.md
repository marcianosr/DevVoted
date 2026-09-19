---
# DVTD-8ty4
title: 'Starting packages: unlock run shapes, not run power'
status: draft
type: feature
created_at: 2026-09-16T09:23:46Z
updated_at: 2026-09-16T09:23:46Z
parent: DVTD-z2r2
---

Every run opens identically. `createRun` hardcodes `build.slots = BASE_SLOTS` (4, the free rung), `storage: 0`, and `startingHand(STARTER_POOL, seed, BASE_SLOTS)` deals 5 for 3. DVTD-ez37 deleted starter stacks, so meta-progression now has nothing to hand a returning player before a run begins, and DVTD-2try's "starter stacks are the onboarding lever" decision died with them.

A starting package is a parameter object for the run opening: build space, starting KB, upkeep rung held at gate 0, hand size, and any pre-installed config. Granted per account, picked on the new-run screen, carried in. That makes it Grant under ADR-051, and the successor to the stack decision.

**The rule: never a straight upgrade. Each package trades one dial against another.** They are different run shapes, not tiers.

## The roster (shapes; numbers are the work)

| package | gives | costs |
|---|---|---|
| Default | 4 space, normal deal | nothing |
| Monorepo | 6 space from gate 0 | holds rung 1, so upkeep bills from the first gate |
| Legacy Codebase | one free 4-slot config | it arrives Deprecated (x3 fading x0.5, deleted at x1) |
| Startup | +128 KB banked | 3 space, so nothing over 3 slots fits the opening |
| Open Source | a wider deal (7 for 3?) | undecided, see below |

Four dials, because those are the four things `createRun` already sets. A package is data, not new mechanics.

## Notes

- **Open Source has no cost yet.** Everyone already starts at zero KB (`storage: 0`), so "zero starting KB" is the default, not a drawback. It needs a real trade before it is worth building: narrower space, or no gate-0 reward.
- Monorepo is the sharpest of the five: `BUILD_SPACE_FROM_GATE = 2` means 6 space at gate 0 is otherwise unbuyable, so it is a shape no default run can reach.
- Startup's 3 space still bills nothing (`rungIndexForSpace(3)` falls back to rung 0). Intended: the pain is the slot ceiling, not the rent.
- `startingHand` already takes a `slotBudget`, so the deal adapts to a package's space with no change.
- Legacy Codebase needs no new decay code; `decayOnClear` applies to any config carrying `coverageMultiplier` + `coverageDecayPerClear`.
- Grant trigger: packages are few, so one authored objective each (Melee model, ADR-051) beats a depth ladder. Ledger follows the `users.unlocked_config_ids` pattern.
- proto-run stays on Default; it cannot read the ledger.

## Work

- [ ] Decide Open Source's cost, then price all five against Default
- [ ] `StartingPackage` type + roster in `run/domain`, read by `createRun`
- [ ] Per-package unlock objective + account ledger
- [ ] New-run screen package picker; locked packages name their requirement (Configdex redaction treatment)
- [ ] Wiki: the run opening is no longer one shape
