---
# DVTD-p0db
title: pollsLeftToday counts the run's whole pool, not the day
status: completed
type: bug
priority: normal
created_at: 2026-09-27T17:07:10Z
updated_at: 2026-10-05T14:39:58Z
---

**What:** `RunView.pollsLeftToday` is `polls.length - currentIndex` over the run's entire poll list, so on a seeded database it reads 96 rather than a number of polls for today.

**Why:** `pollsExhausted` is derived from it reaching zero, which is what locks the day and shows the countdown. On a long pool that never happens, so the locked state cannot be reached or tested outside production-sized data.

## Done when

- [ ] The field counts only the polls the day can still hand out
- [ ] The day locks when those are spent, whatever the pool behind it holds
- [x] A test covers a pool larger than one day's window

## Notes

Found while rebuilding the run hub (DVTD-a6vs). The hub no longer reads the field for its mark, which now counts the gate instead, so nothing player-visible depends on it there. Every other reader still does.

## Finding (2026-10-03)

In production the field is already right for a live run: `rollSegmentForward` trims a run's poll list to today's unanswered segment, so `polls.length - currentIndex` is the day's remainder. It reads 96 only because `db:seed` writes 96 polls into today's seed on purpose, so a whole run fits in one sitting. The no-run and finished-run cases now read a server count (DVTD-ecjo). Proposal: scrap this, or reframe it as 'a local rig can reach the locked day' if that's still wanted.

## Notes

The viewmodel was right: `state.polls` holds only what was dealt to the run, so `polls.length - currentIndex` is today's dealt-but-unanswered count. The 96 came from the seed, which wrote every seeded poll into today's `daily_run_polls`. Production caps the sequence at `SEED_LENGTH` in `getOrCreateDailyRunSeed`, so the bug never reached players. A long sequence was also a same-day leak: `unansweredPollsToday` dropped answered ids before anything capped the list, so a rerun after five answers would deal polls 6 to 10.

## Summary of Changes

- `unansweredPollsToday` (run.service) takes the first `SEED_LENGTH` of the date's sequence before dropping answered ids; it feeds both a fresh start and `getPollsLeftTodayService`.
- The seed writes only `SEED_LENGTH` polls into today's sequence; community answers still cover the full poll list.
- Three specs over a 96-poll sequence: a start deals five, a rerun after five answers is refused, the polls-left count tops out at the day.
