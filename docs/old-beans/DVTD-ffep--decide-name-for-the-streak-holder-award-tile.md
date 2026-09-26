---
# DVTD-ffep
title: Decide name for the 'Streak holder' award tile
status: todo
type: task
priority: low
created_at: 2026-06-04T15:12:13Z
updated_at: 2026-06-04T15:12:13Z
---

Current label 'Streak holder' is ambiguous — could mean lifetime/run-scoped/correct-answer streak. Need a clearer name before more awards land.

## Options on the table
- **Run Streak** — honest about scope (resets when run ends). 'M, T, J — 14-day streak'.
- **Daily Streak** — neutral, doesn't expose implementation.
- **Unbroken** — flavor name. 'Unbroken: 14 days, no misses'.
- **Days In a Row** — literal but clunky.

## Context
- The streak data lives on `runs.current_streak` (DVTD-i9cq, shipped). It IS run-scoped — dying or quitting resets it.
- Whatever name is picked, the sub-line stays similar: `{N}-day streak` or `{N} days, no misses`.
- May influence the broader naming convention if/when all four social-proof tiles get unified as 'Awards'.

## Todo
- [ ] Pick a name
- [ ] Update label in PostAnswerCarousel
- [ ] Update bean DVTD-i9cq if name changes meaningfully
