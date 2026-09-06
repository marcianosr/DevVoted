# ADR-013: Gate-scaled coverage — deeper gates raise the stakes both ways

## Status

Accepted 2026-07-22. **Amends [ADR-006](006-session-run-mechanics.md) Decision 11**: coverage now scales with the gate number on both the gain and the loss side; ADR-006's "loss is deliberately not gate-scaled" clause is superseded (⚠ marker inline there). Depends on ADR-005/006. Live-tuned numbers live in `src/modules/run/rules.model.ts`; this ADR records the decision and rationale, not the values. **Decision 2's ratio amended by [ADR-034](034-the-gate-is-a-ci-run.md)** (2026-08-15): the lockstep stands, `WRONG_COVERAGE_LOSS` halves to 0.25. **Amended again 2026-09-05**: the ratio is no longer one number — it climbs with the gate (`wrongLossShareFor`, 0.5 + 0.03 a gate), see Decision 2.

> ⚠ Amended by [ADR-035](035-gates-are-auditors.md) (2026-08-17): the gain/loss lockstep stands, but both now score a per-gate window meter — the demand table reprices per gate, not cumulatively.

## Context

ADR-006 settled the raw coverage rules: a correct answer earns a base of 1 (before config/streak amplifiers), a miss bleeds `WRONG_COVERAGE_LOSS × rewardMultiplier`, and the loss was **deliberately flat across gates** — the reasoning being that escalating *requirements* already punish late mistakes, so a second growing penalty would be a death spiral.

Playtesting the ported engine surfaced two feel problems:

1. **Late gates felt no more rewarding than early ones.** A correct answer at gate 5 earned the same base coverage as at gate 1, so the climb had no sense of rising payoff — only rising difficulty.
2. **Once gains were scaled to fix (1), losses became trivial by comparison.** A wrong answer at a deep gate cost a flat `-0.5`-ish while a correct one paid several points. Missing became nearly consequence-free late-game, which drained the tension the roguelite depends on.

## Decision

### 1. The gate number scales the base coverage gain

`gateBaseMultiplier(gatesCleared) = gatesCleared + 1` (gate 1 ×1, gate 2 ×2, …). It multiplies the correctness **share** before config adds/mults and the streak bonus compose on top, so the whole earn scales, not just a flat term. The reveal chip equation (`base + streak + configs = total`) reflects the scaled base automatically — the multiplier is applied at the single scoring site (`answer()` in `run.model.ts`), so nothing downstream recomputes it.

### 2. The loss scales by the same factor

> ⚠ Ratio amended by [ADR-034](034-the-gate-is-a-ci-run.md) (2026-08-15):
> `WRONG_COVERAGE_LOSS` halves to 0.25 (break-even base accuracy 33% to 20%)
> because a miss now also costs progress toward the gate's coverage demand.
> The lockstep gate-scaling below stands.

A miss bleeds `wrongLossShareFor(gate) × the build's per-correct coverage`. Reward and risk grow in lockstep: a miss costs a fraction of what a hit pays, on every build. This **reverses ADR-006 Decision 11's flat-loss rule**.

> ⚠ Share made gate-scaled 2026-09-05, on playtest feel ("the wrong loss can be
> steeper"). It was one fixed number at every gate; it is now
> `0.5 + 0.03 × gate`, clamped at the Champion (0.5 → 0.86). Reason the fixed
> share stopped working: the demand table grows far faster than the earn does,
> so a miss shrank from 1 in 6 of the opening gate to 1 in 50 of the Champion.
> Holding the ratio flat meant deep gates asked only for volume; a climbing
> share asks for **accuracy** as well (break-even 33% → 46%). Lockstep with the
> build is untouched: the share still multiplies what your own build earns, so
> a greedy build still loses more per mistake. Same session:
> `COVERAGE_DEMANDS` gate 11 → 300 and gate 12 → 375.

> ⚠ Formula corrected 2026-08-24, intent unchanged. The rule read
> `× rewardMultiplier ×  gateBaseMultiplier`, but `rewardMultiplier` is `1` on
> all 30 configs — the earn rides `coverageMultiplier` and `coverageAdd`
> instead. So the lockstep this decision claimed only ever held on the gate
> axis: a ×3 build earned triple and bled the same, making a miss cost 1.06
> answers instead of 1.25. Pricing the loss off `coveragePerCorrect` delivers
> what the decision always said. `WRONG_COVERAGE_LOSS` also raised 0.25 → 0.5,
> so a miss costs 1.5 answers.

### 3. The 0-floor resolves the death-spiral concern

ADR-006 rejected loss-scaling as a death spiral. That concern is answered by the pre-existing floor: coverage per category (and therefore the total) is clamped at 0 (`Math.max(0, …)` in `answer()`). A growing penalty can drain what you have faster, but it can never push you negative or compound below zero — there is no runaway. The symmetry (gain and loss scale identically) is the point: risk stays proportional to reward at every depth, so a greedy deep-gate answer is a real gamble, not a formality.

ADR-006 §11 clause 2 ("config effects amplify gains only") is **superseded** as of 2026-08-24: the loss is now quoted as a share of what the build earns, so config multipliers reach it by construction. That is the only way the lockstep can hold — a rule that scales the gain but not the loss makes accuracy matter less the stronger you get, which is what shipped for nine months under a formula that read an always-1 field.

## Consequences

- **Positive**: the climb now has a rising-stakes curve on both axes; late gates feel richer and misses stay meaningful. One shared `gateMultiplier` binding expresses "deeper = higher stakes" in exactly one place.
- **Negative / to watch**: linear (`gate + 1`) scaling is a guess. At the summit, gains and losses are ×5 — swingy by design, but if playtests show late gates feel binary (one miss erases a gate's worth of coverage), a sub-linear loss curve (e.g. `1 + gatesCleared/2`) is the first knob to try. The value lives in `rules.model.ts`; changing the *shape* would be a follow-up ADR.
- The base-gain scaling (Decision 1) is **new**, not a reversal — ADR-006 §3 escalated the *requirement*, never the *reward base*. It is recorded here rather than amended into §3 because it belongs with the loss-scaling decision it is symmetric with.
