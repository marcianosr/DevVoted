---
# DVTD-04q7
title: Reveal states the coverage a miss costs
status: completed
type: bug
priority: normal
created_at: 2026-09-05T19:02:18Z
updated_at: 2026-09-05T19:07:48Z
---

A wrong answer reports a green "+0% coverage earned" while coverage actually drops. `answeredPollFrom` never carries `ledger.coverageLoss`, so the reveal has nothing to show; the loss survives only as a negative inside `coverageBreakdown.base`, which nothing reads.

wiki.md:238 already specifies the fix ("the earn in large type over 'coverage earned', or 'coverage lost' on a miss"). The code never implemented the second half.

## Todo
- [x] AnsweredPoll gains `coverageLost?: number`; answeredPollFrom sets it (undefined at 0, mirroring faucetKb)
- [x] Equation.ui gains `resultTone?: TerminalTone`, default viridian
- [x] RevealView picks earned vs lost; cinnabar `-N%` over "coverage lost"
- [x] Re-remove the "3 options" fact (reverted by a stash pop) + wiki:964
- [x] answer.model.spec: wrong records the loss, partial records none
- [x] RevealView.spec: fix the impossible `coverageEarned: -0.8` miss fixture
- [x] RevealScreen story for a miss
- [x] CHANGELOG (skipped, see summary)
- [x] lint + typecheck + tests

## Summary of Changes

The loss now travels: `AnsweredPoll.coverageLost` (undefined at zero, mirroring `faucetKb`) is set from `ledger.coverageLoss`, `Equation.ui` takes a `resultTone`, and `RevealView.totalFor` picks a cinnabar minus over "coverage lost" instead of a viridian "+0% coverage earned".

No CHANGELOG entry. `docs/changelog-maintenance.md`: a fix only earns one if the broken behaviour shipped in a released version. `RevealView.component.tsx` first appeared 2026-08-27, after 1.3.0 (2026-07-06), and the older `RevealScore.ui.tsx` dates to 2026-08-12 - no released build ever had this reveal, so the miss never reached a player.

The factor row stays empty on a miss rather than showing the approved mock's boxed `wrong / 0`. `coverageFactorsForAnswer` returns undefined at `share <= 0`, and wiki.md:244 is explicit: "A miss keeps the track silent: configs never touch losses, so the loss reads once, on the paid line."

The RevealView.spec miss fixture was encoding an impossible state (`coverageEarned: -0.8`, which `coverageForAnswer` never returns) - that is why the bug looked covered. Corrected to `coverageEarned: 0` / `coverageLost: 0.8`.
