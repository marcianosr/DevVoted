---
# DVTD-qajw
title: Show 'Removed by ESLint/Stylelint' label on filtered polls
status: todo
type: feature
priority: normal
created_at: 2026-06-15T07:57:59Z
updated_at: 2026-06-15T07:57:59Z
parent: DVTD-3y20
---

When a poll was filtered out of the run by an installed linter config (ESLint, Stylelint, etc.), surface this to the player with a label like "Removed by ESLint" or "Removed by Stylelint" so they can see their configs are actually doing something.

## Why this matters

- Configs are core to the meta-progression, but their effect is invisible today — players install them and have to take it on faith that anything changed
- Making removals visible turns config installs into a tangible cause-effect loop ("I installed ESLint → 2 polls got removed this run")
- Reinforces the developer-tooling metaphor: lint rules removing things is exactly what linters do in real life

## Where it should appear

- Gate summary / run replay (ties into [[DVTD-uret]] animated gate summary — a row could read "Removed by ESLint" instead of a correctness check)
- Possibly the POLLDEX or run history, so players can review what got filtered
- Open question: do we also show this live mid-run, or only in retrospect?

## Acceptance criteria

- [ ] Polls removed by a linter config carry the originating config name in their record
- [ ] Gate summary displays a "Removed by <ConfigName>" label in place of the correctness/coverage delta for those polls
- [ ] Label only renders when the poll was actually removed by a config (not for skipped polls or other removal reasons)
- [ ] Visual style differs from correct/incorrect rows so it doesn't look like a failure

## Open questions

- Should removed polls still count toward the gate's poll index numbering, or be shown as a separate "filtered" section?
- Multiple configs could plausibly remove the same poll — pick the first, or show all?
