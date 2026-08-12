---
# DVTD-3ifk
title: 'Group A: Gate stake fatality rule exists in two places'
status: todo
type: task
priority: high
created_at: 2026-08-12T09:11:30Z
updated_at: 2026-08-12T09:11:30Z
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
- [ ] Make `gateStake` the single predicate; call it from `closeWindow`
- [ ] Assert engine and receipt agree in a spec that would fail on drift
- [ ] Decide whether `GateStake.strips/configs` earn their place or only `fatal` is needed
