# ADR-013: Gate-scaled coverage — deeper gates raise the stakes both ways

## Status

Accepted 2026-07-22. Amends [ADR-006](006-session-run-mechanics.md) Decision 11,
whose "the loss is deliberately not gate-scaled" clause this reverses.

**Amended by [ADR-035](035-gates-are-auditors.md)**: the lockstep stands, but
both sides now score a per-gate window meter rather than a career total.

**Live:** Decisions 2 and 3, the scaled loss and the zero floor under it.
**Dead:** Decision 1, the gate-scaled gain.
[ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) owns it: a correct
answer is worth the same at every gate, and the HEALTHY line carries the climb
on its own.

Decision 2's magnitude was retuned four times between 2026-08-15 and 2026-09-05.
Only the current shape is recorded below; live values are in `LOSS_LADDER` in
`coverageRatio.model.ts` for the rebuilt model and `rules.model.ts` for the old
run loop.

## Context

ADR-006 settled the raw coverage rules and made the loss flat across gates, on
the reasoning that escalating requirements already punish late mistakes, so a
second growing penalty would be a death spiral.

Playtesting the ported engine surfaced two feel problems:

1. **Late gates felt no more rewarding than early ones.** A correct answer at
   gate 5 earned the same base coverage as at gate 1, so the climb had rising
   difficulty and no rising payoff.
2. **Once gains were scaled to fix that, losses became trivial by comparison.**
   Missing became nearly consequence-free late, which drained the tension the
   roguelite depends on.

## Decision

### 1. The gate number scales the base coverage gain

Dead. [ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) owns the base
gain, and it does not scale.

### 2. The loss scales by the same factor

A miss bleeds `wrongLossShareFor(gate) × the build's per-correct coverage`.
Reward and risk grow in lockstep: a miss costs a fraction of what a hit pays, on
every build, so a greedy build loses more per mistake.

**The share itself climbs with the gate** (shape and values in `LOSS_LADDER`;
the old loop's own curve is `wrongLossShareFor` in `rules.model.ts`, and the two
do not agree). A fixed share stopped working because the demand table grows far
faster than the earn does, so a miss shrank from 1 in 6 of the opening gate to 1
in 50 of the Champion. Holding the ratio flat meant deep gates asked only for
**volume**; a climbing share asks for **accuracy** as well.

Two corrections worth keeping, because both were silent bugs rather than tuning:

- The rule originally read `× rewardMultiplier`, which is `1` on every config —
  the earn actually rides `coverageMultiplier` and `coverageAdd`. So the lockstep
  this decision claimed only ever held on the gate axis: a ×3 build earned triple
  and bled the same. Pricing the loss off `coveragePerCorrect` is what finally
  delivered the decision as written, nine months after it shipped.
- Scaling the gain but not the loss makes accuracy matter *less* the stronger you
  get. That is the failure mode any future retune has to avoid.

### 3. The 0-floor resolves the death-spiral concern

ADR-006 rejected loss-scaling as a death spiral. The pre-existing floor answers
it: coverage per category, and therefore the total, is clamped at 0. A growing
penalty can drain what you hold faster, but it can never push you negative or
compound below zero, so there is no runaway.

The symmetry is the point. Risk stays proportional to reward at every depth, so
a greedy deep-gate answer is a real gamble rather than a formality.

ADR-006 §11's "config effects amplify gains only" is **superseded** as of
2026-08-24: the loss is a share of what the build earns, so config multipliers
reach it by construction. That is the only way the lockstep can hold.

## Consequences

- Linear scaling is a guess. If late gates ever read as binary (one miss erasing
  a gate's worth of coverage), a sub-linear loss curve is the first knob;
  changing the *shape* is a new ADR.
- The rising-stakes curve this ADR built on two axes now runs on one. With
  ADR-073 flattening the gain, the loss is the only term the gate still scales,
  so Decision 2's own warning inverts: the risk is no longer that accuracy stops
  mattering late, it is that a late miss costs more than a hit can pay back.
