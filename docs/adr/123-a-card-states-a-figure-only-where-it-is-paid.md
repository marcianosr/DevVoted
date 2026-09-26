# ADR-123: A card states a figure only where it is paid, and prose only in its body

## Status

Accepted — 2026-09-26 (Marciano, DVTD-ptum, DVTD-9h05). Two rules about what a
config card may state and where. Neither reverses an earlier decision;
[ADR-119](119-a-config-card-flows-by-the-room-it-has.md) decision 3 and
[ADR-120](120-the-dex-draws-the-one-config-card.md) decision 5 are what they
build on.

## Context

`ConfigChip` reads two different affordances off one field. Given a `sellPrice`
alone it prints `uninstalls for 32 KB` in the footer, a description. Given a
`sellPrice` **and** an `onUninstall` it prints `+32 KB` on the press and appends
it to the hint, a promise. The new run screen handed it both. Nothing on that
screen is paid for — its registry prices read `free` and the install reducer
deducts nothing — and its uninstall reducer changes storage not at all, so the
press promised storage the run had no way to give. The shop is the only surface
that pays.

Separately, the Dex put an earned config's provenance — a full sentence,
"Earned: peeked the community split 5 times" — into the card's `detail`, which
renders in the head, inside the one flexible column beside the name. A shut card
was three stacked lines where its neighbours were one, the chevron and weight
block floated vertically centred beside the stack, and `CARD_FLOW`'s
`items-start` left the rest of the grid row empty under it. This is ADR-119's
truncation bug from the other side: the head has one column that gives, so
anything handed to it either shrinks to nothing or grows without limit.

## Decision

1. **A card quotes a figure only on a screen that pays it.** The new run build
   and its shelf use `settledChipFor` / `settledFactsFor` — the no-refund facts
   builders the gate outcome and run over screens already use — so the press is
   a bare `Uninstall` and no footer says what anything uninstalls for. The kit
   keeps the refunding press; the shop keeps using it.

   This is about the screen, not about the config: the same config sold in the
   shop later that run still refunds. A figure whose truth depends on being
   somewhere else is not a figure the player can act on here.

2. **A shut card's head states only what fits on its line.** `detail` is for a
   short mark beside the name — the shop's `1 in 8 rolls` — never prose. A
   sentence is body copy, and the body is where the Dex now states how a config
   came to you, merged into the note that already carried the rung an install
   gives you.

## Consequences

- The Dex's `starter` / `earned` tags are gone. The note states the provenance
  sentence the domain already produces (`STARTER_PROVENANCE`, `provenanceOf`)
  plus the ladder tail: `Starter config · v1 of 5`, `Earned: peeked the
  community split 5 times · v1 of 2`. The word was being said twice.
- `grantedCardFor` no longer reads `entry.starter`; the distinction was already
  carried by which provenance the domain returned.
- A shut card in every weight group is now the same height, so the flow grid
  fills its rows.
- The shop still quotes the undiscounted `sellRefund` while paying the
  discount-aware `sellRefundIn`, which decision 1 does not settle. Tracked on
  `DVTD-ea7h`.
