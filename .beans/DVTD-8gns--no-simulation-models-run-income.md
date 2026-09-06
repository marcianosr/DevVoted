---
# DVTD-8gns
title: No simulation models run income
status: todo
type: task
priority: normal
created_at: 2026-09-06T12:48:46Z
updated_at: 2026-09-06T12:48:46Z
---

There is no file anywhere modelling total run income -- nothing named sim/balance/economy/tuning/curve. Every economy tuning pass (GATE_REWARD_KB, STORAGE_PLANS, SLOT_PRICES_KB) has been done by hand against a single assertion in rules.model.spec.ts, which was itself off by one gate until DVTD-x5y1 fixed it.

Balance questions that came up during the slot reladder and could not be answered from the repo: how many slots a normal run reaches, what peak balance is holdable per plan tier, whether COVERAGE_DEMANDS still fits the width runs actually reach.

- [ ] A pure function that plays N gates given a build and a plan strategy, returning income/rent/burn/peak
- [ ] Assert the headline numbers so a reprice moves a test rather than a guess
