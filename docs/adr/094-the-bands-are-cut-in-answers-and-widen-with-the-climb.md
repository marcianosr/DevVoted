# ADR-094: The bands are cut in answers per gate and widen with the climb, and a gate asks two of its own five

## Status

Accepted — 2026-09-21 (Marciano, DVTD-4zqc). Amends
[ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) Decision 2 (the band
drops are per gate and widen), [ADR-057](057-gate-0-is-the-calibration-gate.md)
(Pallet's line is 3 of 5, the pinned 3% is gone, "holds, never kills" now
follows from the floor's definition) and
[ADR-076](076-the-closing-band-decides-what-it-costs.md) (a hold names its
reason, and the debrief no longer clamps a floor hold's bar). Corrects the
context figures in [ADR-075](075-a-full-bar-pays-a-bonus.md). Wires the
`FLOOR_CORRECT` rule that `rules.model.ts` has carried unread since
[ADR-035](035-gates-are-auditors.md).

Built the same day. `GATE_RUNGS` in `coverageRatio.model.ts` owns the numbers;
`gateRulingFor` in `gate.model.ts` owns the verdict.

## Context

A full playthrough on 2026-09-21 showed three things about the ladder.

**The opening gates were pre-decided.** Pallet's line was 20%, one unit of its
five slots, so one right answer was HEALTHY and the OK band had no room and
collapsed onto it. A cleared Pallet carried at least one unit into Boulder,
whose OK line was 10% of ten slots, one unit: every player who left Pallet had
already cleared Boulder before its first poll.

**OK and SHAKY shrank to slivers.** Both drops were a fixed two units, so on the
bar they read 20 points at Boulder and 3 at the Champion. A player who scraped
through Elite needed 5.5 units at the Champion just to survive, and one who
closed HEALTHY at Marsh opened Seafoam already under its floor. The late game
punished the thin player far harder than the ladder's percentages suggested.

**Yesterday's cushion cleared today.** Coverage is cumulative and clamped at a
full bar, so a player who filled the bar yesterday opens today at
gate ÷ (gate + 1) of it: 50% at Boulder, 92% at the Champion. That is above
every HEALTHY line a weaker player could survive. No band width can put that
player at risk without a treadmill that kills everyone else; only a rule about
today's own answers can. `FLOOR_CORRECT = 2` existed for exactly this, with a
TODO where it belonged and two specs expecting it, and nothing called it.

## Decision

### 1. One table per gate, in answers

`GATE_RUNGS` is one row per gate: the units the run must hold to read
HEALTHY, and the answers OK sits under that line. Percent is derived, so
`healthyAt`, `okAt` and `floorAt` keep their signatures and `gateLadderFor`
stays the one production source. The old `HEALTHY_LADDER`, `OK_DROP_UNITS` and
`SHAKY_DROP_UNITS` are gone. The values live in the file, not here; the shape
is the decision.

### 2. Pallet asks three of five, two clears it thin, and it still cannot kill

Pallet's HEALTHY is 3 units (60%), OK 2 (40%), and its floor is 0. It draws
four bands. Every gate from Boulder draws all five.

### 3. The floor is where HEALTHY stood yesterday

`floorUnitsAt(gate) = healthyUnitsAt(gate − 1)`, zero at Pallet. A run that
closed HEALTHY never opens the next gate in DANGER; a run that closed thin does.
Everything above the floor is exactly one day's HEALTHY step, so the top of the
bar is today's climb. ADR-057's "holds, never kills" is now a property of the
table rather than a clamp.

### 4. OK widens from one answer under the line to three, and a day can always cross it

The OK drop grows with the gate. Two invariants are pinned: it never shrinks,
and it is always under five answers, so a single window can carry a run across
the band at every gate. The HEALTHY step between consecutive rows never shrinks
either.

### 5. The day owes two right answers, whatever the meter reads

The close rules in this order: a bare build holds; the band is read off the
meter, a flawless window lifted to at least SHAKY; DANGER ends the run; fewer
than `FLOOR_CORRECT` right answers today holds the gate; SHAKY holds; anything
else clears. The floor rule can only turn a clear into a hold. It never saves a
DANGER close.

### 6. A hold names its reason, and the debrief keeps the meter honest

`gateRulingFor` returns `heldBy: "bare" | "floor" | "band"`, the reducer records
it on `RunState.heldBy` for as long as the gate is held, and `GatePayout`
carries it to the screen. The ADR-076 clamp that holds the bar inside the
verdict's band is skipped for a floor hold, so a HEALTHY bar stays HEALTHY while
the headline says "holds" and the subtitle says "1 of 5 right, 2 needed". A
floor hold offers the same two exits as a band hold.

### 7. Prep's clear objective is met only with the line and the floor

The required row ticks when the meter stands on the clearing rung **and** two
of today's answers are right. Its explanation prices the line in answers and
never quotes fewer than the floor asks: "or 2 of the 5 right"; where the line is
already held, "the day still owes 2 right answers".

## Consequences

- A HEALTHY-yesterday player cannot coast: 0–1 right holds the gate whatever the
  meter reads, and the debrief says why.
- Boulder can end a run, narrowly: a thin Pallet (2 of 5) followed by 0 of 5 is
  DANGER. Gate 1 could not kill before.
- The late game eases for the thin player. At the Champion a thin entrant needs
  3 units to survive, not 5.5; a HEALTHY entrant opens on the floor, not 3.5
  under it.
- History regrades: `runHistory.model.ts` bands finished runs on today's ladder,
  so a 56% gate-4 run that read HEALTHY now reads OK. Accepted; the archive
  keeps no ladder snapshot.
- The Dex's demand column and the shop's Next-gate line move with the table.
- The Monte-Carlo balance spec measures survival, not clears. Its pins moved and
  were re-pinned at the observed rates: a bare build at 60% summits about one
  run in a thousand (was none), at 70% about 4% of all-singles runs (was under
  1%). Every other pin held.
- Prep's pay column quotes each band at the fewest right answers that land it
  from zero, capped at five. With higher mid-game lines that quote saturates
  sooner: at Lavender a ×3 build reads the same KB for OK, HEALTHY and PERFECT.
  The story fixture grew a ×2 to keep the rows distinct; the quote itself is
  ADR-078's and is left for a later decision.
- `failGate()` in the test factory answers nothing, so every spec that means
  "the gate held" now holds by the floor rather than the band. The outcome is
  the same and the helper is untouched.
- `okAt`'s collapse and `floorAt`'s clamp are gone; the invariants that made
  them unnecessary are pinned instead. `coverageRungsFor` keeps its no-room
  guards because an audit can still squeeze a ladder.

## Rejected

- **Widths in percent of the bar.** A percent width is a sliver of an answer at
  Pallet and several answers at the Champion. Prep already quotes bands in
  answers; the table speaks the same unit.
- **The floor two OK drops under the line.** Symmetric and easy to state, but a
  3-of-5 Pallet opened Boulder at 30% under a 40% floor, and prep showed DANGER
  to a player who had a fine day.
- **A DANGER band at Pallet.** Zero right on day one ending the run is
  the literal "all bands on all gates", and a churn machine for a daily game.
  Pallet holds with a free retry (ADR-057 D3).
- **Letting the floor rule save a DANGER close.** DANGER is the meter's verdict;
  the floor only withholds a clear.
