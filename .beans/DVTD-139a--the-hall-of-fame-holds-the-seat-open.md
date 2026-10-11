---
# DVTD-139a
title: The Hall of Fame holds the seat open
status: completed
type: feature
priority: normal
created_at: 2026-10-08T12:13:30Z
updated_at: 2026-10-08T12:16:07Z
---

**What:** Before anyone has won a run, the Hall of Fame draws an empty seat: a dashed trophy beside "Champion · still open" with "First to clear the Champion gate gets this spot." under it.

**Why:** The one-sentence reading looked like a note, not a place; a seat drawn empty says there is a spot to take and names how to take it.

## Done when

- [x] The empty Hall of Fame draws a dashed trophy beside a title and a caption on their own lines
- [x] The title reads "Champion · still open" and the caption names the first clear of the Champion gate
- [x] A reigning champion still replaces the seat with the player card and badge
- [x] Wiki and changelog state the new reading

## Notes

Mock: a screenshot of the empty state only; the reigning-champion state is unchanged.

## Summary of Changes

`HallOfFame.ui.tsx` draws an `OpenSeat` (dashed square, new `trophy` icon, subtitle over hint); `empty` is now `{ title, caption }` owned by `hallOfFame.viewmodel.ts` COPY. Factory, spec, wiki §7 and CHANGELOG updated.

- Same session: the community board's **Back to your run** press drops its `gate` flag icon.
