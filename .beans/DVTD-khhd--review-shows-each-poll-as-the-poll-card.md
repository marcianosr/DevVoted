---
# DVTD-khhd
title: Review shows each poll as the poll card
status: completed
type: feature
priority: normal
created_at: 2026-10-15T11:47:13Z
updated_at: 2026-10-15T12:01:43Z
---

**What:** The review screen shows every answered poll as the same card the poll screen uses, with its verdict in the card head, the author credit at the foot, and who picked each option under that option.

**Why:** The fold read differently from the poll you just answered, and faces beside the option squeezed long answers, worst on a phone.

## Done when

- [x] Each review poll is an open poll card with number, category, facts, verdict and coverage in its head
- [x] The author credit sits at the foot of the card
- [x] Faces and vote count sit under each option's label on every width
- [x] The fold, its hint and the open-everything button are gone
- [x] Wiki and changelog describe the new review

## Notes

Marciano's calls: verdict in the card head, credit only (no category-leader footer), faces below on every width. Question's option voters move from Choice aside to the note seat; only the review passes voters.

## Summary of Changes

ReviewScreen draws a ReviewCard per poll: a Panel with the poll head (current swatch numbered by deal order, category, question facts, Verdict, coverage), the full Question (stem no longer code-only), tally, explanation and note, and the Author credit as its footer. Fold, hint, open-everything and the open frame option are removed from the screen, viewmodel, ReviewView and fixtures (kantoReviewAllOpen and its story deleted). Question renders option voters on their own line in the note seat, above any explanation. Wiki poll review bullet and CHANGELOG updated.

## Follow-up (2026-10-15)

- Faces were missing for any gate dealt on an earlier day: the review borrowed votes from today's community view (segment_date and answer_date = today). New getReviewPolls server function reads every session answer on each poll from the day the viewer answered it (fetchSessionAnswersOnViewerDay); communityPollOf is shared with the community view.
- Choice gained an under slot: faces and count stack under the label. The note seat is now a full-width section with a divider, and the option explanation lost its box.
- The review's Explanation label reads at subtitle size.
