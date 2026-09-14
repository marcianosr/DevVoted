# ADR-073: Coverage is a flat gain, reset every gate

## Status

Accepted 2026-09-12 (Marciano, DVTD-nd6r). Supersedes
[ADR-013](013-gate-scaled-coverage.md) Decision 1, the gate-scaled reward base.
ADR-013 Decisions 2 and 3 stand.

Built 2026-09-13 (DVTD-1zzz). `coverageRatio.model.ts` owns the numbers and the
run loop reads them. `COVERAGE_DEMANDS`, `gateBaseMultiplier`,
`pollDifficultyMultiplier` and `wrongLossShareFor` are deleted.

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
multipliers, global multipliers, opener bonuses, streak and cache effects,
spillover and audit protection are what close the gap.

This is deliberate, and it is the Balatro shape: the base score is
near-irrelevant, and the engine you assemble on top of it is the game.

### 4. The window closes at 100% and reopens at 0%

ADR-035 made coverage a per-gate meter. This states the two ends of it: gains
clamp at 100%, and the next gate starts from nothing. A config that carries
coverage across the boundary (spillover) is the only exception, and it is an
exception a config has to buy.

Both halves are load-bearing. Without the cap, a stacked build banks one gate's
surplus into the next and the demand table never catches it. Without the reset,
coverage becomes a career total again and a good early run coasts.

## Consequences

- **The loss is now the only gate-scaled term in the model.** ADR-013's
  symmetry is gone in one direction: the gain is flat and the miss cost still
  climbs (`LOSS_LADDER`). ADR-013 Decision 2 warned that scaling the gain but
  not the loss makes accuracy matter less as you get stronger. This is the
  mirror of that, and it needs the same watching: a miss that costs half an
  answer at gate 12 while a hit still pays 5% can make deep gates read as
  binary. `LOSS_LADDER` is the first knob if it does.

- **The streak moved from coverage to KB.** It multiplied every correct answer's
  coverage; the ratio model has no term for it, and `gatePayoutKb` multiplies the
  gate payout instead. `gateClearPayout` follows suit, so a perfect window pays
  1.5x and a held ten-streak 2x. That is a permanent buff to the economy rather
  than a wash, and it is the first dial to turn if payouts read loose.

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
