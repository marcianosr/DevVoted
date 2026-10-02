---
# DVTD-y1hw
title: The perfect bonus is stated everywhere and routed nowhere
status: completed
type: bug
priority: normal
created_at: 2026-09-14T15:47:16Z
updated_at: 2026-10-01T17:43:36Z
parent: DVTD-lk20
---

ADR-075 pays a full bar 1.5x. Nothing implements it.

- `gateClearPayout` (build.model.ts) has no `PERFECT_BONUS` term
- `PERFECT_BONUS` and `perfectBonusFor` have no production caller
- `gatePayoutKb` has no production caller
- `gateOutcomeFrameOf` hardcodes `bonusKb: 0`, and `bonusPanelOf` renders only when `bonusKb > 0`, so the panel is unreachable

The dead panel's copy is also false: "Perfect does not carry: the next gate still starts at zero." The next gate does not start at zero, it re-reads the banked units against a bigger denominator.

ADR-075 admits it is "Stated, not routed". Found while fixing DVTD-65yi.

## Todo

- [x] Decide whether the perfect bonus ships or the ADR is deleted
- [x] If it ships: route it through `gateClearPayout` and feed `bonusKb`
- [x] Fix or delete `bonusPanelOf`'s copy

## Playtest evidence (2026-10-01)

Pallet closed PERFECT at 4 of 5 right with streak 1 and paid +28 KB for the clear (32 × 4/5 × 1.1); no ×1.5. The reducer pays gateClearPayout (build.model.ts:127); gatePayoutKb, the only formula with perfectBonusFor, has no production caller. gateOutcome.viewmodel.ts:867 still tells the player a full bar multiplies the payout by ×1.5.

## Summary of Changes

Marciano chose to ship the bonus (2026-10-01). The close pays `perfectBonusOnClear` (build.model): half the clear again on a PERFECT band, leaving out flat on-clear config KB. It is recorded as `perfectBonusThisGateKb`, summed into `gateRewardKb` and fed to the gate result as `bonusKb`, so the bonus row and panel render. Prep's PERFECT row quotes it. `bonusPanelOf` now says the head start carries instead of the next gate starting at zero. `gatePayoutKb` stays dead in production (only the gate outcome test factory uses it); ADR-075 says so.
