# ADR-106: The poll screen reads coverage in units

## Status

Accepted — 2026-09-24 (Marciano, DVTD-zauk). Amends
[ADR-070](070-coverage-reads-as-a-banded-bar.md): the bar keeps its percent
geometry and the poll screen speaks units on it. Amends
[ADR-077](077-the-pin-rides-the-fill-it-names.md) decision 4: the moving pin
counts whole units where it counted whole percent.

## Context

The meter is cumulative (ADR-073): units banked over every slot the run has
opened, `5 × (gate + 1)`. Clearing a gate opens five more slots, so the same
units read half the percentage. Pallet at 42% reads 21% at Boulder having lost
nothing. Marciano hit this twice in one session and read it as a bug. A number
that falls after a win reads as punishment whatever the caption beside it says.

Prep and the shop already price the line in answers (`answersOwedFor`). The
poll screen, the surface a player sees most, still headlined the percent:
`70% · SHAKY` over a track marked `HEALTHY 80%`.

The alternative on the table was to hide the percent until Boulder. Boulder is
the gate where the halving first happens, so hiding it there removes the
baseline and keeps the drop.

## Decision

1. **The poll screen speaks units held against the gate's HEALTHY units.** The
   header reads `35 of 40 · SHAKY`, the aria reading `35 of 40 needed · SHAKY`,
   the HEALTHY mark `HEALTHY 40`, and the pin and its announcement state the
   units. Units never move against the player; the re-base shows as the line
   rising, 3 at Pallet to 6 at Boulder, the way a harder blind does.

2. **The track stays in percent.** `CoverageBar` takes an optional
   `units: { held, healthy }` beside its percent props and changes only what it
   says, never where it draws. Rescaling the geometry would have touched every
   rounded position the specs pin, for no visible gain.

3. **Only the poll screen passes units.** Debrief, run over, prep and shop keep
   the percent: comparing gates against one another is their point, and a
   percent is the one figure that compares across denominators.

4. **The lead line keeps its percent.** "You have scored 35 units across 50
   slots, which is 70.0% coverage" is the bridge that explains why 35 of 40
   draws a 70% fill. It is stated once, under the bar, as the explanation and
   not the headline.

5. **The moving pin counts in whole units**, for the reason ADR-077 decision 4
   gave for whole percent: `counter()` renders integers. The settled pin states
   the hundredth, the precision the receipts use.

## Consequences

`marks: "rungs"` still prints percent rungs; nothing passes it with `units`.

Wiki §8 (the poll screen) and §2.2 name the poll screen beside the debrief and
the shop as a surface that prices the line in units.
