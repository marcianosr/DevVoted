---
# DVTD-1hmv
title: 'Gate reward scales with depth: 32KB base x (gatesCleared + 1)'
status: completed
type: feature
priority: normal
created_at: 2026-08-05T10:48:51Z
updated_at: 2026-08-05T10:56:50Z
---

Marciano (2026-08-05): the 80KB flat gate reward becomes depth-scaled — 32KB at gate 1, growing each gate. Implementation mirrors the coverage gate multiplier (gatesCleared + 1) so the game has one scaling concept: payout = round(32 x (gatesCleared+1) x rewardMult x correct/5) + flat clear payouts. Ceilings: gate 1 = 32, gate 5 = 160, gate 12 = 384 (cap 512 will bind late — flagged).

## Summary of Changes

- GATE_REWARD_KB 80 → 32; gateClearPayout now rides gateBaseMultiplier (the coverage curve, gatesCleared + 1) — one scaling concept. Marciano added mid-work: cap the depth multiplier at ×12 (GATE_REWARD_MULTIPLIER_CAP) so endless/continue runs stop scaling. Formula: round(32 × min(g+1, 12) × rewardMult × correct/5) + flats.
- Fixed a latent report bug the morning's correctness scaling introduced: reward/shop screens showed the ceiling (view.gateReward from pipelineModifiersFor) while the reducer paid the scaled amount. New RunState.gateRewardKb persists actual pay (faucetThisGateKb lifecycle: set on clear, reset in finishReward/resume-climb; snapshot spreads state so it persists free). RunView.gateRewardPaidKb feeds RunReward + RunShop; view.gateReward stays the configure preview ceiling.
- Ceilings: gate 1 = 32, gate 5 = 160, gate 12+ = 384. Cap 512 binds late by design.
- Specs: payout cases incl. depth curve + endless cap + reducer-level 4/5 window test (pays 26, not 32); amounts realigned (80→32, 112→64). Wiki §2.2/§5.1/appendix (+cap row, gate-multiplier row now names storage too); CHANGELOG main bullet rewritten, stale '80 KB (down from 120)' clause dropped; ADR-017 formula updated.

Verified: vitest 1063 passed / 110 files, tsc clean, oxlint + depcruise clean.
