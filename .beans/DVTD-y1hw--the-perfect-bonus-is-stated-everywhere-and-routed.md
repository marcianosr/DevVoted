---
# DVTD-y1hw
title: The perfect bonus is stated everywhere and routed nowhere
status: todo
type: bug
priority: normal
created_at: 2026-09-14T15:47:16Z
updated_at: 2026-09-14T15:47:16Z
---

ADR-075 pays a full bar 1.5x. Nothing implements it.

- `gateClearPayout` (build.model.ts) has no `PERFECT_BONUS` term
- `PERFECT_BONUS` and `perfectBonusFor` have no production caller
- `gatePayoutKb` has no production caller
- `gateOutcomeFrameOf` hardcodes `bonusKb: 0`, and `bonusPanelOf` renders only when `bonusKb > 0`, so the panel is unreachable

The dead panel's copy is also false: "Perfect does not carry: the next gate still starts at zero." The next gate does not start at zero, it re-reads the banked units against a bigger denominator.

ADR-075 admits it is "Stated, not routed". Found while fixing DVTD-65yi.

## Todo

- [ ] Decide whether the perfect bonus ships or the ADR is deleted
- [ ] If it ships: route it through `gateClearPayout` and feed `bonusKb`
- [ ] Fix or delete `bonusPanelOf`'s copy
