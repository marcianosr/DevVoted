---
# DVTD-nljz
title: Reward coverage spill above the gate demand
status: draft
type: feature
priority: high
created_at: 2026-08-24T12:58:24Z
updated_at: 2026-09-03T14:46:44Z
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

## Checked 2026-09-03: one of the two consumers is nearly vacuous

The bean credits spill with two consumers (the run score, and Focus upgrade permission). Checked both:

- **The Focus upgrade gate barely binds.** `upgradeCoverageRequired` is `level * 5`, but the per-answer earn scales with `gateBaseMultiplier` (`gatesCleared + 1`). A correct poll in a Focus category pays roughly 4% at gate 3 and 7% at gate 6, so every rung clears on one or two correct polls in that category and then never binds again. With 12 categories and 5 polls a gate, a category draws about 0.4 times per gate: what actually gates the upgrade is the draw, not the overshoot. It is a wait, not a decision.
- **The island shop does not implement it at all.** Only `modules/run/shop/presentation/ShopScreen.ui.tsx` and `ShopView.component.tsx` enforce or display it. `ui/terminal-theme/screens/ShopScreen.ui.tsx` and the modern-theme one never receive `coverageByCategory`, so on /proto-run the button is not disabled and `upgrade()` silently no-ops. On the screen being playtested, spill has exactly one consumer: the run score.

So option A ("make the existing two visible") is thinner than it looked. It would be dressing up one real consumer and one that resolves itself.

## Direction: option C, spill rolls over (Marciano, 2026-09-03)

A fraction of the overshoot carries into the next gate's window, so a strong gate de-risks the next one.

Why C over D: it keeps the score-versus-reward wall standing (no coverage-to-KB conversion), and it gives the config multiplier stack a reason to exist above the demand line. That is the actual hole. Today, stacking AGENTS.md x2 on Intellisense x1.5 only wins *earlier*, and earlier pays nothing, because `gateClearPayout` keys on `window.correct` and not on coverage.

Open before this can be built:

- The carry fraction and its cap. The bean's own snowball warning applies: an uncapped carry compounds into a run that cannot fail.
- Whether the ADR reverses ADR-035's per-gate reset, or frames the carry as a starting balance on a still-reset meter. The second is the smaller change and reads better.
- The word. "Spill" and "overflow" both collide with storage's cap vocabulary, and the standing line is to reuse an existing term rather than coin one.

## Todo (added 2026-09-03)

- [ ] Pick the carry fraction and cap; state the curve at gate 2 versus gate 10
- [ ] Write the ADR: starting balance versus reversing ADR-035's reset
- [ ] Decide whether the Focus coverage requirement survives at all; it is the weaker of spill's two consumers
- [ ] Separately: the island shop screens ignore the Focus requirement, so the rule is unenforced where it is played
