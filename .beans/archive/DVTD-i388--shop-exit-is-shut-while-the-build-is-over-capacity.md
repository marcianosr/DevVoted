---
# DVTD-i388
title: Shop exit is shut while the build is over capacity
status: completed
type: bug
priority: normal
created_at: 2026-08-28T10:22:13Z
updated_at: 2026-08-28T10:30:04Z
---

The shop's Continue button stays live when the pipeline holds more spots than the plan rents (8 of 4 in playtest), so a player can walk into a gate with a build the gate cannot admit. Shut the door instead, keep the label, and put the reason on hover.

- [x] Tooltip can open above a trigger, so a footer button's hint is not off the page
- [x] Action places its hint by size: lg is always a footer button
- [x] Island ShopScreen keeps the Continue label and carries exitLock as the hint
- [x] ShopView shuts the exit on overflowSpots and names the fix
- [x] Specs and stories
- [x] CHANGELOG + wiki
- [x] lint, typecheck, tests

## Summary of Changes

The shop door is now shut while the pipeline sits over capacity, on both shop screens, with the reason on hover rather than in place of the label.

- `shopExitLock(overflowSpots)` in `shop/presentation/ShopScreen.ui.tsx` is the one sentence, written beside `offerRefusalText`. Over capacity is the only clause of `canStart` a shop can produce (the last config cannot be uninstalled, so a bare pipeline is unreachable from there), and shutting the door traps nobody: minifying is free and one minified config always fits the free four.
- `shopExitAction(gate, overflowSpots)` returns `{label, disabled, hint}`; the label still names the gate it opens onto (ADR-035 said nothing grades the exit, and that was about width demand, not about a state the gate cannot admit). `RunShop` passes `view.overflowSpots` and now ORs its own `busy` flag with the action disable instead of overwriting it.
- Island `ShopScreen.ui.tsx` keeps the `Continue` label and passes `exitLock` as the `Action` hint. `ShopView.component.tsx` wires it from `view.overflowSpots`.
- `Tooltip` gained `side` (below by default, above on request); `Action` picks placement off `size`, since `lg` is always a screen footer button and there is no page under a footer.
- 9 new tests, one new story (`ShopScreen/OverCapacity`). Wiki section 3 and the storage-plan CHANGELOG entry both state the rule.

Verified: lint clean, tsc clean, 2556 passed / 3 failed (the documented RewardScreen baseline, DVTD-9dn0).

### Left open

`GateStakeReceipt` still writes its own over-capacity sentence, with a bolded count and an em dash. Folding it into `shopExitLock` would mean touching a file this fix did not need.
