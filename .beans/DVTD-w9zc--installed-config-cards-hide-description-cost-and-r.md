---
# DVTD-w9zc
title: Installed config cards hide description, cost and refund
status: completed
type: bug
priority: normal
created_at: 2026-08-18T14:06:32Z
updated_at: 2026-08-18T14:10:07Z
---

The shop's "Installed configs" row renders `ConfigCard` at `size="small"`, and the
small branch of `src/ui/economy/ConfigCard.ui.tsx` returns early with only the name
and rarity. `ConfigCard.component.tsx` already passes `costLabel`, `refundLabel` and
`description`, so they are silently dropped. A player cannot see what an installed
config does, what it cost, or what it refunds without deinstalling it.

`size="small"` is shared with `PollActiveConfigStrip.ui.tsx`, `PollOptionRow.ui.tsx`
and `PipelineFailureScreen.ui.tsx`, so the small variant must not grow
unconditionally. Adding an opt-in `showDetails` prop instead.

## Todo
- [x] Spec for the small variant with and without details
- [x] `showDetails` prop on `ConfigCard.ui.tsx`, small branch renders cost/refund/description
- [x] Thread through `ConfigCard.component.tsx` and `ActiveCard.component.tsx`
- [x] Enable on the Installed configs row in `ShopContainer.component.tsx`
- [x] Story for the new variant
- [x] lint, typecheck, tests

## Summary of Changes

`src/ui/economy/ConfigCard.ui.tsx` gains an opt-in `showDetails` prop. The small branch now renders a single storage line (`Cost: X · Refund: Y`) and the description under a divider, and widens to `w-56` only when details are shown, so `PollActiveConfigStrip`, `PollOptionRow` and `PipelineFailureScreen` keep the bare compact card.

`ConfigCard.component.tsx` and `ActiveCard.component.tsx` thread the prop through; `ShopContainer.component.tsx` sets it on the Installed configs row only.

New `src/ui/economy/ConfigCard.spec.tsx` pins all four cases, including the negative one (bare small renders no cost/refund/description). Added a `SmallWithDetails` story.

Branch `fix/installed-config-details` off main, in the `../devvoted-tanstack-config-details` worktree.

### Left out

- The Next package offers row still uses the bare small card. Out of scope; it has no Deinstall button, so cost is arguably more useful there than on installed configs.
- Refund now appears twice on an installed card: in the storage line and in the `Deinstall (+X)` button (`REFUND_RATE = 0.5`). Kept because it was explicitly requested.
