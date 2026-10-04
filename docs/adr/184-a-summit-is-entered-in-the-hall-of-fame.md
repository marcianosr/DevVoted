# ADR-184: A summit is entered in the Hall of Fame

## Status

Accepted — 2026-10-04 (Marciano, DVTD-g1p0). Settles the victory reward left open
in wiki §2.7.

## Context

Clearing the Champion banked 100% of leftover storage and counted toward two
objectives, and nothing else, so winning felt much like stopping. The one standing
constraint: no zero-effort farm run may claim the reward. ADR-161/181 already make
coverage come only from right answers and ADR-159 makes the Champion take only
HEALTHY or PERFECT, so the summit cannot be reached on nothing. The farm that is
left is a run that starts high: a git tag checks a run out at gate 10, two gates
short of the summit.

## Decision 1: a win counts only from Pallet

A summit counts as a win for this ADR only when the run started at gate 0. The same
idea already prices the archive credit, which counts gates climbed rather than
gates cleared. A tag-rescued or pinned start still finishes `victory` and banks its
credit; it is simply not entered and earns no border.

## Decision 2: the community page keeps a Hall of Fame

The community page holds the reigning champion: the last player to win, drawn as the
full player card with the date and time of the win. Beneath it, the history of
champions lists every win, newest first, one row per win, so a repeat champion
appears once for each summit. It reports the climb and shapes nothing (ADR-042
anti-pillar 4).

## Decision 3: the Champion border is earned, or bought for 10 TB

Winning grants the Champion border. It is also on sale for 10 TB of archived
storage, a price no account will reach; the joke is the point, and the shop states
both paths. The grant rides the same transaction that finishes the run.

## Decision 4: the Champion gate is prismatic in its accents

The Champion keeps a dark ground for readability; its rule, bar fill and press wear
the prismatic utilities. The ground is not animated.

Amended 2026-10-04: every panel border joins the accents. Under the Champion a
panel's 1px border is a slowly turning prism (one turn in 12s), held still under
reduced motion; the panel ground stays dark.

## Consequences

- The tier past the summit (Champion+1, +2, …) is DVTD-yzyg and not decided here.
- A win from before this ADR is entered when it started at Pallet, since the run
  rows and state already record both.
