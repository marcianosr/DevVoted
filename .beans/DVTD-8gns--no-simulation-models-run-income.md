---
# DVTD-8gns
title: No simulation models run income
status: todo
type: task
priority: normal
created_at: 2026-09-06T12:48:46Z
updated_at: 2026-09-12T12:56:27Z
---

There is no file anywhere modelling total run income -- nothing named sim/balance/economy/tuning/curve. Every economy tuning pass (GATE_REWARD_KB, STORAGE_PLANS, SLOT_PRICES_KB) has been done by hand against a single assertion in rules.model.spec.ts, which was itself off by one gate until DVTD-x5y1 fixed it.

Balance questions that came up during the slot reladder and could not be answered from the repo: how many slots a normal run reaches, what peak balance is holdable per plan tier, whether COVERAGE_DEMANDS still fits the width runs actually reach.

- [ ] A pure function that plays N gates given a build and a plan strategy, returning income/rent/burn/peak
- [ ] Assert the headline numbers so a reprice moves a test rather than a guess

## Model change 2026-09-12 (DVTD-nd6r)

This got more urgent and its subject moved. Of the three tables named above,
`SLOT_PRICES_KB` is deleted by ADR-074, `STORAGE_PLANS` changes job entirely
(free weight and an upkeep discount, not a KB cap), and the thing that replaces
both is a recurring weight upkeep curve that has never been simulated at all.

The curve is now the economy's main brake, and it was set by hand at five rungs
(4 -> 0, 6 -> 16, 8 -> 32, 12 -> 64, 16 -> 128 KB per gate). ADR-074 leaves the
shape between and above them open on purpose, and a sim is how that gets
answered rather than guessed.

`coverageRatio.model.ts` is the precedent: it is a pure model with a seeded
Monte Carlo in its spec. Follow it.

- [ ] Model income against upkeep per gate, and find where a heavy build stops out-earning its own bill
