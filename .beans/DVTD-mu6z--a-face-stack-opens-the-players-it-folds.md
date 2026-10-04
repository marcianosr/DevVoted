---
# DVTD-mu6z
title: A face stack opens the players it folds
status: completed
type: feature
priority: normal
created_at: 2026-10-03T17:40:19Z
updated_at: 2026-10-03T17:48:05Z
---

**What:** Pressing the +N after a stack of faces opens the rest of those players, and a poll row's verdict badge sits snug against its question.

**Why:** A count you cannot open hides who is in a record or picked an option, and the wide verdict column wasted a poll row's room.

## Done when
- [x] Pressing +N on any face stack shows the folded faces, each linking to its player
- [x] Players with no face to draw are still counted in the opened list
- [x] A poll row's verdict badge takes only its own width

## Notes
Native popover with the existing popover-anchored CSS; the face cap moved from the community viewmodel to ClimberStack's shown prop.

## Summary of Changes
ClimberStack takes a shown cap. Faces past it sit behind a +N button that opens a native popover (popoverTarget, popover-anchored CSS, anchor via useId) holding the folded faces as profile links, plus 'and N more' for players with no face to draw. The community viewmodel now hands every face over (TURNOUT_FACES removed). Records rows show 3 faces, poll voters 2. Verdict gained width fit|column, and PollResult uses fit. The fixture's most-installed row now folds faces so the story shows the popover.
