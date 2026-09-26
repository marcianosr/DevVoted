---
# DVTD-cz6c
title: '.length config: pick-budget check paid by window shape'
status: completed
type: feature
priority: normal
created_at: 2026-08-14T13:17:14Z
updated_at: 2026-08-14T13:32:56Z
parent: DVTD-72d9
---

The gate reveals how many correct answers its window holds; you must spend exactly that many picks. Hitting it pays KB scaled by the window's multiple-choice count. Reward axis is deliberately not a coverage multiplier (roster has four).

## Design route (five rejected shapes, kept for the reasoning)

1. **Info config, no check** (`Shows how many correct answers exist`, trigger: 2+
   multi polls, check: none) — cannot be authored: `RosterConfig` requires a
   `check`, a `focusCategory` or a non-empty linter list. The AGENTS.md scar.
2. **Self-binding correctness** ("assisted polls must be answered correctly") —
   rejected by Marciano: 7 of 9 check kinds already reduce to "get a poll right".
3. **Per-poll count + "at least X" wording as fog** — rejected by Marciano
   himself: a lie that always resolves to the same number has a half-life of
   about three runs, and it taxes trust in every other number the game shows.
   Telemetry's precedent is the rule: withhold precision, never falsify it. Hence
   the *window total*, which is true but incomplete.
4. **Coverage multiplier as the payout** — rejected as cliché, correctly: four
   configs already sell coverage magnitude.
5. **"Halves Telemetry's price"** — rejected as a dead draft: without Telemetry
   the config gives nothing and still owes a check, which is a trap draft
   (ADR-031). The axis survived as its own idea, `.cache` (freeze a fee ladder).

## What shipped

- `check: "pick-budget"`, `storagePerExtraPick: 16`, uncommon, family `check`.
- `GateWindow.budget` (fixed when the window opens, from the polls it will serve)
  and `GateWindow.picks` (only grows). Both optional for legacy snapshots; a
  falsy budget stands the check down, since 0 is impossible for a real window.
- Overspend fails immediately and permanently; underspend fails at close.
  Submit is deliberately NOT blocked at the ceiling: Cold Start already fails on
  the gate's first answer, and blocking would make the check nearly unfailable
  (top up on the last poll). With the number on screen it is an informed choice.
- `extraPickPayoutFor` sits beside `storageInterestFor` for the same documented
  reason: the loadout alone cannot price it. No pass check needed — the reducer
  only calls it on a clear, and a clear means every check passed.
- No `gateReward.model.ts` change needed: `rowFor`'s fallthrough already renders
  the check row with its `6/5` progress on a failed gate, and the clear screen's
  single total already includes the payout.
- `pickBudgetLeft` on the view, and a budget line on PollCard that counts the
  *tentative* selection (2 stories, 6 specs).

## Deferred

- [ ] Shop-exit guard: block leaving the shop with no unconditional check in the
      build. `.length` adds another draw-excusable row to the pile, and
      `gatePassed` counts `skipped` as passing, so an all-skipped checklist still
      clears a gate on 0/5. Own bean.
- [ ] `.cache` (freeze a paid-action fee ladder). Needs a legendary price and a
      heavy check: wiki 4.1 makes fees the way actions are bounded, so freezing
      one is a partial repeal of a pricing rule, and it weakens Telemetry's
      mandatory demand as a side effect. Own bean.
- [ ] Balance: 16 KB/extra pick and the exact-spend rule are both untested in
      play. The ceiling variant ("spend no more than") is the softer fallback if
      the closing-window tension reads as punishing.

## Summary of Changes

Shipped `.length` end to end. Domain: `CheckKind` += `pick-budget`, `Config` += `storagePerExtraPick`, `GateWindow` += `budget`/`picks`, `pickBudgetCheck`, `pickBudgetFor`, `freshWindow` at all three window-open sites, `extraPickPayoutFor` beside `storageInterestFor`, roster entry (uncommon, 16KB). View/UI: `budgeterFor`, `RunView.pickBudgetLeft`, a tentative-selection budget line on PollCard, wired at both AnsweringScreen call sites (/run and /proto-run). 25 new tests (gate check states, payout, reducer, card copy), 2 stories. Docs: wiki 4.3 row + a 4.3 section on the non-outcome check, CHANGELOG entry.

Verified: 1569 tests pass (120 files), tsc clean, oxlint clean, depcruise clean (543 modules).
