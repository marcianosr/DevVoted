---
# DVTD-4kte
title: The kanto poll screen dropped abandon, the peek split and the clock
status: todo
type: bug
priority: normal
created_at: 2026-09-16T10:44:43Z
updated_at: 2026-09-16T10:44:43Z
parent: DVTD-0x5c
---

Swapping `/run/poll` from the old-theme `AnsweringScreen` to the kanto `PollScreen` (DVTD-iiny) lost three affordances the kit has no slot for:

- **Abandon run.** The old screen carried it as a `Screen.leftAction` with a `ConfirmDialog`. Kanto `Header` has no action slot, and `PollScreen` has no aside. `abandonRun` still exists and is still reachable from nowhere.
- **The peek split.** `usePollSplit` fetched the community split a peek pays for. `PollScreen` takes no split prop, so the peek now buys a hidden number.
- **The timer.** `view.pollTimeLimitMs` drove a visible countdown. `usePollClock` still runs (the engine wants `elapsedMs`), but nothing draws the remaining time, so a timed audit gives no warning.

This is the same shape as DVTD-gzbc: the kanto kit was drawn from mocks that never showed these.

- [ ] Decide where abandon lives on the kanto run (header? prep? a run menu?)
- [ ] Give `PollScreen` a split readout, or drop the peek's promise
- [ ] Give `PollScreen` a clock, or drop timed audits
