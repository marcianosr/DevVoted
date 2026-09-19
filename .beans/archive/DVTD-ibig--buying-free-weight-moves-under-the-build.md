---
# DVTD-ibig
title: Buying free weight moves under the build
status: completed
type: task
priority: high
created_at: 2026-09-12T13:49:51Z
updated_at: 2026-09-12T13:57:15Z
parent: DVTD-uhub
---

DVTD-eadf put the free-weight ladder in a "What it costs to run" panel and moved
the shop's Build to the weight arm, which removed the inline slot rows. On
screen that split one decision across two places: the panel sold free weight in
a table away from the build it applies to, and the build itself had no
affordance.

Marciano wants the inline row back, re-aimed at weight: you buy extra weight
under the build, it shows the upgrade you can make (4 -> 8) and the rung above
it you have not unlocked (12, once a run has held 768 KB). The panel then goes.
This reverses part of DVTD-eadf one day after shipping it, which is the expected
cadence here.

## Decisions

**The rungs shift, they do not rescale.** Every upkeep rung moves by `free - 4`,
preserving ADR-074's spacing and inventing no numbers. At free 8 the ticks
become 8/10/12/16/20 for 0/16/32/64/128 KB. `upkeepAt` needs no change: a
7-weight build under free 8 passes no rung, so it reads `free`, which is what
"0 billable" says. This resolves a contradiction DVTD-eadf left open, where a
build reading "0 billable" sat under a tick charging it 16 KB.

**Free weight is derived, never passed twice.** `freeWeightOf(rungs)` is the
highest rung billing nothing. A prop carrying the same fact could disagree with
the ticks; a derivation cannot.

**Two rows, not four.** Headroom is already the weight track's dashed remainder
directly above, and free weight bought once cannot be cashed back.

## Todo

- [x] `WeightOffer.ui.tsx` - Offered | Locked union over SlotOffer's hatched chrome
- [x] `WeightOffer.spec.tsx` (22 tests) / `.stories.tsx`
- [x] `freeWeightOf(rungs)` exported from `WeightTrack.ui.tsx`
- [x] `Build.ui.tsx`: `BuildWeight.offers`, summary gains covered/billable
- [x] Delete `StoragePlan.ui.tsx` + spec + stories
- [x] `ShopScreen.ui.tsx`: drop the `plan` prop and the whole section
- [x] `PlanChange.ui.tsx`: cap -> weight, rent -> carry, drop `direction`
- [x] Factory: `kantoUpkeepRungs(free)`, `kantoWeightOffers`, `kantoShopWeight`; dropped `kantoStorageRungs`/`kantoShopPlan`/`weightSummaryOf`
- [x] Factory: every shop fixture moved off the slots arm
- [x] Checked the `StoragePlan` citations in ADR-059 and ADR-066 - left alone, see below
- [x] lint, build, full test suite, story typecheck (30 is the clean baseline)

## Out of scope, flagged

- `newRunSlotDealsAt` still sells start slots out of the archive on NewRunScreen
  (ADR-049's subject, retired by ADR-074)
- `Registry`'s `slotPrice` still reads "32 KB a slot"

## Summary of Changes

### New

`src/ui/kanto-theme/WeightOffer.ui.tsx` (+ 22 specs, + 8 stories). Two arms on
one discriminated union so a locked rung cannot carry a price:

- **Offered** - `+ carry 8 free weight  4 -> 8  [256 KB]  160 KB short`, a
  whole-row press.
- **Locked** - `12 free - opens once a run has held 768 KB`, inert, and NOT
  `aria-hidden`, because it carries the only statement of what opens the rung.

Both reuse `SlotOffer`'s chrome verbatim (`bg-hatched-theme`,
`border-theme-soft`, `rounded-lg`, the `+` glyph, the viridian/cinnabar price
badge, the refusal in the price's own red). Hatched rather than dashed on both
arms, per app.css's law: room that exists and is not yours.

### Changed

`freeWeightOf(rungs)` joins `upkeepAt` in `WeightTrack.ui.tsx` - the highest rung
billing nothing. `Build` derives covered/billable from it rather than taking a
prop, so the summary cannot disagree with the ticks above it. Summary now reads
`12 configs - 7 weight - 7 covered - 0 billable`.

`BuildWeight` gained `offers`, rendered after the chips where `Vacancy` used to
sit. The `slots` arm, `Vacancy`, `SlotBox`, `SlotOffer` and `SlotTrack` are all
untouched; `NewRunScreen` still draws capacity.

**The upkeep ladder now shifts with the free weight**: `kantoUpkeepRungs(free)`
slides every rung by `free - 4`, preserving ADR-074's spacing. `upkeepAt` needed
no change - at free 8 a 7-weight build passes no rung and reads `free`, which is
what `0 billable` says. This closes the contradiction DVTD-eadf left open.

`PlanChange` re-aimed: `cap` -> `weight`, `rent` -> `carry`, `direction` dropped
entirely because there is no downgrade from a one-off purchase. Its ledger is
now free weight / costs / you hold.

### Deleted

`StoragePlan.ui.tsx`, its 18 specs and its 6 stories. `ShopScreen` lost the
`plan` prop, the whole section, and the `Panel`/`Typography` imports with it.

### Deviation from the plan

The plan said to re-point the `StoragePlan` citations in ADR-059 and ADR-066.
**Neither was changed.** ADR-059's is about the *terminal* theme, whose
`StoragePlan.ui.tsx` is a different component and still exists, so that citation
was never stale. ADR-066's two mentions describe what the kanto component looked
like when the decision was taken; the decision itself still holds, and rewriting
the evidence would be annotating history, which this project explicitly avoids
in ADRs. Flagged rather than edited.

### Open, not done here

- `newRunSlotDealsAt` still sells start slots out of the archive on
  `NewRunScreen`. That is ADR-049's subject and ADR-074 retires it entirely.
- `Registry` still reads "32 KB a slot" where the rest of the shop says weight.
- The `free - 4` slide is a fixture, not a ruling. ADR-074 is untouched and the
  curve's real shape is still DVTD-8gns's sim to answer.

### Verification

`npm test` 250 files / 4535 passed. `npm run lint` clean (one pre-existing
warning in `Screen.stories.tsx`), depcruise 1004 modules no violations.
`npm run build` passes. Story typecheck: 30 errors, all pre-existing, **0 in
kanto-theme**.
