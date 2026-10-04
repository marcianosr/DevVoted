# ADR-126: Storage settles what the drops cannot

## Status

Accepted, 2026-09-27 (Marciano, DVTD-cx1p). Live: the held gate leads with the
settlement, storage tops up whatever the dropped configs leave owed, and a
config is picked with a checkbox. Reverses the drop-only call of DVTD-ow1y and
amends [ADR-117](117-the-primary-press-is-one-wide-bar.md) decision on how many
asides sit beside the press.

## Context

A held gate owes a peel measured in slots. Configs occupy 1, 2, 4 or 8 slots, so
a quota the build cannot match exactly is overpaid, and the surplus is gone. The
waste is the point: it is what gives a small config a job as a coin.

Two things were wrong with the screen that asked for it.

The settlement was the last thing on the page. A player scrolled past the
coverage fold, the category ledger, the payout ledger, the build changes and the
five answers to reach the only control the screen offers.

And the second payment path did not exist. The screen carried a "Bribe from
storage" press whose handler was a no-op, and the only action the container ever
dispatched was `strip`. `minifyForPeel` had been written and never surfaced. The
screen offered a way to pay that no rule could execute.

## Decision

1. **Storage settles the remainder, after the drops.** The `strip` action takes
   a `fromStorage` flag. It drops the chosen configs first, then buys whatever
   slots are still owed at the peel's own rate, as far as the balance reaches.
   Underfunded is not an error: it settles what it can and leaves the rest owed.

   The remainder is computed in the reducer, not on the screen. A screen that
   worked out its own remainder would quote a cost the domain could disagree
   with the moment either side changed.

2. **The settlement leads, and the debrief collapses under it.** On a held gate
   the settle panel sits directly under the header and the five recap folds move
   into one shut column under a "What happened" heading. A cleared gate keeps
   its two-column read, because there the debrief *is* the screen.

3. **A config is picked with a checkbox.** This reverses DVTD-ow1y, which chose
   a pressable badge on the grounds that a checkbox was not a kit idiom. Four
   rows of a multi-select read as a form, and a badge that toggles reads as a
   label until pressed. `Pick` is the square; both payment paths wear it, so the
   screen asks the same question the same way twice.

4. **A drop is quoted in the slots it frees, not in its sell value.** These had
   drifted: `sellRefund` halves a config's draft cost, which three configs
   override. One of them drafts free, so the screen said dropping it settled
   nothing while the domain freed its slots all the same.

5. **Two ways out stand beside the press, not in a row above it.** ADR-117 gave
   a full-width row to two or more asides. Two is the common case — review and
   community on a cleared gate — and it reads as three stacked bars. Three or
   more still take the row.

   The confirm dialog takes the same shape: a small cancel beside a wide
   confirm, in that order, rather than two presses of equal weight.

## Consequences

The overpay penalty softens. A player who can afford it now buys exact change
rather than throwing away a slot, so a small config is a coin only while the
balance is thin. That is the intended trade — storage is the resource the run
already meters — but it is a real change to what a peel costs, and wants a
playtest before the numbers are trusted.

`minifyForPeel` is still unreachable. It is now the *third* way to pay that no
screen offers, which makes it either a follow-up or a deletion.

The kit gains `Pick`, and `SlotTrack` fills gain an optional colour so the
settlement bar can name its three sources — storage, dropped configs, overpay —
in one track. The legend draws only the sources that carry a slot, so an
untouched screen shows no legend at all.
