# ADR-073: Coverage is a flat gain over every slot the run has opened

## Status

Accepted 2026-09-12 (Marciano, DVTD-nd6r). Supersedes
[ADR-013](013-gate-scaled-coverage.md) Decision 1, the gate-scaled reward base.
ADR-013 Decisions 2 and 3 stand.

Built 2026-09-13 (DVTD-1zzz). `coverageRatio.model.ts` owns the numbers and the
run loop reads them. `COVERAGE_DEMANDS`, `gateBaseMultiplier`,
`pollDifficultyMultiplier` and `wrongLossShareFor` are deleted.

Decision 4 rewritten 2026-09-14 (DVTD-65yi). It was carried over from ADR-035's
per-gate meter and described the opposite of what shipped, which is where the
"my score halved" confusion came from. The file keeps its number; the title lost
"reset every gate" for the same reason.

## Context

ADR-013 made a correct answer worth more at deeper gates, because a climb with
rising difficulty and a flat reward base felt unrewarding. It shipped a linear
`gatesCleared + 1` on the earn, with the miss cost scaled to match so risk and
reward moved together.

The rebuild turned coverage into a percentage of a per-gate window
([ADR-035](035-gates-are-auditors.md)), and the two rules stopped composing. A
percentage that caps at 100 cannot carry a growing base: the scaling does not
make a deep answer worth more, it makes the window fill sooner. Meanwhile the
climb's difficulty had already moved into the demand table. Two dials were
pulling the same rope, and the one the player could see was the demand.

## Decision

### 1. A correct answer is worth the same at every gate

The base gain is fixed: **one unit** for a single-answer poll, two for a
multiple (ADR-081), in `coverageRatio.model.ts`. Nothing about the gate number
touches it. What a unit is *worth as a percentage* does depend on the gate
(`unitsToRatio` divides by every slot the run has opened), but that is the
denominator moving, not the earn.

### 2. The HEALTHY line is the only difficulty dial

Each gate raises the percentage a run has to reach, and that is where the whole
climb lives. It is the one number to tune when a gate should be harder.

The ladder was rebased the same day so that its slope arrives late rather than
early (flat steps to gate 5, then a steeper climb to the Champion). The band
drops are stated in units (`OK_DROP_UNITS`, `SHAKY_DROP_UNITS`), so every rung
is the same ruler, two answers and four answers, whatever percentage that works
out to at the gate. Values in `coverageRatio.model.ts`.

### 3. Configs are the only thing that beats the rising line

A bare build earns at most five units in a five-poll gate, at gate 0 and at
gate 12 alike. Against a denominator that grows every gate that is a full
window at gate 0 and a fifth of one at gate 12, so the demand curve outruns it
by design and multipliers stop being optional somewhere around gate 3. Category
multipliers, global multipliers, opener bonuses, cache effects and audit
protection are what close the gap.

This is deliberate, and it is the Balatro shape: the base score is
near-irrelevant, and the engine you assemble on top of it is the game.

### 4. The denominator is every slot the run has opened

Coverage is `bankedUnits / scoringSlotsAt(gate)`, and `scoringSlotsAt(gate)` is
`5 x (gate + 1)`: five slots at Pallet, ten at Boulder, sixty-five at the
Champion. Units carry across the boundary; the denominator grows with it.

So the meter is a career total, deliberately. A gate is judged on the whole run
rather than on its own five polls, which is what lets a strong opening protect a
bad window later and what makes a collapse something to climb out of.

The cost is a discontinuity the player feels: clearing a gate opens the next
gate's five slots, so the same score is divided by a larger number the moment
the gate shuts. Pallet at 42% reads 21% at Boulder having lost nothing. The
screens have to say so (`NextGate`'s note prices the next gate in answers, the
debrief names the slots ahead); the model does not bend to hide it.

Gains still clamp at 100%. Past a full bar `bankableUnits` stops banking and
`surplusPayoutKb` pays the overshoot at 32 KB a unit, so a stacked build
converts surplus into storage rather than into a lead the demand table cannot
catch. There is no spillover config, and nothing in `src` carries coverage
across a boundary by any other route.

## Consequences

- **The miss cost went to zero, and the denominator carries it instead.** This
  ADR planned to keep ADR-013's scaled loss (`LOSS_LADDER`). What shipped has no
  loss term at all: `applyAnswer` never subtracts from `window.unitsEarned`, and
  no `LOSS_LADDER` exists in `src`. A miss is priced by the slot it spends, since
  the denominator counts every slot the gate opened whether it was answered well
  or not. That is a real cost and it grows with the demand ladder, but it is
  invisible on the meter, which never runs backwards.

- **The streak moved from coverage to KB.** It multiplied every correct answer's
  coverage; the ratio model has no term for it, and `gateClearPayout` multiplies
  the gate payout instead, so a held ten-streak pays 2x. That is a permanent buff
  to the economy rather than a wash, and it is the first dial to turn if payouts
  read loose. The perfect window's 1.5x is stated but not routed: `PERFECT_BONUS`
  has no caller, `gatePayoutKb` has no production caller, and the gate outcome
  screen hardcodes its bonus to zero (ADR-075 says the same of itself).

- **`gateBaseMultiplier` survives as `gateRewardMultiplier`, with one caller.**
  This ADR kills the gate scaling on the coverage gain. It says nothing about the
  KB reward, which is ADR-013's other half and still wanted, so `gateClearPayout`
  keeps paying deeper gates more.

- **Difficulty tuning is now a single-file job.** Making gate 7 harder means
  moving one entry in `HEALTHY_LADDER` rather than reasoning about a demand and
  a reward base that scale against each other.

- ADR-013 keeps its title and its file. Decision 1 is dead and this ADR owns
  the replacement; Decisions 2 and 3 (the scaled loss, the zero floor that
  stops the death spiral) are still what the model does.
