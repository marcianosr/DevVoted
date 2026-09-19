---
# DVTD-cfyp
title: 'Config: git rebase -i reorders the gate''s polls'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-05T17:45:50Z
updated_at: 2026-09-16T18:55:12Z
parent: DVTD-72d9
---

A config that sells poll ORDER — an axis nothing on the roster touches.

## Design

`git rebase -i` (uncommon). Reveals the gate's remaining polls by CATEGORY ONLY and lets you drag them into any order during prep. The order locks the moment you answer the first poll.

- gives: "Reorder this gate's polls before it starts"
- costs: "Locks when you answer — you commit before you see a question"

## Why this axis

Per count-the-axes: roster axes in use are coverage magnitude, storage, option elimination, information, audit suppression, shop economy. Sequence is on none of them. Order is load-bearing for four existing configs: Cold Start (x2 opener), Overclock (x4 opener / x0.5 tail), Cache (+25% per consecutive correct in a category), Dependabot (5-in-a-row). Rebase turns all four from luck into a decision.

## Reveal precision

Categories only. Prefetch stays strictly richer (option counts, answer types, next gate's categories), so rebase never obsoletes it and never NEEDS it — synergy, not dependency.

## Todos

- [x] Config field + roster entry
- [x] reorder domain model (pure, legality rule)
- [x] RunAction + zod schema + reducer wiring
- [x] viewmodel exposure (upcoming polls by category, prep-only)
- [x] Tier 1 .ui + Story
- [x] Tier 2 wiring on prep
- [x] wiki + CHANGELOG

## Open

- [x] `movedSlice`: splice-move (remove at from, insert at to). Swap is a one-line change if it feels wrong in play; only differs on non-adjacent moves, which the up/down UI never emits.
- Legacy `/run/prep` (src/modules/run/run/presentation/PrepScreen.ui.tsx) is NOT wired; only the terminal-theme PrepView (/proto-run) has the panel. Convergence is tracked elsewhere.
- Balance knob: 4 slots / 128 KB. Does nothing alone — only pays next to Cold Start, Overclock, Cache or Dependabot.

## Summary of Changes

Verified end to end 2026-09-16. Every ticked todo is genuinely in the code.

- Roster: `gitRebase`, 4 slots, `maxLevel: 2`, `reordersGatePolls: true`
  (`configRoster.model.ts:248`); classified `{ kind: "inPrep" }` in
  `effect.model.ts:202`.
- Domain: `rebase.model.ts` (`rebaserFor`, `canRebase`, `gateSliceOf`,
  `movedSlice`), the `rebase` RunAction and its zod mirror.
- UI: `RebaseList.ui.tsx` renders the gate's five polls as a rebase todo file
  with move presses; `rebaseListFor` in `prepScreen.viewmodel.ts:102`.
- v2 reveals answer types (`showsAnswerTypes`, `ANSWER_TYPE_LEVEL = 2`), not
  the correct count.

**The persistence bug is fixed.** `rebase` rewrites only `RunState.polls`, which
`toRunSnapshot` drops, so the new order used to die with the request (DVTD-mkhg).
`run.repository.ts:585` now calls `rewriteRunPollOrder` inside the same
transaction that holds the `run_states` row lock, holding `position` fixed and
reassigning `poll_id` because `(run_id, position)` is unique. Regression spec at
`run.repository.spec.ts:126` asserts `[2,3,1,4,5]`, with a negative test that
non-rebase actions leave `run_polls` alone.

**One unticked bullet above is stale:** the note that only the terminal-theme
PrepView has the panel and the kanto prep screen is unwired. DVTD-ooii recorded
that gap and DVTD-7g3w closed it; `PrepViewProps` has `onRebase` and
`PrepScreenProps` has the rebase region.
