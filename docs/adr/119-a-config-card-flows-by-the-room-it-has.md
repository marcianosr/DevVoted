# ADR-119: A config card flows by the room it has, and never below its own name

## Status

Accepted — 2026-09-26 (Marciano, DVTD-458u). Supersedes DVTD-8byc's decision
that offers wrap at their own width, which was made about the one-line chip
that no longer exists.

## Context

A config used to be one line: name, weight, a badge. `DVTD-8byc` gave the shelf
and the build a two-column grid on that basis — *"a full-width row makes a short
name read as wide as a long one, so five offers look like a form rather than a
shelf"* — and it was right about the chip.

The chip then became a card (`DVTD-sg5i`): a header, an effect sentence, and a
footer carrying the version and what the config uninstalls for. The grid stayed.
Inside a half-width screen column, `sm:grid-cols-2` makes each card about 180px
wide, and a card header is `chevron · weight · name · press` where the press is
`shrink-0` and the name is `truncate` inside a `min-w-0` column. So the name —
the one thing identifying what is being sold — was the only part that could give
way, and it gave way to nothing. The shelf rendered five nameless boxes with a
`suggested` badge spilling out from under the Install press. `truncate`'s
`overflow: hidden` is why nothing looked broken: there was no overflow to see.

## Decision

1. **Cards flow by available width, with a floor.**
   `CARD_FLOW = "grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]"`, exported from
   `ConfigChip.ui.tsx` and used by both `Registry` and `Build`. A wide panel
   fills across; a narrow column stacks. The floor is what the header needs, so
   the layout can never spend the name to fit a press.

   `auto-fill`, not `auto-fit`: `auto-fit` collapses the empty tracks in a
   half-filled row and stretches the surviving cards across the whole panel,
   which is the shape this rule exists to prevent at the other extreme.

   `Build`'s `layout` prop is deleted with its `wrap` arm. It had one live value
   left, and the dead arm was the bug.

2. **A card nobody wired a fold to states itself.** `onToggleInfo` absent means
   no chevron and an open card, rather than a chevron that does nothing over
   facts that cannot be reached. `GateChoice` — where you pick a config to drop
   to pay a bill — renders cards with no disclosure state, and its refund
   figures had gone behind an inert press.

3. **A badge appears exactly once, on whichever half is showing.** Decorative
   badges ride the header while the card is shut and the footer, beside the
   version, while it is open. The mock puts `suggested` in the footer; the poll
   screen's build rail is collapsed by default and its badges are live readouts
   (`bump in 3`), which a footer-only rule would have hidden for the whole run.

4. **A panel folds all of its cards at once.** `Panel.Header` takes `trailing`;
   `DiscloseAll` owns `expand all` / `collapse all` and derives "all open" from
   the same set the cards are given, so the press cannot name a move it is not
   about to make. The stored state stays flips-from-default (`discloseAll`), so
   a shelf that re-rolls after an expand-all still deals new offers their
   default.

5. **The build states its free room once, in the header's unit.** One dashed row
   reading `empty` with the weight left in a `Weight` block, whose length is that
   weight — not one box per free slot. It follows the list rather than the
   readout: a screen drawing no list has no vacancy to speak for.

## Consequences

- Reversing DVTD-8byc means a short name again reads as wide as a long one. That
  was the price of the card, and it was already paid the moment the card gained
  an effect sentence that sets its own width.
- The poll rail and prep draw one card per row more often than before, so those
  folds are taller.
- A fixture that omits `openInfo` draws a panel no player ever sees. `Registry`
  and the new-run hand fixtures now deal open, matching `ShopView` and
  `StartView`; the collapsed shelf in Storybook was a fixture, not the screen.
