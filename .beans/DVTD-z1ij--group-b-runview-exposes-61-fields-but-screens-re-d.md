---
# DVTD-z1ij
title: 'Group B: RunView exposes 61 fields but screens re-derive the answers'
status: todo
type: task
created_at: 2026-08-12T09:11:57Z
updated_at: 2026-08-12T09:11:57Z
parent: DVTD-82c4
---

`RunState` has 30 fields (`climb/run.model.ts:163`). `RunView` has **61**
(`view/runView.viewmodel.ts:74`). The viewmodel roughly doubles the field count
on the way out, and the screens still finish the job themselves, each in their
own way.

Deletion test: delete `RunView` and complexity reappears in 11 components. It
earns its keep. It is simply unfinished.

Re-derived in Tier 2 today:
- `perAnswerPreviewFor(view.configs, view.gatesCleared)` called identically in `RunConfigure.component.tsx:35`, `RunShop.component.tsx:53`, `RunPrep.component.tsx:59` — a domain function invoked from the wiring layer, three times
- the same `modifiers={{ gateReward, rewardMultiplier, coverageMultiplier, coverageAdd }}` literal rebuilt in those same three files, re-bundling four fields `toRunView:307` had just flattened via `pipelineModifiersFor`
- `canStart` in `RunConfigure.component.tsx:17-19`, carrying its own comment "Mirrors the engine`s start guard"
- "is the run over" written five ways: `RunLayout:38`, `RunOver:25`, `RunReview:29`, `RunPrep:19`, `RunStrip:17`, plus twice more in `api/queries.ts:588` and `:634`

ADR-010 accepts prop flattening as a cost, so this is not an ADR conflict. The
issue is that the flattening stops one step short of the answer.

## Todo
- [ ] Add `modifiers` and `perAnswer` to `RunView`; delete the three rebuilt literals
- [ ] Add `canStart`, move the start guard out of `RunConfigure`
- [ ] Add one `isOver` (or equivalent) and use it at all five sites
- [ ] Cover the moved rules in `runView.viewmodel.spec.ts`
