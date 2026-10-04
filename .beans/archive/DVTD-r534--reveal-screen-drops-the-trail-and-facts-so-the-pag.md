---
# DVTD-r534
title: Reveal screen drops the trail and facts, so the page jumps
status: completed
type: bug
created_at: 2026-09-06T06:56:54Z
updated_at: 2026-09-06T06:56:54Z
parent: DVTD-tduu
---

Going from poll to reveal, the block above the question shrank by two rows: the
trail (1 › 2 › 3 › 4 › 5) and the facts line (category · scores · wrong costs ·
gate retry cost) were only on PollScreen. Everything below jumped up.

## Summary of Changes

Extracted `PollInfo.ui.tsx` — trail, audits, and the category/facts line — and
mounted it on both PollScreen and RevealScreen. The block is now one component,
so the two screens cannot drift apart again; copying the markup would have
fixed today's jump and left tomorrow's open.

`RevealScreenProps` gains `trail` and `facts`. `PollFact` moved to PollInfo and
is re-exported from PollScreen, so existing importers are untouched. `factsFor`
is now exported and takes a structural `ScoredShape` (`options` + optional
`answerType`) so both RunPoll and AnsweredPoll satisfy it without a cast.

`revealTrailFor` sets `current` to the poll just answered rather than
`trailFor`'s next-poll index — on the reveal you are still looking at the poll
you answered, and Trail lets a verdict colour the dot while `current` bolds the
number.

Two regression tests pin it: the trail and facts survive a miss, and the
revealed poll is the current step.

Not fixed here: a total miss still renders an empty equation factor row
(`coverageFactorsForAnswer` bails at `share <= 0`). That is a separate design
question — the loss does scale with the build, so it has factors worth showing.
