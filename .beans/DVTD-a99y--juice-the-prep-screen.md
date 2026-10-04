---
# DVTD-a99y
title: Juice the prep screen
status: completed
type: feature
priority: normal
created_at: 2026-10-04T07:16:05Z
updated_at: 2026-10-04T07:32:34Z
---

**What:** Prep shows a short scoring panel, five sealed poll tiles that wiggle, and a shimmering start press with Back under it.

**Why:** Prep read heavy; the juiced design states the same stakes in a third of the text.

## Done when
- [x] At stake no longer shows the gate score row or the reach-band line
- [x] Scoring states single and multiple with their answer steps under each, and the accuracy bonus
- [x] The five polls are five tiles that wiggle once, and show what a prefetch reveals per poll
- [x] The start press shimmers, sits under the polls, and Back sits below it; Community is gone from prep

## Notes
Design: ~/Downloads/devvoted-juiced.html (SCREENS.prep). Plan: cosmic-swimming-frost.

## Summary of Changes

- Scoring is a plain panel: Single choice / Multiple choice up to (badge + credit steps under it) and Accuracy Bonus; curve, line statement and gate table deleted.
- PollTiles.ui: five dashed tiles in the gate colour, wiggle loops every 5s (staggered, off under reduced motion); Prefetch names category per tile, v2 adds answer type + option count; next gate row under.
- runView.answerTypesThisGate is now per poll (AnswerType[]), the split helper is gone.
- BandOutcomes lost the score row and the standing line.
- Action gained shine (press-sheen); ScreenFooter gained asidesAt; prep renders the footer last in the right column, Back below the press, Community dropped.
- Wiki prep section + CHANGELOG updated.
