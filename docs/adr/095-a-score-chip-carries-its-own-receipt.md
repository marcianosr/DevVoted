# ADR-095: A score chip carries its own receipt, stated in units that sum

## Status

Accepted, 2026-09-22 (Marciano, DVTD-4ob5). Amends
[ADR-084](084-the-answer-shows-its-own-receipt.md) decisions 1 and 2, which it
supersedes in place. Keeps everything else ADR-084 decided, and still depends on
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md)'s split between
multipliers and adders.

## Context

ADR-084 gave the Coverage panel a third region, `what this answer paid`, and
chose to state each row "in the form its config is sold in" — a multiplier as
`×1.25`, an adder as `+0.1`. Rendered, that is a base, a factor and an adder
stacked in one right-aligned numeric column closing on a bold total:

```
right answer base      1
Code Coverage       +0.1
.css matches CSS   ×1.25
paid                1.35
```

That is the visual grammar of addition over numbers that do not add. Reading
down gives `(1 + 0.1) × 1.25 = 1.375`, not `1.35`. ADR-084 filed this as the
price of ADR-083's split — "one presentation cannot be honest about both kinds
at once" — and in doing so gave up its own stated reason for existing: *a figure
you can check against what actually happened teaches more than a figure you are
asked to trust*.

The trade was never forced. `CoverageConfigBonus` already carries **both**
numbers: `value`, the units the config actually added (`subtotal × (mult − 1)`
for a multiplier), and `factor`, the form it was sold in. The receipt threw
`value` away for multipliers.

The region had a second problem it could not solve as a region. It explained
only the answer just given, while the strip directly above it —
`what each poll paid` — shows every poll in the gate, each with a figure nobody
could account for.

## Decision

1. **The receipt moves onto the chip that states the figure.** Every paid chip
   in `what each poll paid` opens its own receipt on hover or focus, so any poll
   in the gate explains itself, not only the last one. The standalone
   `what this answer paid` region is deleted along with `PollCoverage.breakdown`:
   the same arithmetic in two places on one screen is one place too many.

2. **A row states the units it added, so the column sums.** The figure column is
   one denomination — units, two fixed decimals — and adds up to the total it
   closes on. Right-aligning a column of constant fractional width also aligns
   its decimal points, which is what lets the eye check the sum.

3. **The form a config was sold in survives as a tag.** A multiplier keeps
   `×1.25` beside its name, where the shop's vocabulary belongs and where it
   cannot be mistaken for an addend. An adder gets no tag: its sold form *is*
   the units it added, and the figure already states them.

4. **The rule falls above the total only.** A hairline between every row makes a
   list; one hairline above `paid` makes a sum. `LedgerRows` gains
   `rules: "each" | "total"`, defaulting to today's behaviour so the ledger and
   the debrief are untouched.

5. **The chips become real controls.** A track carrying receipts holds buttons,
   so it may no longer be `aria-hidden` the way a decorative swatch track is.
   Each chip names itself `poll 3 — paid 1.45`. `Tooltip` gains `side="top"`,
   `align="center"` and `bare`, because a badge is already a trigger and wants
   no dotted underline under it.

## Consequences

The gate debrief gets the same receipts for free: `runPaidFor` and `pollPaidFor`
share `payoutRowFor`, so every gate's chips explain themselves there too. That is
the intended reading — the debrief is where history is the point (ADR-084 D6).

`paidOf` now needs the whole `RunView` rather than one answer, because a receipt
names configs and categories. `pollBreakdownFor` stays exported and unchanged in
shape; only what it puts in each row changed.

Order within the receipt no longer carries meaning, and no longer needs to. Every
row is an additive contribution, so the rows sum whatever order the build put
them in — which is why the column can be read without knowing which config fired
first.

Touch has no hover. The chips answer to focus as well, so a tap reaches them, but
a proper press-to-open popover is not built and `Tooltip` remains CSS-only.
