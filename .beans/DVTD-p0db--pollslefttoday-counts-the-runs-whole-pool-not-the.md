---
# DVTD-p0db
title: pollsLeftToday counts the run's whole pool, not the day
status: todo
type: bug
priority: normal
created_at: 2026-09-27T17:07:10Z
updated_at: 2026-10-03T15:47:10Z
---

**What:** `RunView.pollsLeftToday` is `polls.length - currentIndex` over the run's entire poll list, so on a seeded database it reads 96 rather than a number of polls for today.

**Why:** `pollsExhausted` is derived from it reaching zero, which is what locks the day and shows the countdown. On a long pool that never happens, so the locked state cannot be reached or tested outside production-sized data.

## Done when

- [ ] The field counts only the polls the day can still hand out
- [ ] The day locks when those are spent, whatever the pool behind it holds
- [ ] A test covers a pool larger than one day's window

## Notes

Found while rebuilding the run hub (DVTD-a6vs). The hub no longer reads the field for its mark, which now counts the gate instead, so nothing player-visible depends on it there. Every other reader still does.

## Finding (2026-10-03)

In production the field is already right for a live run: `rollSegmentForward` trims a run's poll list to today's unanswered segment, so `polls.length - currentIndex` is the day's remainder. It reads 96 only because `db:seed` writes 96 polls into today's seed on purpose, so a whole run fits in one sitting. The no-run and finished-run cases now read a server count (DVTD-ecjo). Proposal: scrap this, or reframe it as 'a local rig can reach the locked day' if that's still wanted.
