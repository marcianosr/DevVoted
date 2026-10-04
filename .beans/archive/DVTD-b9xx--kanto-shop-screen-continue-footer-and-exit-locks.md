---
# DVTD-b9xx
title: 'Kanto shop screen: Continue footer and exit locks'
status: completed
type: feature
priority: normal
created_at: 2026-09-10T16:01:06Z
updated_at: 2026-09-14T17:08:29Z
---

The kanto ShopScreen has no way out: terminal-theme's shop carries a Continue control with exit locks ('Over capacity by 2 slots', 'Storage plan bills 224 KB a gate, you hold 96 KB') and the kanto kit has no design for it yet. Deliberately excluded from DVTD-8mmv (Marciano: no new designs in that pass).

- [ ] Design the Continue affordance (mock first)
- [ ] Exit lock states: over capacity, plan bill outruns balance
- [ ] Compose into ShopScreen + stories + specs

## Model change 2026-09-12 (DVTD-nd6r)

The two exit locks collapse into one, and it is not either of the ones above.

- "Over capacity by 2 slots" is gone. ADR-074 makes capacity soft, so a build
  cannot be over anything (ADR-044 decision 4's over-capacity state retires with
  `isOverCapacity`).
- "Storage plan bills 224 KB a gate, you hold 96 KB" changes subject. The plan
  no longer rents a KB cap; the recurring bill is the build's own weight upkeep.

So the lock is: this build costs more per gate than you hold, and the remedy is
to drop weight or buy a plan rung that makes it cheaper. Same shape, one lock,
and the label has to name which of the two remedies applies.

## Summary of Changes

Done as part of **DVTD-uhub** / ADR-082.

The Continue footer already existed on the kanto ShopScreen; what this bean wanted
was the exit lock, and the 2026-09-12 model change had declared it dead. ADR-082
brought it back in a third form, different again from both entries above:

- Not "over capacity by 2 slots" — the game no longer sells slots.
- Not "the plan bills more than you hold" — there is no plan.
- It is: **the build outweighs the build space it holds**, which can only happen
  because the player stepped down the ladder to save KB. So the lock is always
  self-inflicted and always has two remedies, which the label names:
  `2 weight over the 8 mark · drop it, or take more room`.

The mechanism needed no new code. `view.overflowSlots` already disabled the footer
action and printed a refusal; `Build.slots` changing meaning re-aimed it for free.
Only the copy changed. Covered by ShopView.spec.
