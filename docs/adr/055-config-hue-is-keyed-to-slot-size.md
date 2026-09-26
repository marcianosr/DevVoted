# ADR-055: Config hue is keyed to slot size

## Status

Accepted (2026-09-04, Marciano, DVTD-nfnx).
Amends [ADR-047](047-a-configs-size-is-a-number.md) Decision 1 (a size now carries a
fill) and retires the family taxonomy [ADR-006](006-session-run-mechanics.md) §5 still
described. Answers and closes DVTD-eyud. The ramp lives in `src/ui/sizes.ts`, a global
primitive both themes and the modules layer read.

## Context

`ConfigFamily` named five groups (focus, defense, risk, amplify, economy) and owned five
hues, but no check, reward, shop roll or gate ever read it: ADR-016 demoted the taxonomy
to "presentation-era grouping only" and ADR-035 retired the duality outright, leaving a
label and five Tailwind classes. Meanwhile size, the one property that does work, was
stated only in words and bar length.

## Decision 1: families are deleted, not reassigned

`ConfigFamily` and `Config.family` are gone from the domain, the roster's 33 entries, the
five Tier-2 adapters and every row type in the terminal theme. `FamilyDot` and the Dex's
family legend go with them. This is a deletion, not a rename: no replacement grouping
axis is introduced, and a config's payout is described by its own effect text.

## Decision 2: hue means slot size, on six rungs

A config's fill is a function of the slots it occupies. The theme now runs one meaning
per channel: hue is size, the zinc value ramp and milled corners are version.

| slots | fill |
| --- | --- |
| 1 | celadon |
| 2 | saffron |
| 4 | vermilion |
| 8 | lavender |
| 12 | fuchsia |
| 16 | cinnabar |

Twelve and sixteen stay unused on today's roster, per ADR-047 Decision 1. They are
coloured now so a config landing there is never silently drawn as an 8.

This does not walk back ADR-047's "no grade colours". Grades are not returning: there is
no named tier, no glyph and no drop weight. The number ADR-047 kept is simply gaining a
fill, and size remains stated in words wherever a row has space for it.

## Decision 3: the fill follows the drawn value

The colour derives from the same `slots` figure the mark draws, which is `slotsOf` and so
already halved for a minified config. A minified 8-slot config reads on the 4 rung,
matching its bar length. The lookup is a descending threshold walk rather than a lookup
by exact size, because halving can leave the ladder (a minified 12 becomes 6, which reads
on the 4 rung) and a missing key would otherwise render an unstyled bar.

## Decision 4: an unseen Dex chip gives up its size

`DexChip`'s unseen arm carried the family and nothing else. It now carries the size, which
is a larger tell than a family was, because size is price. This is accepted: the catalogue
still says only what shape of thing is missing, never which one.

## Decision 5: one ramp, two renderings, every screen set

`src/ui/sizes.ts` is the only table. It exports `sizeFill` for small marks drawn at full
saturation and `sizeTint` (the same rungs at 15% alpha) for the large segments modern
theme's `SlotTrack` fills behind a label. Two functions rather than one because a solid
`bg-celadon` behind body text is unreadable, and because a second `bg-*` utility on the
same element loses to Tailwind's source order rather than overriding it: the state
constants gave up their own backgrounds so the tint is the only one.

The colour reaches the authed game through two files, not through the screens:
`ConfigChip.ui.tsx`, which takes a whole `Config` and so derives its own size for all
twelve of its call sites, and modern theme's `SlotTrack`, where size takes the fill and
install state keeps the border. `/proto-run` is a dev rig (ADR-002), so shipping the ramp
to the terminal theme alone would have left every player-visible config uncoloured.

The mark is decorative inside `ConfigChip` (`aria-hidden`) and labelled in the terminal
theme's standalone `Slots`. The chip's mark sits inside a pressable element whose
accessible name must stay the config's own name; labelling it renamed twelve screens'
worth of buttons to "1 slot .js".

## Consequences

- Roughly half the roster (16 of 33 configs) sits on the 1 rung, so a build rail reads as
  mostly celadon. This is the honest picture of a roster skewed to small configs, and it
  is the reading to check first in playtest.
- The size hues overlap the gate swatch palette, which is what ADR-043 objected to when it
  refused per-grade hues. Accepted here because families no longer compete for the same
  channel: a swatch appears on gate furniture, a size fill only ever on a config's own
  mark.
- `SlotTrack` needed an explicit `open` flag for a slot held without running, which used to
  be expressed as a segment with no family.
- `Config` has one less required field, so config fixtures shrink.
