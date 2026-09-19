---
# DVTD-eadf
title: 'Kanto WeightTrack: the build''s weight against its upkeep bill'
status: completed
type: task
priority: high
created_at: 2026-09-12T13:17:14Z
updated_at: 2026-09-12T13:38:23Z
parent: DVTD-uhub
---

ADR-074 moved the brake on build width from a one-off slot price to a recurring
KB bill. Every existing build surface still draws bought capacity: `SlotTrack`
shows a fixed slot count with dashed vacancies and a hatched slot for sale, and
`Build` says "5 of 10 slots - 5 free". None of that describes a soft axis with a
bill on it.

This is the missing readout, from Marciano's mock: one horizontal track where
the build's configs sit as blocks at the left, the room ahead is dashed, and
vertical ticks mark where the per-gate bill steps up.

Scope is the kit component plus an opt-in arm on kanto's `Build`. The domain
(the gate-close bill, the insolvency peel, deleting the slot ladder) stays with
the parent bean.

## The ladder

ADR-074's table, extended above weight 16 for the fixture only:

| Weight  | 4 | 6  | 8  | 12 | 16  | (24) | (32) |
| ------- | - | -- | -- | -- | --- | ---- | ---- |
| KB/gate | 0 | 16 | 32 | 64 | 128 | 256  | 512  |

The component never owns these numbers, it draws whatever rungs it is handed.
The table lives in `src/test/kantoPoll.factory.ts` as a fixture, because
`src/ui` may not take runtime values from `src/modules` and no model file owns
upkeep yet. ADR-074 is NOT amended: the extension is a fixture, not a ruling,
and the curve's real shape is DVTD-8gns's sim to answer.

## Decisions taken with the mock

Measured off a 2x retina capture. Track 22px tall, 3px radius, blocks 3px
apart, ticks 1px crossing the track and overhanging ~5px, labels `text-xxs`
centred on their tick.

**No new CSS.** Every measured colour maps to an existing utility: lead block
L 0.752 -> `bg-theme`, config block L 0.461 -> `badge-theme`, dashed remainder
L 0.328 -> `border-theme-faint`, tick L 0.387 -> `bg-theme/50`, label L 0.564 ->
`text-xxs text-theme-muted`.

**One coordinate system, not two.** The mock is a flex row (flexGrow per config,
6px gap) with the ticks laid over it as percentages of the container. Those
disagree: the gaps consume 15 CSS px, so the mock's 7 blocks end where weight 8
sits on the tick axis. A build at exactly 12 weight would draw past its own
12-tick, which makes a threshold lie. Blocks are absolutely positioned on the
same percentage axis as the ticks, gap taken out of each block's own allotment.

**The ticks sit over the blocks.** With ADR-074's ladder the first paid rung is
weight 6, inside the mock's own 7-weight build, so a tick has to read against
`badge-theme` as well as the page ground.

**The bill steps, it does not interpolate.** ADR-074 leaves this open; the
component needs a number for a weight of 7. You pay the highest rung you have
passed, in one exported helper the domain can adopt or overrule later.

## Todo

- [x] `WeightTrack.ui.tsx` - blocks, dashed remainder, ticks, labels, caption
- [x] `upkeepAt` steps to the highest rung passed
- [x] Label collision rule: keep every tick, drop a crowded label; never label the free rung
- [x] `WeightTrack.spec.tsx` (27 tests)
- [x] `WeightTrack.stories.tsx` incl. AcrossThemes and UnderTheBuildItDraws
- [x] `Build.ui.tsx`: third arm on BuildCount, weight summary line
- [x] `kantoPoll.factory.ts`: rungs, axis max, weight fixtures, free-weight plan ladder
- [x] `Build.spec.tsx` / `Build.stories.tsx` weight-arm coverage
- [x] Storage section re-aimed at free weight (StoragePlan, ShopScreen)
- [x] Kanto shop moved off capacity: no empty slots, no buy/cash slot
- [x] lint, build, full test suite

## Summary of Changes

### New

`src/ui/kanto-theme/WeightTrack.ui.tsx` (+ spec, + stories). The build laid on a
weight axis with the upkeep rungs ticked across it. Blocks are absolutely
positioned by cumulative weight with `width: calc(X% - 3px)`, so the block layer
and the tick layer share one coordinate system and a tick stays a real
threshold. The mock drew a flex row with gaps under a percentage tick overlay,
which drifts by a whole slot at the far end.

Exported `upkeepAt(rungs, weight)`: the bill steps to the highest rung passed,
never interpolates. ADR-074 leaves that open; this is the component's
assumption, in one place the domain can adopt or overrule.

No new CSS. `badge-theme` block, `bg-theme` when highlighted,
`border-theme-faint` dashed remainder, `bg-theme/50` tick, `text-xxs
text-theme-muted` labels (CoverageBar's mark strip). `h-5.5` is 22px, the mock's
exact measurement, and every one verified emitted in the built CSS.

### Changed

`Build.ui.tsx` gained a third arm on the private `BuildCount` union rather than
a `track: "weight"` value, so a weight track without its ladder is a compile
error. The `slots` arm is untouched and `SlotTrack` keeps its other caller
(`NewRunScreen`). Summary reads `12 configs - 7 weight`; the bill lives in the
track's caption so it is not said twice.

`StoragePlan.ui.tsx` now sells free weight. `StorageRung.cap` becomes `weight`,
`bill` becomes `price`. The spine of dots is gone, replaced by `border-t
border-theme-faint first:border-t-0` rows, the kit's existing divider idiom. A
locked rung shows its free weight and its opening condition; only the price is
withheld.

`ShopScreen.ui.tsx`: the section is "What it costs to run", headline outside the
panel reading `N weight covered - N billable`, prose promoted from `hint` to
`paragraph` and re-aimed at upgrading build capacity so the per-gate bill is
named in the same breath.

The kanto shop's `Build` moved to the weight arm, which removed the empty slot
boxes, "cash this slot back" and "buy slot 11" in one step.

### Deviations from the mocks, deliberate

- Section heading stays `title` (16px), not the mock's ~20px, so it matches the
  `Build` heading directly above it in the same column.
- Row notes are all `hint`; the mock brightens the held row's note. The saffron
  badge and `current` already carry that fact twice.
- `Figures` still badges a note's KB/MB figures (ADR-066); the mock draws them
  plain.
- A rung below the one held offers no downgrade. "Bought once, lasts the run"
  makes a downgrade incoherent: you cannot un-buy free weight.

### Open, not done here

- The plan's free weight does not shift the upkeep ladder. Raising free weight
  to 8 should move every paid rung by +4. Domain work, and guesswork ahead of
  the sim.
- The upkeep rungs above weight 16 (24 to 256, 32 to 512) are a fixture, not a
  ruling. ADR-074 is untouched.
- `Registry` still says "32 KB a slot" where the rest of the screen says weight.
- `PlanChange` still confirms a cap change in cap language.
- `docs/wiki.md` drift stays with DVTD-d16l.

### Verification

`npm test` 250 files / 4529 passed. `npm run lint` clean (one pre-existing
warning in `Screen.stories.tsx`), depcruise 1004 modules no violations.
`npm run build` passes. Story typecheck via a temporary tsconfig: 30 errors, all
pre-existing, none in kanto-theme.
