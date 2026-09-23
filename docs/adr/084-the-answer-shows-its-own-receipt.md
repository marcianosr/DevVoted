# ADR-084: An answer shows its own receipt, and the build flashes what paid

## Status

Accepted, 2026-09-15 (Marciano, DVTD-zr20). Builds on
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md), whose split
between multipliers and adders is what makes a per-config row statable at all.
Amends [ADR-069](069-the-build-sits-in-a-folded-footer.md) by giving the footer
a second job. Reads the breakdown
[ADR-081](081-a-multiple-choice-answer-pays-double.md) left on the answer.

## Context

A correct JavaScript answer on a build holding `.js` paid `1.3`, and the poll
screen never said where that came from. The player saw the figure arrive in the
payout badges with no route back to the config that caused it.

The screen already promised the explanation. `ScoringRule` — the "what a poll
pays" popover — teaches the 0 / 1 / 2 ladder and closes with **"before the build
multiplies it"**, naming a multiplier it never shows.

The arithmetic was already computed and thrown away.
`coverageBreakdownForAnswer` returns `{ base, streakBonus, configBonuses }`,
attributing `subtotal x (mult - 1)` per config, and it is stored on every
`AnsweredPoll`. Only the old-theme `AnsweringScreen` ever read it; the kanto
adapter dropped it on the floor.

The `1.3` was not even the number. `focusMultiplierOf(CONFIGS.js)` is **1.25**,
and the config's own description says so. `paidOf` put `roundToOneDecimal` on a
units figure, against the convention stated at `rules.model.ts`: *"Units carry a
second decimal: a 1.25x focus on a 1.25x cache is 1.56, not 1.6."* The payout
badges were the one place that rule was broken, and breaking it is what turned
1.25 into an unexplainable 1.3.

## Decision

1. **The explanation lands after the answer, not before it.** A figure you can
   check against what actually happened teaches more than a figure you are asked
   to trust; there is no pre-answer prediction and no "right pays" badge in the
   poll header. Where the explanation is drawn now belongs to
   [ADR-095](095-a-score-chip-carries-its-own-receipt.md).

2. Superseded by [ADR-095](095-a-score-chip-carries-its-own-receipt.md): a row
   states the units it added, and the form its config was sold in is a tag.

3. **Payout figures carry two decimals.** `paidOf` and the row total move to
   `roundToTwoDecimals`. Without this the receipt reads `1.0 x1.25 = 1.3` and
   replaces one confusion with another.

4. **Every chip states what it is worth on the poll in hand.** `ConfigStatus`'s
   online arm carries the `Coverage` it already computed, so the chip can badge
   `x1.25 here`, and each `SkipReason` gets words (`idle this poll`, `JS or TS
   only`, `cache is cold`). The status and the badge are one source; a second
   derivation would need `cachedHits`, which is deliberately not on `RunView`.

5. **The flash lives on the footer, not on the chip.** `ConfigChip` carries
   `data-credited`; `BuildFooter` carries `data-flash` for a 1200ms hold after
   an answer lands. The sheet lights the credited chips when the fold is open
   and the shut panel when it is not. The fold is a native `<details>`, so a
   closed body is `display: none` and its chips are not there to light.
   A transition rather than a keyframe, for
   [ADR-077](077-the-pin-rides-the-fill-it-names.md)'s reason: the chips keep
   their instance across the answer beat, so a keyframe would never replay.

6. **The payout history splits by screen.** The poll screen shows only the gate
   in hand; every earlier gate is a row you cannot act on while answering. The
   whole run's table moves to the gate debrief, inside its Coverage fold, where
   history is the point.

7. **The gate counter is deleted.** `gate 0 / 13` said what the title (`Gate 0 ·
   Pallet`) and the swatch track already said. `HeaderProps.gateCount` is gone
   and the note slot renders only when a screen passes one.

8. **The coverage lead states the score in both denominations.** "You have
   scored 1.25 units across 5 slots, which is 25.0% coverage." Units are what
   an answer pays; the percentage is what the gate judges. The sentence that
   names one should name the other.

## Consequences

`PollScores` loses `hereLabel`. The gate in hand is marked by its swatch state,
and "today" beside a single row was naming the only row there was.

A config that both multiplies and adds gets `x2 +0.25 here` on its chip but only
its multiplier in the receipt, because `coverageBreakdownForAnswer` still
branches on `mult !== 1`. ADR-083 filed this as latent; it is now visible in two
places instead of one. DVTD-yddr owns it.

The receipt is rendered from `LedgerRows` rather than from `Ledger`, which brings
its own `Panel`.

`--build-flash-duration` is its own custom property. `--coverage-duration` is
counted across the whole sheet by two specs, which prove the arc and the digits
cannot desync; a third user would break the proof rather than the property.
