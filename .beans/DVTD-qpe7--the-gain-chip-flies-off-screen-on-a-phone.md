---
# DVTD-qpe7
title: The gain chip flies off screen on a phone
status: completed
type: bug
priority: normal
created_at: 2026-10-15T11:52:31Z
updated_at: 2026-10-15T11:57:36Z
---

**What:** On a phone the coverage gain chip flies from the answer to a coverage bar that sits below the fold, so the flight ends off screen, and answering also scrolls the page to the top under it.

**Why:** A playtester said the game is much cooler on desktop because on mobile the flying effects mostly happen off screen.

## Done when
- [x] When the coverage bar is out of view, the chip rises and fades beside the answer instead of flying away
- [x] When the bar is in view, the chip still flies to it

## Notes
GainFlight in PollScreen.ui.tsx measures rects once. Below lg the CoveragePanel stacks under the poll card. useScrollToTop was suspected of scrolling on answer but does not: RunPoll stages the answer result and commits it to the run query only on Next, so allAnswered.length does not change at answer time.

## Summary of Changes

GainFlight in PollScreen.ui.tsx checks the bar's rect with isOnScreen; out of view it plays risePathOf (pop beside the answer, hold, rise 40px and fade) as one animation, then lands and settles. In view it flies and rides as before. Wiki 3 (how an answer lands) and changelog updated.
