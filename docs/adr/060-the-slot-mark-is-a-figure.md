# ADR-060: The slot mark is a figure, and version is a dot track

## Status

Accepted (2026-09-05, Marciano, DVTD-3ib9).
Supersedes [ADR-055](055-config-hue-is-keyed-to-slot-size.md) Decision 2's channel split
and retires the version-mark split inside `DexChip`.

## Context

The segmented slot mark drew one bar per slot, so its footprint grew linearly with size:
an 8-slot config spent about a quarter of a `w-44` chip on bars, and the 12 and 16 rungs
`ConfigSize` allows would have clipped the label outright. DVTD-eul8 tried to patch that by
capping the mark's width and letting the bars divide it; capping at 4 slots gives 8 bars
about 2px each, which reads as mush rather than as a count.

## Decision 1: a config's size is a figure in a block, not a mark per slot

`Weight.ui.tsx` draws one fixed-width block holding the slot count as a numeral. A 16-slot
config now costs exactly as much width as a 1-slot one, so the label has the same room on
every row and the cap-and-compress question does not arise.

A count above about five is read faster as a numeral than as a row of marks, and slots run
to 16. The bars were never counted at the top of the ramp anyway — they were read as
"wide", which is a comparison the block still supports through the figure.

## Decision 2: hue moves onto the block's edge, and nowhere else

ADR-055 put size hue on the bars. With the bars gone it moves onto a 3px edge on the
weight block itself, keeping the `sizes.ts` ramp and its descending threshold walk
unchanged: celadon/saffron/vermillion/lavender/fuchsia/cinnabar still mean 1/2/4/8/12/16,
and minified configs that fall off the ladder still land on the rung below. The edge is a
child span rather than `border-l-*`, because a CSS border cannot hold a gradient and the
prismatic rungs need one — from 8 slots up the edge takes `legendary-bar`.

Putting the hue on the chip border was built first and rejected on sight (Marciano,
2026-09-05): a full vermillion outline around a row reads as an alert, and the block's
edge already says the same thing at a tenth of the ink. The chip border stays neutral —
zinc, dashed when unseen, lighter when selected — and the `legendary-ring` ladder at 8+ is
untouched, so the only coloured border on a chip still means "this is one of the big ones".

Keeping the hue on the block rather than the chip also makes the block portable: it appears
in `Row` tag slots (BuildList, the prep rail, the gate-hold and game-over lists) where
there is no border to carry anything.

`Slots solid` is untouched. The Dex catalogue reads size by bar width there, which is a
different question — how big is this config compared with that one — and the block answers
the per-row one.

## Decision 3: a chip always draws the ceiling, as dots

`DexChip` used to pick its version mark from whether the caller passed a ceiling: the Dex
knew `maxVersion` and showed `v3/5`, and a run screen showed the milled rung `v2` on the
reasoning that a mid-run chip has no ceiling worth comparing against.

That reasoning does not survive the dot track. `VersionDots.ui.tsx` draws one pip per
version, filled up to the version held, and the ceiling is what makes the track legible at
all — three filled pips say nothing without the two empty ones beside them. `maxLevelOf` is
knowable everywhere, so `maxVersion` is now required on the chip's seen arm and the split
is gone. Every adapter fills it next to the `version: config.level ?? 1` it already sets.

Every pip is a circle, the ceiling included. Capping the track with a square was built
first and rejected the same day: it reads as a different kind of thing rather than as the
end of one series, and "maxed" is already legible from every pip being filled.

`Version` and `VersionFigure` keep every call site outside the chip. The milled rung still
carries version in the build rails, where it sits beside the weight block rather than
replacing it.

## Decision 4: every `Row`-shaped config list draws the chip

Four lists drew a bare name with a version tag and a size mark beside it — the shop's build
and offers, prep's build, the game-over final build, and the gate-hold peel list. All four
now draw the same `DexChip` the run deal does, so a config looks the same everywhere it can
be bought, installed, peeled or read about.

The row types follow: `version` changes from a pre-formatted `"v2"` string to the number
the chip needs, plus `maxVersion`, and stops being optional — `PrepBuildRow` and `RemoveRow`
both allowed a versionless row, which drew a config with no version at all. The shop's tag
column keeps only the `v1 → v2` bump an armed upgrade is about to make; the other three
lists have no tag left.

`Row`'s name column widens from `w-48` to `w-56` to hold a chip rather than a bare name.

`BuildList` is deliberately excluded. Its rows are the poll screen's status panel: a leading
status `Dot`, `tone`/`size` variants for a skipped row, and inline use/swap presses on the
same line. A bordered chip is a heavier thing than that line can carry, and `ConfigName`'s
tone override has nowhere to go on a chip. It keeps `Version` + `Weight`.

## Consequences

- The domain still calls this `level` and the kit still calls it `version`; this ADR does
  not reconcile that, and the authed-game `ConfigChip` still renders `L{n}`.
- Version is no longer text anywhere on a chip, so tests that read it must go through the
  track's accessible name (`version 2 of 5`) rather than looking for `v2`.
- `Slots`' segmented branch has no production caller left. DVTD-eul8's `capSlots` mode
  stays in the file for now by Marciano's call, but it is dead configuration and should be
  scrapped once the block has been seen on screen.
