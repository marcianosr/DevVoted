---
# DVTD-nk0g
title: 'Reward screen: distinct state when the gate-slot cap holds the climb at the same gate'
status: completed
type: feature
priority: high
created_at: 2026-08-06T10:07:41Z
updated_at: 2026-08-06T10:24:23Z
---

Clearing a gate doesn't always advance it. run.model.ts's closeWindow has a
heldAtGate branch (gateNumber >= state.pipeline.slots, ADR-018): the gate is
passed and paid out, but gatesCleared freezes because the pipeline doesn't
have enough slots yet to represent the next gate. Today that's invisible —
GateRewardReport takes a binary `cleared` prop, so a held clear renders
byte-for-byte identical to a real advance ("Gate N cleared!"). The only
differing signal is a log string
(`Gate ${gateNumber} cleared! +${reward}KB — widen the pipeline to climb
past it.`) that nothing in the presentation layer ever renders — dead text.

## Game-design reason
A player who clears a gate and sees "cleared!" reasonably expects to be on
the next gate. When they're not, and nothing told them, the climb feels
stuck for reasons that read as a bug rather than a build decision ("add
more slots"). This needs a third, clearly distinct state: not cleared-and-
advancing, not failed — held.

## What's already there
- `state.gatesCleared` vs `state.clearedGate` already encode this precisely:
  in the normal case both equal the new gate number; in the held case
  `clearedGate` is one ahead of `gatesCleared`. `runView.viewmodel.ts`
  already exposes both (`gatesCleared`, `clearedGateNumber`).
- Nothing downstream (RunReward.component.tsx, RewardScreen.ui.tsx,
  GateRewardReport.ui.tsx) reads the relationship between the two.

## Todo
- [x] runView.viewmodel.ts: derive an explicit `heldAtGate: boolean` instead
      of leaving callers to infer it from two numbers (Tier 1 components
      take plain props, not raw state to interpret).
- [x] GateRewardReport.ui.tsx: a third visual state alongside cleared/failed
      — badge/copy that reads as "cleared, but still gate N" rather than
      reusing the "cleared!" title verbatim. Exact copy/visual TBD.
- [x] RewardScreen.ui.tsx / RunReward.component.tsx: thread `heldAtGate`
      through.
- [x] Story for the held state (only if it ends up as a visibly distinct
      Tier 1 treatment, per the Story rule in CLAUDE.md).
- [x] Wiki: note the held-at-gate state's player-facing signal once shipped
      (currently only documented as an internal mechanic via the
      `closeWindow` code comment).

## Summary of Changes

Shipped alongside the gate-slot coupling itself (DVTD-ein1).

- `runView.viewmodel.ts` exposes `heldAtGate: boolean` (clearedGate > gatesCleared), so Tier-1 takes a plain flag instead of comparing two numbers.
- `GateRewardReport` gained an optional `held` prop. The **PASS badge stays** - the gate genuinely passed and paid, so downgrading it to PART would misreport the gate result. The distinction is carried by the title (`Gate 3 cleared - still gate 3`) and a saffron line naming the cause and the fix: "Your pipeline is 3 slots wide, so gate 3 is as deep as it reaches - you'll run gate 3 again. Unlock slot 4 in the shop to climb past it."
- Wired through `RewardScreen` (`heldAtGate` prop) and `RunReward.component.tsx`. The dead log string is now redundant with on-screen copy.
- Tests: 3 viewmodel cases (held / legacy-snapshot fallback / advanced), 2 RewardScreen cases (held headline + explainer + winnings still shown; plain clear has neither). Story: `ClearedButHeld`.

Copy was chosen, not specified - the bean left it TBD. Adjust freely; it is one saffron `Paragraph` in `GateRewardReport.ui.tsx`.
