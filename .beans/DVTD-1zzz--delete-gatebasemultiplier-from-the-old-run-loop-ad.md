---
# DVTD-1zzz
title: Delete gateBaseMultiplier from the old run loop (ADR-073)
status: todo
type: task
priority: normal
created_at: 2026-09-12T12:58:47Z
updated_at: 2026-09-12T12:58:47Z
---

Two coverage engines are live and they disagree about what a correct answer is
worth. `coverageRatio.model.ts` pays a flat 5% (8% for a multiple);
`rules.model.ts`'s `gateBaseMultiplier(gatesCleared) = gatesCleared + 1` still
multiplies the old loop's earn by the gate number.

ADR-073 decision 1 settled it: the gain does not scale, and the HEALTHY line is
the only difficulty dial. Until this comes out, a number quoted to a player
depends on which screen they are standing on.

## Call sites

- `src/modules/run/run/domain/rules.model.ts:93` (the definition)
- `src/modules/run/run/domain/answer.model.ts:274`
- `src/modules/run/build/domain/build.model.ts:154, 165` (one of them capped by
  `GATE_REWARD_MULTIPLIER_CAP`, which exists only because the multiplier does)
- `src/modules/run/run/presentation/PollView.component.tsx:300, 349`

`COVERAGE_DEMANDS` goes with it: a flat gain against a point table priced for a
scaling one is not a balance, and `HEALTHY_LADDER` replaces it.

## Todo

- [ ] Remove the multiplier and `GATE_REWARD_MULTIPLIER_CAP` with it
- [ ] Point the old loop at `coverageRatio.model.ts`, or delete the loop
- [ ] The reveal chip's `base + streak + configs = total` equation has to still add up
