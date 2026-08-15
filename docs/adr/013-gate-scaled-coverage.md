# ADR-013: Gate-scaled coverage — deeper gates raise the stakes both ways

## Status

Accepted 2026-07-22. **Amends [ADR-006](006-session-run-mechanics.md) Decision 11**: coverage now scales with the gate number on both the gain and the loss side; ADR-006's "loss is deliberately not gate-scaled" clause is superseded (⚠ marker inline there). Depends on ADR-005/006. Live-tuned numbers live in `src/modules/run/rules.model.ts`; this ADR records the decision and rationale, not the values. **Decision 2's ratio amended by [ADR-034](034-the-gate-is-a-ci-run.md)** (2026-08-15): the lockstep stands, `WRONG_COVERAGE_LOSS` halves to 0.25.

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

A miss bleeds `WRONG_COVERAGE_LOSS × rewardMultiplier × gateBaseMultiplier`. Reward and risk now grow in lockstep: a miss at gate 5 costs ×5 the base loss, exactly as a hit there pays ×5. This **reverses ADR-006 Decision 11's flat-loss rule**.

### 3. The 0-floor resolves the death-spiral concern

ADR-006 rejected loss-scaling as a death spiral. That concern is answered by the pre-existing floor: coverage per category (and therefore the total) is clamped at 0 (`Math.max(0, …)` in `answer()`). A growing penalty can drain what you have faster, but it can never push you negative or compound below zero — there is no runaway. The symmetry (gain and loss scale identically) is the point: risk stays proportional to reward at every depth, so a greedy deep-gate answer is a real gamble, not a formality.

Config effects still amplify **gains only** (ADR-006 §11 clause 2 stands) — the gate factor is a raw-rules multiplier, not a config effect, and applies to the loss precisely because it is not a config.

## Consequences

- **Positive**: the climb now has a rising-stakes curve on both axes; late gates feel richer and misses stay meaningful. One shared `gateMultiplier` binding expresses "deeper = higher stakes" in exactly one place.
- **Negative / to watch**: linear (`gate + 1`) scaling is a guess. At the summit, gains and losses are ×5 — swingy by design, but if playtests show late gates feel binary (one miss erases a gate's worth of coverage), a sub-linear loss curve (e.g. `1 + gatesCleared/2`) is the first knob to try. The value lives in `rules.model.ts`; changing the *shape* would be a follow-up ADR.
- The base-gain scaling (Decision 1) is **new**, not a reversal — ADR-006 §3 escalated the *requirement*, never the *reward base*. It is recorded here rather than amended into §3 because it belongs with the loss-scaling decision it is symmetric with.
