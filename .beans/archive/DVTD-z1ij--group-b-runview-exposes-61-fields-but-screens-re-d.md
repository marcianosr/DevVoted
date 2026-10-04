---
# DVTD-z1ij
title: 'Group B: RunView exposes 61 fields but screens re-derive the answers'
status: completed
type: task
priority: normal
created_at: 2026-08-12T09:11:57Z
updated_at: 2026-08-13T10:15:56Z
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
- [x] Add `modifiers` and `perAnswer` to `RunView`; delete the three rebuilt literals
- [x] Add `canStart`, move the start guard out of `RunConfigure`
- [x] Add one `isOver` (or equivalent) and use it at all five sites
- [x] Cover the moved rules in `runView.viewmodel.spec.ts`

## Summary of Changes

`RunView` now answers the questions the screens were finishing themselves.

### modifiers and perAnswer

The four flat fields (`gateReward`, `rewardMultiplier`, `coverageMultiplier`,
`coverageAdd`) are replaced by one `modifiers: PipelineModifiers`. `toRunView`
was spreading `...pipelineModifiersFor(configs)` at :313, taking apart an object
that already existed so three components could put it back together. It now
assigns the object whole.

`perAnswer: PerAnswerPreview` joins it, computed once in the viewmodel instead
of three identical `perAnswerPreviewFor(view.configs, view.gatesCleared)` calls
from the wiring layer.

Deleted from `RunConfigure`, `RunShop`, `RunPrep` (and three more sites in
`proto-run.tsx`): the hand-assembled literal and the domain import that fed it.

The `.ui.tsx` consumers needed no change: `GateModifierStrip` and
`GateStakeReceipt` already took a `modifiers` object. Only the middle layer was
disassembling and reassembling.

### canStart

`run.model.ts` exports `canStart(pipeline)`, and the reducer's `start` now calls
it rather than restating `configs.length < slots`. `RunConfigure` lost its
`slotsLeft`/`canStart` pair and the comment admitting the mirror.

This also closes **DVTD-fcr8**, filed earlier the same day off the same defect.

### isOver

`run.model.ts` exports `isRunOver(status)`. Applied at `RunLayout:38` (via a new
`view.isOver`) and at `run.repository.ts:588` and `:634`.

Note the bean overstated this one: `RunPrep:19` and `RunReview:29` test
`rewarding` and `awaiting-strip`, which are different questions, not variants of
this one, and `RunStrip` has no such check. Three real sites, not five, and two
of them in infrastructure rather than Tier 2.

### Tests

`runView.viewmodel.spec.ts` gains `describe("the view answers what screens used
to re-derive")` with 5 tests. The two `canStart` cases assert the view and the
reducer together (view says false, reducer refuses to leave `configuring`; view
says true, reducer reaches `answering`) so the pair cannot drift apart silently.
`isOver` is checked against both terminal statuses and all four live ones.

Verified: tsc clean, 1457 tests passing before the new specs, 41 in the touched
file after.
