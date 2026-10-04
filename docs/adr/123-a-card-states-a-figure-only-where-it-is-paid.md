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

5. **Install and uninstall are one press wearing two figures.** Both are an
   ambient press with the figure capped on its trailing edge: the label stays
   quiet and the badge carries the colour. Uninstall's cap is viridian because a
   refund is a gain; install's takes no colour of its own, so the price wears
   the config's own theme. The install press used to be a solid pallet fill —
   the palest thing on the card — which made the cheapest thing on offer read
   louder than the config it was buying.

   The price leaves the button's text and enters its cap, which is `aria-hidden`.
   The press keeps naming it because the hint already did: `Install Cache · 128 KB`.

   **Amended 2026-10-04 (Marciano, DVTD-bjb4): decision 5 is superseded on cards.**
   A card now buys and sells through a full-width primary press at its foot, in
   the screen's colour and shimmering while it can be pressed. Install reads
   `Install · 128 KB` as its label (the figure is back in the text, so no cap);
   uninstall reads `Uninstall` and keeps its viridian refund cap. An offer you
   cannot afford greys rather than reddens. The reason is feel: the mock's
   loud, single buy press read clearer than a quiet head-row press, and the
   price is the decision on an offer, so it sits on the press you make it with.
   A bare chip keeps decision 5's ambient, capped presses.

   **Amended again 2026-10-04 (DVTD-p806): the card takes the mock's shape.**
   Folded, a card is the mock's compact row: chevron, weight, the name with its
   effect on one truncated line, and on the right the version and the figure the
   card is about (an offer's price, an installed config's `↶ +16 KB` refund).
   Unfolding reveals the description, the badges and "uninstalls for", and the
   press row. Offers open by default, so a card for sale still shows its press;
   installed configs fold by default, as the mock's build rows do. Uninstall is always red (a raised
   cinnabar press, no shimmer: it should not invite the press). Upgrade leaves
   the head for the press row, beside Uninstall, as a prismatic press reading
   `↑ v2 · 64 KB`; an upgrade-only offer's row holds that press alone.

## Consequences

- The Dex's `starter` / `earned` tags are gone. The note states the provenance
  sentence the domain already produces (`STARTER_PROVENANCE`, `provenanceOf`)
  plus the ladder tail: `Starter config · v1 of 5`, `Earned: peeked the
  community split 5 times · v1 of 2`. The word was being said twice.
- `grantedCardFor` no longer reads `entry.starter`; the distinction was already
  carried by which provenance the domain returned.
- A shut card in every weight group is now the same height, so the flow grid
  fills its rows.
- The shop quoted the undiscounted `sellRefund` while paying the discount-aware
  `sellRefundIn`, which decision 1 did not settle. Closed by
  [ADR-152](152-every-price-previews-the-balance-it-leaves.md) decision 3: a
  build card quotes `sellRefundIn` against the installed build, and states no
  refund at all where that is zero.

## Amendment 2026-10-04: an upgrade asks first, like an install

The upgrade press on a card (build or registry) no longer opens the floating
Upgrades sheet. It arms an inset in the card, the same slot and style as the armed
install: version v1 → v2, one row per effect the next version changes (from the
domain's `upgradePreview`, never invented copy), weight and upkeep when a registry
upgrade grows the build, pay now, then a confirm press and cancel. The sheet now
belongs to bare chips only. A folded card whose upgrade is on offer and affordable
glows its version pennant (held still under reduced motion).
