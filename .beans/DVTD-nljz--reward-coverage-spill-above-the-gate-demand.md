---
# DVTD-nljz
title: Reward coverage spill above the gate demand
status: draft
type: feature
priority: high
created_at: 2026-08-24T12:58:24Z
updated_at: 2026-08-24T12:58:24Z
parent: DVTD-kulw
---

Coverage earned above the gate's demand ("spill") currently changes nothing about
the gate or its payout. Consider what else it should be worth.

## What spill does today

- **The gate is binary.** `gatePassed` (`gate/domain/gate.model.ts`) is
  `window.coverageGained >= gateDemandFor(...)`. Clearing by 1% and clearing by 40%
  are the same event.
- **The payout ignores coverage entirely.** `finishReward` prices the clear off
  `gateClearPayout(configs, window.correct, gatesCleared)` plus interest plus extra
  picks. Correct answers pay; coverage does not.
- **The window resets.** Spill does not carry into the next gate (ADR-035's per-gate
  reset, a deliberate choice).

But it is not worthless, and this is the part to design around rather than over:

- **It scores.** `state.coverage` accumulates run-wide and never resets, and it is the
  headline "Coverage score" on the run summary. Spill raises the number players compare.
- **It buys permission.** `coverageByCategory` is the Focus upgrade gate:
  `have < upgradeCoverageRequired(level)` (level × 5). Overshooting in a category is
  literally how you earn the right to upgrade that category's config.

So spill already has two consumers. The open question is whether it should get a third,
and whether the two it has are legible enough to feel like a reward at all.

## The wall any answer runs into

`run.model.ts` states the rule in a comment at the upgrade gate: "Mastery is permission,
KB is the price, one never stands in for the other." The same split is the standing
design line: coverage is score, storage is reward. Paying storage for spill converts
score into currency and collapses that wall. That may be the right call, but it is a
reversal to make on purpose, in an ADR, not a tuning tweak.

## Options

- **A. Make the existing two visible.** Nothing on screen says the overshoot did
  anything. A "cleared by +18%" line on the reward screen and category coverage shown
  against the next upgrade threshold may be the whole fix: the reward exists, the
  feedback does not. Cheapest, and it tests whether the complaint is really "no reward"
  or "no acknowledgement".
- **B. Spill unlocks, never pays.** Extend the permission axis it already sits on:
  content-reveal rungs, upgrade headroom, badge or swatch tiers for a big overshoot.
  Stays on the right side of the wall.
- **C. Spill rolls over.** A fraction carries into the next gate's window, so a strong
  gate de-risks the next one. Directly reverses ADR-035's per-gate reset, and would need
  a cap or it snowballs into a run that cannot fail.
- **D. Spill pays storage.** Scale the clear payout by the overshoot ratio. The most
  direct read of the ask, and the one that needs the wall knocked down explicitly.
- **E. Spill is stakeable.** Wager it at the next gate for a bigger payout. A new axis;
  price it against the roster before adding it.

## Rules any answer has to respect

- A spill reward must not make clearing comfortably strictly better than clearing
  efficiently, or the shop stops mattering: if overshoot pays well, the optimal build is
  whatever maximises raw coverage, and every other config axis flattens.
- Deep gates demand more, so any ratio-based reward pays differently at gate 2 and gate
  10. State the curve, not just the rule.
- "Spill" is a new word. Storage already uses burn and overflow for its cap. Pick one
  before it reaches a screen.

## Todo

- [ ] Instrument or eyeball a few runs: how much spill does a typical clear actually leave?
- [ ] Do A first and see whether it settles the itch
- [ ] If not, pick B/C/D/E and write the ADR, naming the score-vs-reward reversal if there is one
- [ ] Settle the word
