# ADR-146: The special roster names moments of a run

## Status

Accepted, 2026-09-29 (Marciano, DVTD-v8e3). Replaces
[ADR-134](134-a-category-title-is-named-not-derived.md) Decision 5 and the eight
special titles [ADR-140](140-the-shelf-holds-the-rank-ladder.md) Decision 4 kept.

## Context

The eight special titles were mostly long counters (reorder the gates 25 times,
peek 50 times) picked because the engine already counted them. The new roster
names single moments a player recognises from their own run.

## Decision 1: sixteen titles, in two batches

Batch 1 is eleven titles that one run step can detect from the state before and
after it, each a one-shot metric at target 1:

| Title | Earned by |
|---|---|
| Hello, World! | a run's first answer exactly right |
| And now it's green! | a won run with every answer exactly right |
| It Compiles | a won run (the existing `runs-won` counter) |
| Ship It | an audited gate cleared at exactly OK |
| 10x Engineer | one answer earning 10 coverage units |
| Stack Overflow | a gate cleared past full coverage, paid as overflow |
| Tested in Production | a gate cleared after missing its first two polls |
| Dependency Hell | holding eight configs at once |
| Clean Install | an install after three rebuilds in one shop |
| I'm a Teapot | holding exactly 418 KB |
| WONTFIX | refusing a SHAKY gate's peel |

Batch 2 (DVTD-vdxt) is YOLO Deploy, rm -rf node_modules, Friday Deploy, Cache Me If
You Can and Git Blame. Each needs data a run step cannot see: a flag kept across the
shop, a per-run count, the date, past answers to one poll, or another player's
incidents.

## Decision 2: the readings

- **Exactly right** means the `correct` outcome. A partial is a miss.
- **OK** means the OK band only. HEALTHY and PERFECT do not earn Ship It.
- **10 units** rather than 10%, because at gate 0 a single unit is already 20%.
- **First poll** means the first of any run, not the first ever, so every account
  can still earn it.
- **Past full** reads the overflow payout, so a surplus too small to pay a KB does
  not count.

## Decision 3: reused ids are cleared

Ship It and Stack Overflow keep their ids. A guarded migration clears all eight old
ids from `equipped_title_ids`, then deletes their `user_titles` rows, so nobody
holds a new title for meeting the old requirement.

`bare-build-clear` lost its only reader with Vanilla JS and is deleted. The other
metrics the old roster read still unlock configs and stay.

## Carried over from ADR-134 Decision 5

Unflattering titles are earned and worn like any other; nothing is worn without
being chosen. `ONE_SHOT_METRICS` is shared by titles and unlocks, so the guard that
every one-shot has a reader lives in the title spec.
