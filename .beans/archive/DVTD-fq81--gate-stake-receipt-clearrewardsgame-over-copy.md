---
# DVTD-fq81
title: 'Gate stake receipt: clear/rewards/game-over copy'
status: completed
type: task
priority: normal
created_at: 2026-08-15T09:30:24Z
updated_at: 2026-08-15T13:34:12Z
---

Rewrite GateStakeReceipt into three sections (Clear the gate / Rewards / Game over) per Marciano's copy, and surface the config-floor death rule on the run-over summary.

- [x] Domain: configFloorForGate in rules.model.ts + spec
- [x] GateStakeReceipt: Clear the gate section (reach X%, current Y/X, miss = remove N + retry)
- [x] GateStakeReceipt: Rewards section as label/value rows (incl. unearned swatch chip)
- [x] GateStakeReceipt: Game over section (run ends below N configs)
- [x] RunSummary: state the config-floor reason on loss
- [x] Receipt on the reward screen (next gate) and strip screen (retry)
- [x] Update specs/stories, run lint + typecheck + tests
- [x] CHANGELOG

## Summary of Changes

- `configFloorForGate(gatesCleared)` added to rules.model.ts: `dropCount + 1`, the single count every death route reduces to. Spec locks it against `isStakeFatal` for every gate.
- GateStakeReceipt restructured into **Clear the gate** / **Rewards** / **Game over**, keeping the existing "To start" block. Coverage demand split into target line + graded progress line. Rewards became label/value rows and gained the gate's own swatch as an unearned (dashed) chip.
- New `lead` prop lets the receipt name its relationship to the screen showing it.
- RewardScreen takes `nextStake` (lead "Next up"), StripScreen takes `retryStake` (lead "Retry", config floor updates live as configs are peeled). Wired in proto-run.tsx, RunReward.component.tsx, RunStrip.component.tsx.
- RunSummary states the floor it broke against instead of "stripped bare".
- CHANGELOG's ADR-034 entry updated in place (the "To pass" line it described no longer exists).

## Follow-up: reward screen shows rewards only, not the whole receipt

The clear screen's next-gate preview no longer renders the full `GateStakeReceipt` (demand + game-over sections don't belong on a payout screen). Extracted `GateTitle` and `RewardsList` out of `GateStakeReceipt.ui.tsx` and added a new exported `GateStakeRewards` (title + Rewards list only) for `RewardScreen` to use. `GateStakeReceipt` itself is unchanged for Prep/Configuring/Shop/Strip.

Also fixed a pre-existing copy bug caught by this pass: the miss-cost sentence read "...configs and retry this gate" in the component while every spec expected "...configs, then retry this gate" — component copy was stale from an earlier edit. Fixed the copy, and converted the affected assertions (PrepScreen, ConfiguringScreen) to a `textContent` function matcher, since the sentence's coloured config-count span breaks plain-string `getByText` (RTL only concatenates direct text-node children, not nested elements).
