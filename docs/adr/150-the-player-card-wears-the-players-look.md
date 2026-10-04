# ADR-150: The player card wears the player's look

## Status

Accepted — 2026-09-29 (Marciano, DVTD-oti7). Amends
[ADR-141](141-a-face-shows-the-player-and-leads-to-them.md) D1 and D5.

## Context

The card a face opens showed one worn title and a head in the page's colours. The
swatch and titles a player picks for their look (ADR-144) showed only on their own
profile page, so no other face in the game carried what they chose.

## Decision

1. **The card's head wears the player's worn swatch** as a fade, the same theme a
   visitor sees on their profile. Nothing worn, or a swatch they do not own, is
   pallet.
2. **Only the head wears it.** The standing below keeps the page's theme and the
   gate's own swatch, so the swatch cannot be mistaken for the gate they stand at.
3. **Every worn title shows**, the first in the swatch colour and the rest quiet.
4. **The standing is one shape everywhere** (the map card, the hover card, the
   profile's Climbing section): the gate row names the gate, badges `gate N` and
   the coverage with its band; the bar points at the reading instead of labelling
   its boundaries; the build heading badges `used / space`; chips are compact; the
   three tiles badge their figures (ADR-148), run storage in saffron.
5. **The close press is the map card's only.** The hover card cannot be pressed.

## Consequences

- The climb map's rows carry each climber's worn titles and theme, two columns
  more per climber.
- `ClimberCard` requires a theme: `src/ui` cannot import the pallet default, so the
  viewmodel always states it.
