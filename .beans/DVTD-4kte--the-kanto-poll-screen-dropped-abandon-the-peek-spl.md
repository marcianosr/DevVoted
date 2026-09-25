---
# DVTD-4kte
title: The poll screen lost abandon, the peek result and the clock
status: todo
type: bug
priority: normal
created_at: 2026-09-16T10:44:43Z
updated_at: 2026-09-24T12:49:38Z
parent: DVTD-0x5c
---

**What:** Bring back three things the poll screen lost in the redesign: abandon run, the split a peek pays for, and the countdown.

**Why:** Abandon is unreachable, the peek buys a number nobody sees, and a timed audit gives no warning.

## Done when
- [ ] A player can abandon a run again, from somewhere on the run
- [ ] The peek shows the split it paid for, or stops promising one
- [ ] Time left is visible while a timed audit runs, or timed audits go

## Notes

Swapping `/run/poll` from the old-theme `AnsweringScreen` to the kanto `PollScreen` (DVTD-iiny) lost three affordances the kit has no slot for:

- **Abandon run.** The old screen carried it as a `Screen.leftAction` with a `ConfirmDialog`. Kanto `Header` has no action slot, and `PollScreen` has no aside. `abandonRun` still exists and is still reachable from nowhere.
- **The peek split.** `usePollSplit` fetched the community split a peek pays for. `PollScreen` takes no split prop, so the peek now buys a hidden number.
- **The timer.** `view.pollTimeLimitMs` drove a visible countdown. `usePollClock` still runs (the engine wants `elapsedMs`), but nothing draws the remaining time, so a timed audit gives no warning.

This is the same shape as DVTD-gzbc: the kanto kit was drawn from mocks that never showed these.

- Decide where abandon lives on the kanto run (header? prep? a run menu?)
- Give `PollScreen` a split readout, or drop the peek's promise
- Give `PollScreen` a clock, or drop timed audits
