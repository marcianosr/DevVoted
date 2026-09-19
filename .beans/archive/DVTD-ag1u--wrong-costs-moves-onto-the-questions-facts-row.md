---
# DVTD-ag1u
title: wrong costs moves onto the question's facts row
status: completed
type: task
created_at: 2026-09-11T15:28:21Z
updated_at: 2026-09-11T15:28:21Z
---

`wrong costs 0.77` sat in its own row beside the poll trail. It reads as a fact
about the poll, so it belongs on the row that already carries the category badge
and `3 options · single answer`.

## Summary of Changes

- `wrongCost` moved from `PollScreenProps` to `QuestionProps`. The price is a
  fact about the poll, so the poll's own component owns it rather than the
  screen forwarding a single field.
- Rendered at the end of `Question`'s `FACTS_ROW` with `sm:ml-auto`, matching
  the wrap behaviour the Fold fix (DVTD-ojau) established: right-aligned on
  desktop, flowing under the facts on a phone.
- The label now uses `Typography variant="hint"` rather than a raw
  `text-xs text-theme-muted` span. Same rendering, design system instead of
  loose classes.
- `PollScreen`'s `TRAIL_ROW` wrapper went with it: with `wrongCost` gone the div
  wrapped a single `<Trail>`, so `Trail` is now a direct child. The layout order
  spec's third entry changed from `div` to `nav`.
- Three specs on `Question.spec.tsx`, which now owns the reading; the
  `PollScreen` spec keeps its assertion as an integration check.

Verified: 4401 passed, 0 TS errors, depcruise clean.
