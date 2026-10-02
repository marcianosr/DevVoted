# ADR-176: Who cleared what reads the gate outcome

## Status

Accepted — 2026-10-02 (Marciano, DVTD-06o0). Replaces the single "Who showed up"
row of the community board's turnout panel.

## Context

The turnout panel said one thing: how many players answered today. The proto-run
rig already drew a "Who cleared what" panel, but there it bucketed simulated players
by right answers, which is not how a gate is decided. The players asked for the
outcome of the gate itself, plus a few records about the day.

## Decision 1: five outcomes, read from the latest close

Each player who closed a gate today sits in exactly one row:

| Row | Means |
|---|---|
| PERFECT | the latest close cleared on the perfect band |
| HEALTHY | the latest close cleared on the healthy band |
| OK | the latest close cleared on any other band |
| SHAKY | the latest close was held |
| DANGER | the run fell today |

SHAKY and DANGER describe what happened, not the coverage band. A clear on a shaky
band files under OK, because the gate let it through. A player who fell and started
a new run counts by the live run. A live run that has not closed a gate yet sits in
no row. Until somebody closes a gate, the panel falls back to the old
"answered today" row. `outcomeOf` in `dayRecords.model.ts` owns the mapping.

## Decision 2: records sit under the outcomes in the same panel

Below a `today's records` strip: biggest and lightest build (weight, empty builds
skipped), comeback (the latest close cleared a gate an earlier close in the same run
held), most audits (every audit the run's schedule dealt), most installed config
(players running it), most expensive build (sum of draft costs, upgrades left out),
KB generated today and KB spent today. A tie names every holder. A record nobody
holds is not drawn.

## Decision 3: KB figures are derived, not ledgered

There is no KB ledger. Generated is the sum of each close's `kb`, which already
contains the faucet commit. Spent is the start balance (pinned-start KB plus the
warm boot) plus generated minus what the run holds now, floored at 0. That is net
of sells and refunds, which is the honest reading without a ledger. The two KB rows
state the community total, with the top player's face.

"Today" is every live session run plus every session run that fell today. A live
run started yesterday counts in full.

## Rejected

- **A KB ledger table.** Exact, but it needs a migration and a write at every KB
  change. Revisit if the derived figure starts to mislead.
- **A separate records panel.** The records describe the same players as the
  outcomes, so they share the panel.
