# ADR-117: The primary press is one wide bar that wears its gate

## Status

Accepted — 2026-09-26 (Marciano, DVTD-967r). Reverses
[ADR-114](114-the-send-is-the-poll-panels-own-pinned-row.md) decisions 2 and 3
on which bar holds the floor; 114's decisions 1 and 4 stand.

## Context

Every kanto screen asks the player for exactly one thing, and until now it
asked with a small button in the corner of its footer, the same size and shape
as the ways out beside it. Nothing about it said it was the way forward.

The strings that qualify it stood beside it. `ScreenFooter` had three text
slots — the action's label, a `note`, and a `refusal` — and the last two were
laid out around the press rather than in it. On a phone they wrapped onto other
lines; on a long screen the press pinned and they did not, so the sentence
explaining a shut press could scroll out of sight while the shut press stayed.

## Decision

1. **One primary press per screen, as a wide bar.** `Action` is a full-width
   control: a mark, a bold label, a quieter reading under the label, a chevron
   at the trailing edge. `ScreenFooter.action` and the poll's `commit` both
   render it, so every screen asks in the same shape.

2. **Live wears the theme at full brightness; refused keeps the screen's own
   ground.** `segment-theme` — the kit's inverted badge, a bright fill with dark
   ink, tuned to clear AA across all twelve hues — makes this the only control
   on the page carrying the theme at that strength, which is what makes it
   findable without dimming anything else. Refused is not a washed-out copy of
   that: a pale green still reads as "go", and the point of the state is that
   there is nowhere to go yet.

3. **The reading lives inside the press.** A press states the note while it is
   live and the refusal while it is shut. A refusal does not always shut the
   press — a start that failed on the server is still worth pressing again — so
   the rule turns on the press, not on whether a refusal was given. Whatever the
   press does not take stands on the row above rather than being dropped.

4. **The mark is the gate, or where the press leads.** A press inside a run
   wears its gate's swatch; one outside a run wears its icon. Both sit in the
   same slot at the same size, so a footer that swaps one for the other does not
   move the label beside it.

5. **The wrapper draws a ground only when it carries more than the press.** The
   press is an opaque bar in its own right, so a second bar behind it is a black
   plate around a button. A stake reading or an aside's note has no fill of its
   own and still needs one.

6. **One aside sits beside the press; two or more take a row of their own.** A
   lone way out shares the press's line from `sm`. Two do not: that leaves the
   press the narrowest thing in a row it is supposed to lead, and a screen
   offering two exits is offering a choice — a choice reads as a pair of equals,
   not as a queue to the left of the real press. Several asides therefore span
   the footer above the press and split it evenly.

   Either way they keep the quiet ambient tone and stand at the press's own
   height: `Button` gained an `lg` size rounded like a panel, so a way out and
   the way on read as a pair of boxes rather than a control beside a slab.
   Everything stacks below `sm`, because two presses side by side on a phone
   squeeze the wide one to a stub.

7. **Nothing stands between the aside and the press.** A string in that gap
   reads as a third control, and it is the only thing in the row that can give,
   so squeezing it there collapsed it to a word per line on a phone while the
   two presses stayed put. What the press cannot carry goes on its own line
   under the whole footer.

## Consequences

`ScreenFooterProps` lost `noteAt`. Placing the note was a choice worth making
when the note stood outside the press; there is one slot now, and decision 3
fills it.

`Button`'s radius moved out of its base class into a size-keyed map, for the
reason its own `WIDTH` map already records: `lg` sets a radius of its own, and
two utilities for one property are resolved by Tailwind's order, not ours. It
also gained a `fill` width — spans whatever it is given at every width — since
two asides splitting a footer cannot each shrink to their own label without the
pair reading as ragged.

`border-theme-faint` and its `ring-theme-faint` pair dropped from `0.2` alpha to
`0.12`. On a page of stacked panels every edge is drawn twice, one panel's
bottom against the next panel's top, so a rung tuned against a single panel
reads as a grid once a screen fills up.

`Icon` gained `forward`, `back` mirrored. The press carries an arrow rather
than a chevron: it goes somewhere, it does not open something.

`Swatch` gained `ground`. Every fill it had was pitched against the near-black
screen, and `current`'s dark well inverts badly on a bright one. The bright set
draws in `currentColor` instead, borrowing the ink `segment-theme` already
guarantees, so the mark needs no per-hue tuning of its own.

The poll panel lost its count heading. Two stacked header rows above a question
read as chrome before the thing the screen is asking, and the coverage rail
already states the run's position in the window. `pollLabel` and `pollLabelFor`
are gone with it.

Every press's accessible name now carries its reading, joined the way `Button`
joins a label and its detail. Tests that matched a press by its exact label
match a prefix instead.
