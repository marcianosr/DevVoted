---
# DVTD-58ib
title: 'B — Poll screen: coverage header, Score, byline, sticky bar'
status: completed
type: task
priority: normal
created_at: 2026-09-24T12:30:35Z
updated_at: 2026-09-24T13:03:07Z
parent: DVTD-c2ha
---

- [ ] Item 5: drop w-full from META_LINE so badges and the rule sit on one row
- [ ] Item 6: Score to variant=title, own flex-col gap-2 wrapper (do not fight gap-4)
- [ ] Item 7: verify Total units right-alignment in the story
- [ ] Item 8: byline credit as a flex row with one gap, no template spaces
- [ ] Item 9: sticky coverage bar on mobile, mirroring BuildFooter's -mx-4 bleed
- [ ] Update PollScreen.spec, PollScores.spec, Author.spec

## Summary of Changes

**Item 5.** `META_LINE` carried `w-full`, which is what forced the rule onto its own line under the two badges. Dropped, with `sm:ml-2` for the air the user asked for. It still wraps on a phone; it no longer claims a line at every width.

**Item 6.** `Score` went from `variant="hint"` to `variant="title"` as an `h3`. The gap came from `Panel.Body`'s `gap-4`, which cannot be overridden from outside — two `gap` utilities are resolved by Tailwind's emit order, not class order — so the label and the track went into their own `gap-2` column.

**Item 7.** `SCORE` already had `ml-auto`, but that only aligns within whatever line the wrap leaves it on. It now takes the line outright below `sm`, so the total sits under the track's right edge deterministically.

**Item 8.** The unevenness was measurable, not a matter of taste: an equipped border is drawn at `scale-120`, overflowing the avatar's box by 3.6px each side, so a `gap-3` left 8.4px before the credit against the panel's 12.4px gutter. `gap-4` makes both 12.4px with a border and both 16px without one. A first attempt replaced the literal spaces with a flex gap and was reverted — CSS gaps are not text, and it silently broke `textContent` for screen readers and selection.

**Item 9.** The approved plan said to pin the bar alone inside `Panel.Body`. That does not work: a sticky element travels only as far as its own parent's box, so the bar would have unpinned the moment the panel scrolled off. The whole Coverage panel pins instead, which also keeps the bar's header beside it — a bar without its readings is a coloured strip. `z-10`, under `BuildFooter`'s `z-20`; they never meet, one pinning top and the other bottom.
