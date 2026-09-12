# ADR-071: The band a gate closes in decides what the gate does

## Status

Accepted — 2026-09-12 (Marciano, DVTD-afyx; revised the same day by DVTD-2h6o,
which deleted the bribe and stopped OK clearing; the ADR-037 collision resolved
the same day by DVTD-nd6r, in this ADR's favour). Supersedes
[ADR-037](037-a-missed-gate-peels-a-config.md) Decisions 1 and 2.

**Stated, not built**: the prep screen names all four outcomes
([ADR-072](072-prep-opens-on-the-stakes.md)), but `survivesGate` still answers
with one boolean and nothing repeats a gate.

## Context

`survivesGate` compares coverage to the floor and returns true or false. Every
band above the floor clears identically, so OK and SHAKY are colours with
nothing behind them: a run that scraped the floor and a run that met the line
walk away with the same outcome.

That wastes the readout. [ADR-070](070-coverage-reads-as-a-banded-bar.md) put
four rungs on the screen, and a rung the player can see but cannot feel teaches
them to ignore it.

## Decision

A gate resolves on the band its coverage closes in, not on one threshold.

1. **HEALTHY — cleared.** The gate opens, the swatch is won, and the next gate
   comes tomorrow.

2. **OK — paid, but the gate stays shut.** You survive and you are paid for the
   coverage you proved. You do not take the swatch and you do not advance: the
   same gate runs again on **five fresh polls**.

3. **SHAKY — alive, barely.** The same gate again, on a broken streak and
   whatever thin balance the scrape paid for.

4. **DANGER — the run ends** the moment the gate shuts. No retry, no peel.

**Only HEALTHY advances.** OK and SHAKY are the same move at different prices,
and the price is time: a gate is one day, so repeating it spends the scarcest
thing the player has.

## Consequences

**There is no bribe.** An earlier draft of this ADR let SHAKY buy its way past
the gate with KB. It is deleted, because it answered the wrong objection: the
thing that makes a retry hollow is re-running the same attempt, not getting it
for free. Five fresh polls against a locked build is a different attempt, so it
needs no toll to justify it. That also keeps KB spent on capacity and configs
alone, which is where the build decisions live.

**The repeat is not the free redo ADR-035 shipped and ADR-037 killed.** That one
re-dealt the gate and skipped the shop, so the player replayed the attempt that
had just failed. This one costs the swatch, the streak and a day, and the build
is already locked for the window — there is nothing to re-buy between tries.

**It collided with [ADR-037](037-a-missed-gate-peels-a-config.md), and this one
won** (resolved 2026-09-12, DVTD-nd6r). 037 said a missed gate peels a share of
the occupied slots and that the run dies when the build empties. That is the
only death clock this ADR replaces: OK and SHAKY peel nothing, and DANGER ends
the run at once instead of over three or four shrinking gates.

The peel was kept, with a different trigger. Retrying a gate with a build 25%
smaller than the one that just failed it is a doom loop, which is what made the
peel wrong as a miss penalty; as the answer to an unaffordable upkeep bill
([ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4) it is a
consequence the player can see a gate in advance. 037 Decisions 1 and 2 are dead
and its Decision 3, the loop a repeat runs, is what remains.

So the price list is complete: OK and SHAKY cost a day, the swatch, and SHAKY
also the streak. Nothing comes off the build for missing. What comes off the
build is failing to pay for it.

The payout still comes from `gatePayoutKb`, so OK and SHAKY are paid on the
coverage they actually proved and need no separate rule. Live numbers stay in
`coverageRatio.model.ts`.
