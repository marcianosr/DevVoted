---
# DVTD-6s3o
title: Suggesting a poll walks four numbered steps
status: completed
type: feature
priority: normal
created_at: 2026-10-07T07:07:39Z
updated_at: 2026-10-07T08:41:13Z
---

**What:** The suggest-a-poll screen wears pallet and reads as four numbered steps (question, answers, category, explanation) that light up when done, with the archive reward stated up top.

**Why:** The form read as an admin tool; a player suggesting a poll should see what is left to do and what it pays.

## Done when
- [x] The suggest screen wears pallet; editing a poll stays cerulean
- [x] Each section carries its step number, lit once that step is done
- [x] A letter is the press that marks an answer right
- [x] Category is picked from chips and starts unpicked
- [x] The submit stays disabled and names what is missing until the poll is ready
- [x] Preview sits beside the submit

## Notes
Skipped from the mock: the characters-left counter, the tap-a-letter hint (the answer-type toggle stays, a third type is coming) and the no-right-answer line.

## Summary of Changes

- Panel.Header takes an optional step (number + done); done lights viridian.
- Segmented accepts no value, so category can start unpicked.
- pollForm viewmodel: category optional, imperative refusals that double as the press label, stepsDoneOf, inline-code and js-block snippets, submissionOf replaces toPollFormData so a missing category narrows without a cast; answers count removed.
- PollForm: pallet for suggest, cerulean for edit; reward badge; letter keycap marks right; category chips; Explain it panel; Preview aside beside the submit.

Follow-up: Preview is a footer press that swaps the form for a full-page, playable poll card (pick reveals right/wrong, then explanation and sandbox). Answer inputs are large; category is a dropdown with a placeholder.
