---
# DVTD-qh9m
title: Escalating linter cost when used multiple times in a single poll
status: todo
type: feature
created_at: 2026-07-18T08:21:18Z
updated_at: 2026-07-18T08:21:18Z
parent: DVTD-u35m
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

- [ ] Decide escalation curve (game design)
- [ ] Derive lint cost from uses-this-poll in run.model.ts
- [ ] Show next cost in PollCard button label
- [ ] Log actual spent amount
- [ ] Tests for escalation, reset, and storage gating
