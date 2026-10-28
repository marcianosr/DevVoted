---
# DVTD-lwdc
title: A crowded gate unfolds and idle climbers rest
status: completed
type: feature
priority: normal
created_at: 2026-10-28T12:05:40Z
updated_at: 2026-10-28T12:17:24Z
---

**What:** The climb map's +N under a gate opens to every face, and a run with no answer for three days shows as resting, dimmed and behind the active climbers.

**Why:** The start column is crowded with runs whose owner stopped playing, and the hidden faces cannot be reached; runs never expire, so the board has to show who is actually climbing.

## Done when
- [x] Pressing the +N under a gate shows every climber standing there, and pressing it again folds them
- [x] A climber with no answer for three days shows dimmed and after the active climbers, with the days since their last answer
- [x] The community stats line counts resting players
- [x] The wiki and changelog say so

## Notes
- Decided 2026-10-28: the run rule stands (runs never expire, ADR-011). This is presentation only: no sweep, no hiding, no new completion reason. The scrapped expiry bean DVTD-j7ip stays scrapped.
- Cutoff: three days without an answer, counted from the run's latest session answer date, falling back to the run's start day.
- The map unfolds inline rather than using the native popover of the other face stacks, because a popover in the top layer would cover the map's own inspect dialog.

## Summary of Changes
- Domain: `RESTING_AFTER_DAYS = 3`, `idleDaysOf`, `isResting` in the climb map model, with specs.
- Repository: `ClimberRow.lastPlayedOn` from a correlated `max(answer_date)` over the run's session answers, falling back to the run's seed date.
- Service: each climber carries `idleDays`; the view carries `restingPlayers`; `isRestingClimber` exported.
- Ladder viewmodel: resting chips sort after active ones at the same gate and carry `resting: true` plus a `REST_COPY` tooltip with the name and days.
- Community header: a `clock` stat `N resting` with the hint built from the cutoff.
- Climb map: the `+N` is a `FoldPress` that unfolds the column and folds it again; resting chips render dimmed; legend gains resting. Story `ACrowdedStart` on `kantoCrowdedClimbMap()`.
- Wiki §7.1 and changelog updated; the "folded climbers have no chip to press" gap note removed.
- Checks: 340 files / 6335 tests, prettier and oxlint clean on the touched files. The one tsc error left (`shaky` on the climber card fixture) comes from a concurrent session removing the flicker.
