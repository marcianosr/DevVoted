# ADR-176: Who cleared what reads the gate outcome

## Status

Accepted — 2026-10-02 (Marciano, DVTD-06o0). Replaces the single "Who showed up"
row of the community board's turnout panel. Amended 2026-10-03 (DVTD-ah7g): the
panel is titled "Today's records", and outcomes and records share one list with no
divider between them. Decision 1 amended 2026-10-03 (Marciano, DVTD-ah7g): a fallen
run stays in DANGER after its player starts again, and "answered today" always
leads the panel — see the amendments below.

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
no row. The old "answered today" row leads the panel, above the outcomes (see the
second amendment). `outcomeOf` in `dayRecords.model.ts` owns the mapping.

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

## Amendment (2026-10-03): the dead stay in DANGER

Decision 1 counted a player who fell and started again by the live run only, so their
corpse left the panel. Marciano disagreed: DANGER is where a climber looks for runs
to loot (ADR-135), and a corpse is lootable whether or not its owner climbs again.
DANGER now lists every player with a run that fell today, once each, and a player can
also sit in their live run's row. A DANGER face opens that run's card, the one the
climb map opens, which carries the Loot press. The other four rows still read live
runs only.

## Amendment (2026-10-03): who showed up leads the panel

Decision 1 drew "answered today" only until the first close, so once anybody closed a
gate the faces of everyone who played vanished from the board. Marciano disagreed: that
row is the one place that shows who played today, whatever their gate did, and its faces
are what make the board recognisable. The row now always leads the panel, with every
player who answered today wearing their border, and the outcome rows follow it.

## Amendment (2026-10-08): today means gates closed today

"A live run started yesterday counts in full" meant the records never reset: a run's
KB, build and outcome from earlier days stayed on the board until the run ended.
Marciano reported it as a bug. Every recorded close now carries the day it closed on
and the storage the run held after it. A live run reaches the outcomes and records only
through a close made today, and only those closes feed its outcome and KB generated.
KB spent starts from the storage after the run's last close before today, or from the
start (pin and warm boot) when the run has none. A comeback still sees an earlier
day's hold. The build records read the current build of each run that closed a gate
today. Closes recorded before this carry no day and never count as today. A run that
fell today stays in DANGER, as the first amendment says.

## Rejected

- **A KB ledger table.** Exact, but it needs a migration and a write at every KB
  change. Revisit if the derived figure starts to mislead.
- **A separate records panel.** The records describe the same players as the
  outcomes, so they share the panel.
