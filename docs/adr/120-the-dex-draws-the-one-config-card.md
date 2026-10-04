# ADR-120: The Dex draws the one config card

## Status

Accepted (2026-09-26, Marciano, DVTD-wtri). Replaces decisions 1, 2, 3 and 5 of
ADR-108. Finishes the migration ADR-119 (DVTD-sg5i) started.

## Context

`DVTD-sg5i` turned the config chip into a card and replaced its floating info
press with an inline chevron fold, on every surface but the Dex. The Dex kept
`DexConfigChip`: a second chip implementation that borrowed `ConfigChip`'s class
tokens, re-implemented the wrapper, and opened its panel upward where
`ConfigChip`'s opened downward. The press was an `i`, and the panel it opened
floated over the neighbouring chips and could not be reached on a phone — the
reason ADR-119 removed it elsewhere.

The weight-group heading was a flat interpolated string, `"8 weight · 1 of 5"`,
where every comparable line on the run screens states its figures as marks.

## Decision

1. **The Dex draws `ConfigChip`.** `DexConfigChip` is deleted. The `i` and its
   floating panel go with it; the disclosure is the card's chevron, opening in
   place. The unlock paths a locked config used to hide behind the `i` are the
   card's body, where a granted config states its effect.

2. **The weight and the unlock paths are not the secret; the name, the effect
   and the badges are.** `ConfigChipProps` splits into a redactable half and a
   stated one, and `Redactable<Secret, Stated>` takes both. A locked chip given
   neither a weight nor a path is the blackout it always was, so the shop is
   unchanged. Redaction was already per-attribute — a locked `Audit` keeps its
   saffron ground because being a hazard is not the secret. On a tab grouped by
   weight the weight is in the heading anyway, and a path you are told to walk
   is the point of the entry.

3. **A locked card wears the dashed edge; a blackout keeps the solid one.** A
   dashed cell in the kit is a spot you can fill now, which is true only once a
   path is live and counting.

4. **A footer with nothing in it is not drawn.** The card's meta row was
   unconditional, so a locked or met card drew a rule over an empty row. It now
   stands only when there is a version, a price or a badge — ADR-119 decision 2
   for the footer rather than the fold.

5. **The group heading is a labelled bar.** Its weight block leads, the weight is
   named, how much of it you hold follows, and a rule fills the row. The block's
   length is the rung, the same encoding the cards carry, so the heading and the
   cards under it read as one measure.

6. **The tab arrives collapsed, with one press to open it.** The Dex is a
   catalogue to scan; thirty open cards is a wall. `DiscloseAll` sits in the
   panel header, as on the shop, and the flips-from-default store
   (`disclosure.ts`) is shared rather than a second one-open-at-a-time rule.

## Consequences

- The three Dex states are no longer a discriminator; each is which props are
  present. Granted has `info`, met has `unlock` and no `info`, locked has
  `locked` with a weight and paths.
- Met loses its dimming. Overloading `skipped` would collide with the run's own
  skipped vocabulary, and a card with a name and no effect already reads as
  withheld. Met has no producer until the reveal ledger (DVTD-s5vo), so nothing
  player-visible changes.
- ADR-108 decision 4 stands: the pennant names the ladder's ceiling. It moved
  from beside the name into the card footer, and the rung an install gives you
  is the note under the effect.
- `ConfigUnlock.ui.tsx` is new, beside `ConfigFacts.ui.tsx`: the unlock paths,
  their progress bars and their labels, no longer Dex-private.
