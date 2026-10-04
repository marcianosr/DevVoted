---
# DVTD-ix9e
title: Answers land with feedback and the bar fills in two layers
status: completed
type: feature
priority: high
created_at: 2026-10-01T19:20:03Z
updated_at: 2026-10-01T19:49:06Z
---

**What:** A right answer pulses green and flies its gain into the bar, a wrong answer shakes cinnabar, and the next poll follows on its own.

**Why:** The answer is the core beat of the game and today it lands silently behind a Next press.

## Done when
- [x] A right answer lights the option, pulses its accuracy segment and sends its gain into the bar
- [x] A wrong answer shakes the poll card, marks the correct option and sends nothing
- [x] The next poll follows after a short hold, with input locked while the feedback plays
- [x] The coverage bar fills a lit layer over a dim one, with a marker and gate ticks
- [x] Reduced motion plays no shake, pulse or chip and the bar jumps to its value

## Notes
Source: devvoted-gate-reveal.html prototype. Plan: ~/.claude-work/plans/pasted-content-id-125e-implement-the-humming-teapot.md
- [x] Choice state idle/right/wrong
- [x] AccuracyTrack.ui.tsx + stories
- [x] CoverageBar two layers, ghostAt, settleKey
- [x] PollScreen shake + flight
- [x] useAnswerFeedback hook + RunPoll wiring
- [x] Wiki, changelog, ADR

## Summary of Changes

- Choice/Keycap take state idle|right|wrong; the missed tint is gone.
- New AccuracyTrack.ui.tsx replaces PollScores on the poll screen (equal segments, partial share, pulse).
- CoverageBar is two layers on one band grid, clipped to a registered --coverage-shown; marker, ghostAt, settleKey, number+word ticks (numbers only under 500px via container query); the 1.8s moving pin is removed.
- PollScreen shakes on a wrong answer and flies the gain badge via WAAPI (portal, removed on finish, skipped under reduced motion).
- useAnswerFeedback in PollView holds 650/900ms then calls onNext, so RunPoll and proto-run both auto-advance; the bar holds the pre-answer view until the chip lands.
- gauge-settle redefined in place; answer-shake, segment-pulse, bg-theme-dim, bg-theme-lit added. ADR-170, wiki, changelog.
