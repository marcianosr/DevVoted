---
# DVTD-tg3t
title: 'Second playtest pass: new run and prep screens'
status: completed
type: task
priority: high
created_at: 2026-09-13T17:23:23Z
updated_at: 2026-09-13T17:43:33Z
---

Live pass two over /proto-run in the kanto kit. Eleven corrections across the new
run and prep screens.

New run screen
- [x] The slot track draws capacity + 1; show only the slots you have
- [x] Drop "hover a config to find its room on the track"
- [x] Drop "Prep shows what Pallet asks before anything is locked."
- [x] Drop the header note "13 gates, one a day - today's 5 polls are waiting"
- [x] Say the buy-slot price comes from archive storage

Prep screen
- [x] Drop "Categories matter more than usual now: a matching config pays x1.25..."
- [x] The five polls panel reuses the band table's frame, without the headers
- [x] "none this gate" moves onto its own line under Audits
- [x] The footer's back press wears a back arrow, leading the label
- [x] The lead line becomes "Clear at OK or better and earn the rewards shown
      below across a window of 5 polls.", with OK as the band badge and 5 as a
      grey figure badge

Both
- [x] Every screen caps at 900px (was 1150px, set by DVTD-c76y)

## Summary of Changes

**A new `PanelTable` primitive** carries the band table's frame: the `-mx-4 -my-4`
bleed to the panel edge, the rounded clip, the optional heading strip, and the
`TABLE_ROW` / `TABLE_DIVIDER` class pair rows use so dividers run edge to edge.
`BandOutcomes` and `Ledger` both render through it, which is what makes the five
polls panel and the band table read as one table. `LedgerRows` gained `tabled`
because it is also used bare inside a `Fold` on the gate outcome screen, where the
bleed would be wrong.

**`Build` gained `caption` and `offeredSlot`**, joining the existing family of part
toggles (`heading`, `readout`, `list`, `configCount`, `emptySlots`). The new run
screen sets both false: the track now draws exactly the slots you own, and the
"hover a config" line is gone. Everywhere else keeps the unbought hatched box,
which is still the shop's affordance.

**`SlotOffer` gained `from`**, a muted word after the price badge, and the aria
label carries it. Only the new run screen sets it (`from archive storage`), because
in the shop a slot is paid from the run balance. `slotDealsFor` is still shared;
`newRunDealsFor` in the new-run viewmodel decorates its offer and adds the locked
next rung, which moved the last string composition out of `StartView`.

**`Button` gained `iconAt`** (`lead` | `trail`, default trail) and `Icon` a `back`
arrow. A trailing arrow on a back press points the wrong way.

**`BandOutcomes.lead` is now `readonly LeadPart[]`** instead of a string, so the
line can badge things: a `{ band }` part renders the band's own word and colour
from `COVERAGE_BAND_COLOR`, a `{ figure }` part renders a pewter badge. The colour
table stays in the UI; the viewmodel only names the band. This retired
`COSTING_BANDS` / `COSTING_TAIL` and the gate name from `outcomesLeadFor`, which
now takes no arguments.

**900px is the default screen cap**, reversing the 1150px set by DVTD-c76y.
`ScreenWidth` keeps `narrow` (stories only) and `default`; nothing needed a
per-screen override once the default moved.

Verified: tsc exit 0, lint clean (974 modules, 0 depcruise violations), 239 of 241
test files pass. The 4 failures in `gate.model.spec.ts` (the floor rule) and
`PollScreen.spec.tsx` (a missing `nav`/Trail in the column order) are on files
untouched by this pass and were already red before it.

## Third pass (same session)

- [x] The locked `slot N+2` rung is gone; only the next slot is offered
- [x] A second lead line under Objectives and rewards: the base poll score, the
      gate's standard, and the polls held against it, all badged
- [x] New `PollScores` component: one row per gate, a swatch per poll

- [x] A third lead line: "You hold N of M — P% coverage", the held figures green
- [x] `PollScores` wired into the prep screen, under the band table
