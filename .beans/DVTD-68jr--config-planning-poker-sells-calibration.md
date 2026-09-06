---
# DVTD-68jr
title: 'Config: Planning Poker sells calibration'
status: draft
type: feature
created_at: 2026-09-06T07:17:49Z
updated_at: 2026-09-06T07:17:49Z
parent: DVTD-72d9
---

## Design (2026-09-06 session)

- 1 slot. At the stake receipt, commit an estimate: how many of the window's 5 polls you will answer correctly (exact-set correctness, the binary streak rule; partials count as misses).
- An exact hit pays 32 KB × estimate at gate resolution. Anything else pays nothing.
- Pays KB only, never coverage: it can never rescue a meter (coverage is score, storage is reward).
- Pays on a missed gate too: predicting your own 2/5 disaster is calibration, and calibration is what the config sells. It is the first config to score self-knowledge, which nothing on the roster touches.

## Balance

- The linear payout is roughly EV-flat across honest estimates under a binomial model (at p=0.8, estimating 4 EVs ~52 KB and estimating 5 ~52 KB), so a calibrated player earns about a slot's worth per gate at any skill level and only miscalibration loses. The binomial is the difficulty table.
- Self-policing: throwing an answer to land a low estimate costs 1.5x+ an answer's earn in bleed; a skip-heavy sandbag misses the gate and eats the peel.
- No audit special-casing: the estimate reads the window's final correct count whatever the rules did to it (a 408 timeout busts it like any miss; 300 mirror correctness stays binary).
- Synergy, not dependency: Prefetch and .length sharpen estimates; a linter raises your accuracy after you have already committed.

## Todo

- [ ] Sim the payout (32 KB × estimate is the placeholder; consider gate scaling)
- [ ] Decide the upgrade path (L2 pays half on ±1?)
- [ ] Decide payout-vs-death ordering when the run ends at the same gate
