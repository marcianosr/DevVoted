---
# DVTD-nlqd
title: The community board drops the climb panel
status: completed
type: task
priority: normal
created_at: 2026-09-26T15:21:54Z
updated_at: 2026-09-26T15:29:08Z
---

**What:** The community board no longer draws the "Your climb" panel; the day's note moves to the screen subtitle.

**Why:** The panel restated what the header stats and the map already say, and its only unique content was a note about the day.

## Done when

- [x] The community board draws no climb panel
- [x] The loading, error and nothing-to-compare notes read under the screen title
- [x] Nothing in the codebase still names a climb panel

## Notes

The panel was the only surface rendering the `note` prop. Marciano chose the header subtitle as its new home over the polls summary or dropping it.

## Summary of Changes

The climb panel and its type left the community screen. The day note it used to carry now reads as the subtitle under the board title, ahead of the spent-run hint and the date. The screen no longer accepts a climb prop, so the test factory, the prototype route and the panel test lost theirs too. One test that asserted the standing appeared twice now asserts it appears once, which is what the header alone says. The changelog gained a Removed entry and the wiki section 7.1 no longer lists the panel.
