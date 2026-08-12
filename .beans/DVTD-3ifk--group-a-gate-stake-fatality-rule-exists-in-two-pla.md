---
# DVTD-3ifk
title: 'Group A: Gate stake fatality rule exists in two places'
status: completed
type: task
priority: high
created_at: 2026-08-12T09:11:30Z
updated_at: 2026-08-12T11:21:07Z
parent: DVTD-82c4
---

The rule "a failed gate kills the run" is written twice, independently.

- `rules.model.ts:100` — `gateStake(strips, configs) => ({ fatal: strips >= configs })`
- `climb/run.model.ts:375-377` — `const quota = dropCount(gatesCleared); const installed = pipeline.configs.length; if (quota >= installed) status = "dead"`

`gateStake` has **no domain caller**. Its only two consumers are Tier 1:
`presentation/screens/AnsweringScreen.ui.tsx:63` and
`presentation/gate/GateStakeReceipt.ui.tsx:33`.

So the UI predicts death with one expression and the engine executes it with
another. They agree today (`runView.viewmodel.ts:314` feeds
`stripsOnFailure: dropCount(state.gatesCleared)`, the same input the engine
uses), so this is a drift risk, not a live fault. If either side changes the
receipt lies to the player about sudden death, which per ADR-017 is the only
warning they get.

## Todo
- [x] Make `gateStake` the single predicate; call it from `closeWindow`
- [x] Assert engine and receipt agree in a spec that would fail on drift
- [x] Decide whether `GateStake.strips/configs` earn their place or only `fatal` is needed

## Summary of Changes

- `closeWindow` now calls the shared predicate instead of re-writing `quota >= installed` (`run/domain/run.model.ts`).
- `GateStake` the type and its echo fields are gone: no caller ever read `.strips`/`.configs`, they already had both. `gateStake()` became `isStakeFatal(strips, configs): boolean`, matching the house style for named conditions.
- Added a parametrised drift test over gates 0/2/4/6/8 asserting the engine kills the run exactly when the receipt predicted it (`run.model.spec.ts`). It reads `stripsOnFailure` and `configs.length` off the RunView, i.e. the same fields GateStakeReceipt consumes.

Note: `ConfiguringScreen.ui.tsx:124` passes `configCount={slots}` rather than `configs.length` in stack-picking mode. Correct, but only because the full-pipeline start rule guarantees they are equal at gate time.
