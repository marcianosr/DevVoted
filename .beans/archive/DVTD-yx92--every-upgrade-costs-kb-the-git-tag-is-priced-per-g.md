---
# DVTD-yx92
title: Every upgrade costs KB; the git tag is priced per gate
status: completed
type: task
priority: normal
created_at: 2026-08-18T15:26:36Z
updated_at: 2026-08-18T15:33:59Z
parent: DVTD-kulw
---

Two quick fixes from a playtest screenshot.

**1. Focus upgrades cost KB too.** They were coverage-gated and free, so the Upgrade button showed no price at all. Now every upgrade pays `upgradeStorageCost(level)`, and a Focus config answers to both gates: coverage says the level is earned, KB says it is affordable. Neither stands in for the other, and the tooltip names whichever one is missing.

**2. The git tag is priced by the gate it marks** (`pinCostFor`): 128KB at gate 4, +64KB per gate, 512KB at gate 10 — which is also the last gate that sells one (`PIN_UNTIL_GATE`). One use per purchase, already true via `consumePinnedGate`; a rescued run's shop sells another from scratch.

## Also fixed in the same pass

**The clear-reward preview ignored the gate multiplier.** `pipelineModifiersFor` computed `gateReward` as `GATE_REWARD_KB × rewardMultiplier` — no `gatesCleared + 1` and no correctness factor — so the receipt's "Gate cleared" row read 32KB at Cascade where the clear pays 96KB, and would have read 32KB at the summit against 416KB. It now delegates to `gateClearPayout(configs, SLICE_WINDOW, gatesCleared)`, i.e. what a full window actually pays, with a spec asserting the two agree at gates 0/1/5/12. `pipelineModifiersFor` took a `gatesCleared` param to do it (same shape `perAnswerPreviewFor` already had), which the three call sites already had to hand.

**Deprecated's tie-break is now a seeded roll.** It took the highest-level config and broke ties on config id, which in an un-upgraded build meant it always took whatever sorted first alphabetically — a hidden preference the receipt never stated. It now rolls among everything tied at the top level, so three of the four offline audits are outright random and Deprecated is the only one that aims.

## Summary of Changes

Domain: `upgrade` collapses to one guard plus one charge; `pinCostFor` + `PIN_UNTIL_GATE` replace the flat `PIN_COST_KB`; `pinSoldAt` bounds the sales window; `pipelineModifiersFor` takes the gate; `highestLevel` rolls among ties.

Shop: the Upgrade button always carries its price, `upgradeEarned`/`upgradeAffordable` are asked separately so the tooltip names whichever gate is in the way, and the git tag's tooltip states the rising price, the gate-10 ceiling and the rebuy.

Docs: ADR-039 written and indexed, ADR-036 Decisions 1/2 amended, ADR-038's picker paragraph corrected, wiki §4.4/§5.2/glossary/appendix, three CHANGELOG entries (one of them a real `Fixed`).

**Verification.** 1596 tests / 121 files green, oxlint + dependency-cruiser + tsc + build clean. Uncommitted.
