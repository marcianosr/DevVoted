---
# DVTD-7g3w
title: Planning Poker and git rebase -i become playable
status: completed
type: feature
priority: high
created_at: 2026-09-15T12:03:36Z
updated_at: 2026-09-15T12:25:36Z
---

Both configs reduce, are spec'd and ride RunView, but PrepViewProps drops
`estimate`, `estimatedCorrect` and `rebaseSlots`, so prep draws no control and
nothing dispatches either action. Rebase also loses its reorder on the next
dispatch because `toRunSnapshot` is `Omit<RunState, "polls">`.

Plan: /Users/marciano/.claude-work/plans/i-installed-planning-poker-fluffy-floyd.md

Two design changes ride along, decided with Marciano 2026-09-15:

1. Planning Poker pays depth-scaled COVERAGE on a FLOOR, not KB on an exact
   match. `k * (gatesCleared + 1) * 0.25` units when `correct >= k`, which is a
   constant 5% of the gate line per point. Exact match inverted what a low card
   meant (see DVTD-6ce4); the floor makes 1 safe and 5 greedy. Free pick 1..5
   every gate, no deck, no spend.
2. git rebase gains maxLevel 2: v1 lists categories, v2 adds answer type. Keeps
   answerTypesThisGate as Prefetch's headline reveal at v1.

## Todo

### Part A - Planning Poker
- [x] `storagePerEstimate` -> `coveragePerEstimate` on Config + roster copy
- [x] `estimatePayoutUnits` with floor semantics and depth scaling + specs
- [x] `closeWindow` adds the units to `unitsThisGate` BEFORE `gateClosingFor`
- [x] `estimateThisGateKb` -> `estimateThisGateUnits` on RunState
- [x] gate reward row becomes `kind: "coverage"`, drop `perEstimateWeight`
- [x] objective counter uses `>=`, reword the unlock label

### Part B - git rebase
- [x] `rewriteRunPollOrder` + call it from `applyActionToRun` (fixes DVTD-mkhg)
- [x] repository spec proving the order survives a re-read
- [x] `PollSlot.answerType` at level 2, `showsAnswerTypes`
- [x] `isUpgradable` allowlist + `upgradePreview` row + `maxLevel: 2`

### Part C - prep UI (fixes DVTD-ooii)
- [x] `EstimatePicker.ui.tsx` + Story
- [x] `RebaseList.ui.tsx` + Story
- [x] `prepScreen.viewmodel` returns both optional regions
- [x] `PrepScreen.ui` renders them, `PrepView` wires the handlers
- [x] route + proto-run dispatch

### Docs
- [x] ADR-085 supersedes 063 (deleted, citations swept)
- [x] wiki 4.3 roster rows + 4.4 upgrades + constants table
- [x] CHANGELOG
- [x] lint, typecheck, tests

## Summary of Changes

Both configs are playable. Engine was already complete; the work was the payout redesign, the persistence fix and the whole presentation layer.

**Planning Poker** now pays `k * (gatesCleared + 1) * 0.25` coverage units when `correct >= k` (was 32KB on an exact match). `coveragePerEstimate` replaces `storagePerEstimate`; `estimateThisGateUnits` replaces `estimateThisGateKb`. The units join `unitsThisGate` BEFORE `gateClosingFor` reads it, so a won bet can flip a held gate to cleared - there is a spec pinning exactly that. Overflow past the gate line spills to KB via the existing `surplusPayoutKb`. The estimate left the KB pot machinery entirely (`perEstimateWeight` and `StoragePots.estimateKb` deleted).

**git rebase -i** persists now: `rewriteRunPollOrder` writes the moved slice inside the dispatch transaction, holding positions fixed and reassigning `poll_id` because `run_polls` is unique on (run_id, position). Verified red-then-green. It also gained `maxLevel: 2` - v1 categories, v2 adds answer types via `showsAnswerTypes` (which lives in config.model.ts, not rebase.model.ts, or config.model would import a value from a module importing it back).

**UI**: new `EstimatePicker.ui.tsx` and `RebaseList.ui.tsx` with Stories and specs, rendered in prep left column under BandOutcomes, wired through `prepScreen.viewmodel` -> `PrepScreen.ui` -> `PrepView` -> both hosts (`RunPrep` and proto-run). Move presses rather than drag: one press is one {from,to}, keyboard-reachable, no library.

ADR-085 written, ADR-063 deleted, wiki and CHANGELOG updated.

4398 tests pass. The only 2 failures (`gate.model.spec` floor rule) are pre-existing red tests for the unimplemented `clearsGateFloor` TODO - verified failing on a clean tree.

## Deferred

- Planning Poker at 1 slot looks underpriced (94% hit rate on card 3 for ~15% of the line). Left for playtest.
- Every coverage row on the gate reward report renders raw units through `percent()`. Pre-existing across the whole row family; the estimate row matches its neighbours rather than being fixed alone.
