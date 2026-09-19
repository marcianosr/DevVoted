---
# DVTD-bq9k
title: Rebuild the kanto new run screen on weight and objectives
status: completed
type: task
priority: high
created_at: 2026-09-12T15:43:28Z
updated_at: 2026-09-12T16:31:20Z
parent: DVTD-uhub
---

`NewRunScreen` is the last kanto screen on ADR-049: the archive buys numbered
slots, `Build` reads "0 of 4 slots - 4 free", and `SlotOffer` sells slot 5 for
64 KB. ADR-074 retired all of that. Both DVTD-eadf and DVTD-ibig shipped the
replacement parts and flagged this screen as the holdout.

The screen also never states what you are climbing towards. `PrepScreen`, one
step later in the loop, gets the whole `BandOutcomes` table; the new run screen
gets eight words in the footer.

From Marciano's mock, with three deviations decided up front: the build and the
installations stay side by side, "A bare build never clears." goes, and the
outcome table moves to the bottom under **Objectives and rewards**.

## Decisions

**The readout sits left, the installations sit right.** `Build` gains a third
layout, `beside`: the track and everything for sale in the left cell, only what
is installed in the right. The heading and the skipped fold stay full width.
The two-column grid moves out of `NewRunScreen` and into `Build`, which also
fixes the old asymmetry where the left column was wrapped and `Hand` was not.

**The bar travels with the table.** `BandOutcomes` gains an optional
`bar`, rendered between the heading and the panel. It already imports the band
words and colours from `CoverageBar`, so the two readouts cannot drift.
`PrepScreen` is untouched and keeps passing its bar through `header.bar`.

**Marks stay on `boundaries`.** The mock's mark row would need a third
`CoverageMarks` mode. `boundaries` names the lines that decide the run and
PERFECT is stated in the table directly below.

**Gate 0 has no floor to fall through.** `floorAt(0)` and `okAt(0)` are both 0,
so `outcomesFor` currently emits a SHAKY row reading `0 - -1%` and a DANGER row
reading `under 0%`. Bands with an empty range are dropped, which is what the
`NoFloorToFallThrough` story already pins by hand: gate 0 is three rows.

**The archive word travels with the number.** Two purses share one header
corner, so `kantoWeightOffers` gains an optional purse suffix and this screen's
offers read `256 KB archive`.

## Todo

- [x] `rightsToClear` in `coverageRatio.model.ts` (+ spec) - the model has
      `rightsToFill` and `rightsToSurvive` but not the HEALTHY line ADR-071 made
      the only band that advances
- [x] `Build.ui.tsx`: `BuildLayout` gains `beside` (+ spec, story)
- [x] `BandOutcomes.ui.tsx`: optional `bar` (+ spec, story)
- [x] `NewRunScreen.ui.tsx`: recompose, `outcomes` prop
- [x] Factory: new run onto the weight arm, drop `newRunSlotDealsAt` /
      `NEW_RUN_RESTING`, rewrite `NEW_RUN_BUILD_NOTE`, add the objectives block
- [x] Factory: `outcomesFor` drops empty bands
- [x] Footer drops `refusal`
- [x] `NewRunScreen.spec.tsx` / `.stories.tsx`
- [x] lint, build, full test suite

## Summary of Changes

`rightsToClear` added to `coverageRatio.model.ts` beside `rightsToSurvive` and
`rightsToFill`, with three tests. It is the line ADR-071 made the only one that
advances, and the bar's caption needs it; a fixture computing it locally would
have been a second definition of `clearsBar`.

`Build` gained `layout="beside"`. The render body now names its three pieces
once (`reading`, `installed`, `offered`) and composes them per layout, so
`wrap` and `column` are byte-identical in output - proved by the 47 existing
Build/Shop/NewRun specs passing untouched across the refactor. Seven new specs
pin the split.

`BandOutcomes` gained an optional `bar`, drawn between the heading and the
panel. `PrepScreen` untouched.

`NewRunScreen` is Header -> Build (beside) -> build note -> Hand (full width)
-> BandOutcomes -> footer. The `COLUMNS`/`COLUMN` constants are gone; the grid
lives in `Build` now, which also fixed the old asymmetry where the left column
was wrapped and `Hand` was not.

Factory: `newRunSlotDealsAt`, `archivePriceKb`, `archiveLabel`,
`NEW_RUN_RESTING`, `NEW_RUN_BUILD_NOTE` and the `START_SLOT_PREMIUM` import all
deleted. `kantoNewRunAt`'s second parameter is the held plan tier, not slots
bought. `kantoWeightOffers`/`kantoShopWeight` take an optional purse suffix so
this screen's offers read `256 KB archive`.

`outcomesFor` drops a band whose range is empty, which is what gate 0 needs:
`floorAt(0)` and `okAt(0)` are both 0, so it used to emit SHAKY as `0 - -1%`
and DANGER as `under 0%`. Gate 0 is now three rows - the same shape the
`NoFloorToFallThrough` story had been pinning by hand. Prep (gate 4) keeps all
five.

`ScreenFooter.spec.tsx` stopped borrowing the new run screen's refusal string
and now supplies its own, keeping the kit's `refusal` arm covered after the
screen dropped it. One test added: nothing is said under a refused start that
was given no reason.

**Deliberate departure from the mock:** the bar keeps `marks="boundaries"`. The
mock's mark row (`HEALTHY 36%` plus a right-anchored `PERFECT 100%`) would need
a third `CoverageMarks` mode; boundaries names every line that decides the run
and PERFECT is stated in the table directly below. The mock's `36%` is also off
the old ladder - gate 0's healthy line is 5% now.

**ADR-075 landed mid-task** and removed work this bean had planned: `outcomesFor`
was already five rows with a real `PERFECT_BONUS`, so no `withPerfect` flag was
needed and the "PERFECT pays what HEALTHY's top pays" reasoning no longer holds.

## Verification

- `npm run lint` - clean (one pre-existing warning in `Screen.stories.tsx`,
  untouched), depcruise 1004 modules / 4244 dependencies, no violations
- `npm run build` - passes
- `npm test` - 250 files, 4560 passed, 6 skipped, 2 todo
- story typecheck - 0 errors

## Left alone, flagged

- **The footer still states the gate twice.** `gate 0 asks - 36% coverage -
  +32 KB on a clear` now duplicates what the outcomes table says. The mock drops
  the stake row entirely. Left in because only one omission was asked for.
- **The hand still disables a card that does not fit.** `kantoHandCards` marks a
  card `skipped` and `disabled` when it exceeds free weight, which was right
  under ADR-046's hard capacity and is wrong under ADR-074's soft one: you can
  install it, you just pay the bill. Capacity is passed as `freeWeightAt(tier)`
  so behaviour is unchanged from `BASE_SLOTS`, but the semantics are now a lie.
- **Prep keeps `marks="bands"`** while the new run screen uses `boundaries`. Not
  a conflict, but the two screens read their shared ladder differently.

## Follow-up: the hand moved into the build's column

Marciano's call after seeing it rendered: Dealt was full width under the split,
which read as a third section rather than part of the same decision. It now
runs down the **left column, above the free-weight offers**.

`Build` gained a `children` slot, drawn between the readout and the room for
sale in the `beside` layout (after the chip list in `wrap`/`column`).
`NewRunScreen` nests `<Hand>` in it.

**Why a slot rather than moving the offers out of Build.** The offers are the
build's own - `BuildWeight.offers` exists for exactly this - and rendering
`WeightOffer` rows in the screen would be a second place that knows how to draw
them. `Panel`, `Fold` and `Modal` already take `children` in this kit, so the
composition slot is not a new idea here.

**The order is the argument:** the track says what you carry, the hand is what
you can add for free, and only under that comes the room you would have to buy.

Four specs added (two on `Build` for the seating and the untouched
installations cell, two on the screen for the column and the hand-above-offers
order) plus a `BesideWithAHandSeated` story.

Re-verified: lint clean (1004 modules, 4246 dependencies), build passes,
`npm test` 250 files / **4564 passed** / 6 skipped / 2 todo, story typecheck 0.

## Follow-up 2: the grid went back to the screen

Three calls from Marciano on the rendered screen:

1. The build readout moves **below** Dealt (hand first, then what holding it
   weighs, then the room you could buy).
2. **Objectives is no longer full width** - it moves into the right column,
   under the installed list.
3. The footer's `gate 0 asks` stake row is **gone**. It was stating the demand
   and the payout that the outcomes table now states properly; flagged as
   duplicated when the table landed, now removed.

**`Build`'s `beside` layout and its `children` slot are deleted.** Once the
cells had to hold the hand and the outcomes table, "Build's band split in two"
stopped describing the layout, and the grid belongs to the screen. In its place
`Build` gained two booleans symmetric with the existing `heading`:

- `readout` - the track, its caption, and the room for sale
- `list` - the installed chips, the empty label, and the skipped fold

`NewRunScreen` spreads the same `build` props into two `Build` renders, one per
column: `list={false}` on the left draws the readout, `heading={false}
readout={false}` on the right draws the installations. Nothing is cherry-picked
at the call site, and the summary still counts the configs the left render is
not drawing, because the count is the build's, not the list's.

Left column is Dealt → Build heading + track → offers → the weight note. Right
column is the installed list → Objectives and rewards.

`ScreenFooter.spec.tsx` stopped borrowing `kantoGateZeroFooter` for the stake
tests (the same borrowing that broke on the refusal) and builds its own
`ONE_STAKE`. The kit's `stakes` arm stays fully covered; one test added that a
screen stating its own stakes gets no stake row.

Re-verified: lint clean (1004 modules, 4245 dependencies), build passes,
`npm test` 250 files / **4567 passed** / 6 skipped / 2 todo, story typecheck 0.

**Lesson worth keeping:** two kit specs broke by using a *screen's* fixture as
their base. A kit spec should own its fixture; `kantoGateZeroFooter` describes
one screen's footer and changes when that screen does.

## Follow-up 3: the outcome rows stack in a narrow column

`BandOutcomes` was laid out for prep's full-width table: a `w-28` band column, a
`w-24` range column, then the prose. At half width those fixed columns eat most
of the row and the sentence wraps into a ribbon four lines deep. Worse, `BAND`
and `PAYS` carry `self-center` against the row's `items-baseline`, so in a
four-line row the badge floats to the middle while the range sits at the top -
which is what read as broken padding.

`layout: "row" | "stacked"` added, following `Audit`'s `layout: "fit" | "row"`.
Stacked puts band, range and payout on one head line (payout pushed right by
`ml-auto`) and gives the sentence the full width beneath it. `row` is the
default, so prep is untouched.

**Viewport breakpoints could not fix this.** The table is narrow exactly when
the viewport is at `md` or wider, because that is when the screen goes to two
columns - so `md:` would have made it worse. The container's width is the
screen's decision, which is why it is a prop.

Six specs on the stacked arm (including one pinning that `row` still lines up)
plus one on the screen, and a `StackedInAColumn` story that renders it inside a
half-width grid cell.

Re-verified: lint clean (1004 modules, 4245 dependencies), build passes,
`npm test` 250 files / **4574 passed** / 6 skipped / 2 todo, story typecheck 0.
