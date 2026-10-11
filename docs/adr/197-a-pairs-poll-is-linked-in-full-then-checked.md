# ADR-197: A pairs poll is linked in full, then checked

## Status

Accepted — 2026-10-11 (Marciano, DVTD-mgh1). Replaces ADR-192 Decisions 2 and 3.

## Context

ADR-192 resolved a pairs poll one match at a time: two taps, then green or red. A
mock drew the poll as numbered tiles joined by coloured lines, with a clear and a
Check press. Linking every pair before anything is marked lets a player think the
whole set through, and the lines show at a glance which tile goes with which.

## Decision 1: link all four pairs, then Check

Tap a tile, then a tile in the other column, to draw a link. Tapping a linked tile
undoes its link, so it can be redrawn; clear removes every link. Check stays shut
until all four pairs are linked; the press, **Check pairs**, sits beside clear under the tiles. Nothing is marked before Check.

## Decision 2: Check marks every link at once

The server gets the four links in one action and grades them against the hidden
pairs. A link that joins a real pair turns green, any other red. The poll ends on
Check.

## Decision 3: a poll holds four to six pairs, and pays one pair short

An author writes four to six pairs, each tile at most 30 characters so it fits a
phone column. With every tile linked once, the last link is forced, so a poll of
`n` pairs pays `min(right, n − 1) ÷ (n − 1)` at ×2 credit. Four pairs pay 1, ⅔, ⅓
or 0, as ADR-192 Decision 4 did; six pairs pay a fifth per right link.

## Decision 4: a link wears its left tile's number and colour

The left tiles are numbered 1 to 4 and the right tiles lettered A to D. A linked
right tile takes its left tile's number, and both tiles and the line take one of
four colours that are neither green nor red, so a link never reads as a verdict.

## Decision 5: every answered poll waits for Next

After an answer the poll stays on screen with a **Next** press (Enter works too), so
the player can read the verdict and the poll's explanation. This replaces ADR-170 Decision 1, which moved on by itself after a fixed
hold. A gain chip still lands in the bar before the card leaves.

## Consequences

- One action, `check-pairs`, replaces the per-match action; the run keeps no pairs
  progress between taps.
- A run left mid-poll on the old rules loses its resolved pairs and is checked fresh.
- The answer records the player's link for each pair. After Check and on the review
  the board is dealt again as it was played, each link in its own colour and marked
  ✓ or ✗ (a wrong one dashed). A switch to an answer key was tried and dropped: two
  boards in two orders read as a different answer. An answer recorded before links
  were kept shows the pairs straight across, green or red.
- The answer view on a poll's own page draws each pair straight across, green.
