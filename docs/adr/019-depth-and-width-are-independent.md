# ADR-019: Swatches are gate badges

## Status

Accepted 2026-08-06 (Marciano). Superseded ADR-018 the same day it was accepted.

**Live:** Decision 3, the swatch model, plus the two dated notes below on why the
roster has the length and order it does.

**Dead:** Decisions 1, 2 and 4. Depth and width were independent here; ADR-034
then made clears grant slots and ADR-046 made them bought outright. "Depth is
paid for in checks" died with checks (ADR-035).

## Context

ADR-018 made gate N require slot N, so unlocking a slot was what advanced the
climb. Marciano rejected it a day later; see [rejected.md](rejected.md).

## Decision: swatches are gate badges

A swatch is keyed to a **gate** and awarded server-side on the clear. You beat
the leader, you get the badge; backpack space earns nothing. `VICTORY_GATE`
becomes a content decision (12, so 13 gates and 13 badges), and the roster ends
**Elite** (gate 11) then **Champion** (gate 12).

Ids are persisted as `swatch-${theme}` in `users.owned_swatch_ids`, never gate
numbers, which is what makes the ordering below safe to change.

### The roster's spine is the palette, not the map (2026-08-07)

Every gate spends one Kanto colour exactly once, so the count is "12 colours plus
the gradient". The two non-gym landmarks (Lavender, Seafoam) exist because their
**colours** did, not because Kanto owed them a stop.

A fourteenth gate would therefore mean inventing a thirteenth colour, off-palette
from the Warp theme the set is drawn from. And once a location can justify a
colour rather than the reverse, Mt. Moon, Victory Road, the Safari Zone and Silph
Co. all have an equal claim and there is no principled place to stop. Victory
Road is the one with a real narrative gap to fill, since the 8th badge hands
straight to the Elite Four; it is name-checked in flavour rather than given a
swatch.

13 gates against 12 usable colours is also why the summit pair are drawn apart:
Elite keeps indigo with a rim, and the Champion alone wears the gradient, because
indigo is the app background.

### Landmarks sit where Kanto walks them (2026-08-07)

Lavender and Seafoam moved from gates 9–10 to 4 and 8, leaving the eight badges
in strict trainer-card order. Two reasons: the mid-game stops were sitting one
gate from the Elite Four, and the palette's two palest colours were on the
deepest gates, so the run visibly **cooled off** where it should have been
closing in. The summit approach now reads cinnabar → viridian → indigo.

## Consequences

- One swatch per gate means the roster length is an invariant against the gate
  count, asserted in the spec.
- `storageCreditRate` divides by the gate count, weighing a count against a
  count.
