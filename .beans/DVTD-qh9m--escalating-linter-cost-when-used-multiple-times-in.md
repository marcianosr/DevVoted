---
# DVTD-qh9m
title: Escalating linter cost when used multiple times in a single poll
status: completed
type: feature
priority: normal
created_at: 2026-07-18T08:21:18Z
updated_at: 2026-07-27T16:56:43Z
parent: DVTD-kulw
---

## Problem

Running the linter (ESLint/Stylelint defense configs) costs a flat `LINT_COST = 40`KB per click (`src/modules/run/climb/run.model.ts:39`). On polls with several wrong options you can click it repeatedly at the same flat price, mechanically narrowing the poll down with no escalating trade-off. Flat pricing makes spamming the strictly dominant move whenever storage allows.

## Desired behavior

Each linter use *within the same poll* costs more than the previous one. The counter resets when moving to the next poll (same lifecycle as `manualDisabled`, which already resets per poll).

## Design decision (open)

Pick an escalation curve — needs a game-design pass:

- **Doubling**: 40 → 80 → 160 (harsh, effectively caps at 2 uses early-run)
- **Flat step**: 40 → 60 → 80 (gentle, keeps multi-lint viable late-run)

## Implementation notes

- `spendLint` / `canRunLinter` in `src/modules/run/climb/run.model.ts` currently read the constant directly; cost must become a function of lint-uses-this-poll (derivable from `manualDisabled.length`, no new state needed).
- Surface the *next* cost in the button label — the UI currently shows a hard-coded "(40KB)" (`src/modules/run/presentation/poll/PollCard.ui.tsx`); it must render the escalated price so the player sees the price rise before clicking.
- Update the run log line `Ran the linter (-XKB)` to show the actual amount spent.
- Tests: cost escalation per click, reset on next poll, `canRunLinter` gating against the *escalated* cost.

## Todo

- [x] Decide escalation curve (game design)
- [x] Derive lint cost from uses-this-poll in run.model.ts
- [x] Show next cost in PollCard button label
- [x] Log actual spent amount
- [x] Tests for escalation, reset, and storage gating

## Design decision (resolved 2026-07-27)

Doubling curve, re-based from 40 to a cheaper start: LINT_COSTS = [8, 16, 32, 64, 128, 256], indexed by manualDisabled.length (uses-this-poll), capped at 256. First use drops 40 -> 8; cheaper than the old flat 40 for the first ~4 cumulative uses, then steeper. Part of a wider KB-economy balance pass (see sibling balance bean).

## Summary of Changes

LINT_COST scalar (40) replaced by LINT_COSTS = [8,16,32,64,128,256] with lintCost(usesThisPoll) accessor in run.model.ts (mirrors rebuildCost). Cost indexes state.manualDisabled.length (linter runs this poll, resets per poll) — no new state. canRunLinter and spendLint compute the current cost; the run log records the actual amount spent. Viewmodel exposes view.lintCost = next price; PollCard button already renders it, so it now steps 8 -> 16 -> 32... live. Tests: escalation (8 then 16), gating, and reset covered in run.model.spec. Part of the wider KB-economy pass (DVTD-ggxi). Verified: tsc 0 errors, tests green.
