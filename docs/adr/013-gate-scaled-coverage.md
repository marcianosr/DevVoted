# ADR-013: Gate-scaled coverage — deeper gates raise the stakes both ways

## Status

Accepted 2026-07-22. Amends [ADR-006](006-session-run-mechanics.md) Decision 11,
whose "the loss is deliberately not gate-scaled" clause this reverses.

**Amended by [ADR-035](035-gates-are-auditors.md)**: the lockstep stands, but
both sides now score a per-gate window meter rather than a career total.

Decision 2's magnitude was retuned four times between 2026-08-15 and 2026-09-05.
Only the current shape is recorded below; live values are in `rules.model.ts`.

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

`gateBaseMultiplier(gatesCleared) = gatesCleared + 1`. It multiplies the
correctness **share** before config adds/mults and the streak bonus compose on
top, so the whole earn scales rather than a flat term. Applied at the single
scoring site in `answer()`, so nothing downstream recomputes it and the reveal
chip's `base + streak + configs = total` equation reflects it automatically.

### 2. The loss scales by the same factor

A miss bleeds `wrongLossShareFor(gate) × the build's per-correct coverage`.
Reward and risk grow in lockstep: a miss costs a fraction of what a hit pays, on
every build, so a greedy build loses more per mistake.

**The share itself climbs with the gate** (`0.5 + 0.03 × gate`, clamped at the
Champion). A fixed share stopped working because the demand table grows far
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

- The climb has a rising-stakes curve on both axes, expressed in one shared
  binding.
- Linear scaling is a guess. If late gates ever read as binary (one miss erasing
  a gate's worth of coverage), a sub-linear loss curve is the first knob; the
  value is in `rules.model.ts`, but changing the *shape* is a new ADR.
- Decision 1 is **new**, not a reversal: ADR-006 escalated the *requirement*,
  never the *reward base*. It is recorded here rather than amended into ADR-006
  because it belongs with the loss-scaling it is symmetric with.
