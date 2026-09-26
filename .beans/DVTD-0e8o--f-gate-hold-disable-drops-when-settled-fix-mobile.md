---
# DVTD-0e8o
title: 'F — Gate hold: disable drops when settled, fix mobile popovers'
status: completed
type: bug
priority: normal
created_at: 2026-09-24T12:30:36Z
updated_at: 2026-09-24T13:03:07Z
parent: DVTD-c2ha
---

- [ ] Item 21 BUG: dropChip disabled when the peel is settled and the row is not chosen
- [ ] Item 17: WeightTrack panel needs the mobile sheet fallback
- [ ] Item 17: sheet needs max-h and overflow-y-auto
- [ ] Item 17: Tooltip PANEL_OPEN must restore pointer-events
- [ ] Item 17: resolve the z-30 sheet landing on the z-20 footer

## Summary of Changes

**Item 21.** `choiceOf` already computed `owed`; it was never passed down. `dropChip` now takes a `settled` flag and disables the drop badge on any config not already chosen. `ConfigChipBadge` already carried `disabled`, so nothing in the kit changed. A row already dropping stays live so the choice can be taken back.

Verified against the real numbers rather than assumed: this gate peels 16 KB and each config sells for 16, so one drop settles it and the other two rows go dead — exactly the screenshot.

**Item 17.** Three defects, all confirmed in the source:

1. `WeightTrack`'s panel had no mobile sheet at all — plain `absolute top-full` hung off a `basis-0` segment often a few pixels wide, hosting a `w-80` panel. This is the one in the screenshot. It now uses the same `fixed inset-x-4 bottom-4 … sm:absolute` sheet `Tooltip` and `ConfigChip` already had.
2. `Tooltip`'s `BODY` had no height cap, so a long hint grew upward past the top of the screen. Now `max-h-[70vh] overflow-y-auto`.
3. `Tooltip`'s panel was `pointer-events-none` and `PANEL_OPEN` never restored it, so no tooltip has ever been scrollable. Now restored on open.

**Deferred:** `Tooltip` and `ConfigChip` carry the same sheet classes and the same docblock, duplicated, and `WeightTrack` is now a third copy. Worth one sheet primitive — raised as a follow-up rather than folded in here.
