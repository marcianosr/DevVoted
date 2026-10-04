---
# DVTD-k9fr
title: The gain chip lands before the next poll, and Scoring reads your build
status: completed
type: feature
created_at: 2026-10-04T13:07:46Z
updated_at: 2026-10-04T13:07:46Z
---

**What:** A right answer's gain chip rides into the bar before the next poll arrives, and tapping prep's Scoring steps shows what each answer earns with your build.

**Why:** The auto-advance cut the chip off so the coverage gain never showed, and Scoring only stated base points.

## Done when
- [x] A flying gain chip lands before the card leaves, never before the usual hold
- [x] The advance still moves on if the chip never settles
- [x] Tapping Scoring swaps base points for points with your build, when the build lifts every poll

## Notes
useAnswerFeedback gates leaving on held + settled with a 3s fallback; GainFlight reports onSettled. Scoring uses answerPayoutFor with previewContextFor (no category, after the opener). ADR-170 amended.

## Summary of Changes
See Notes.
