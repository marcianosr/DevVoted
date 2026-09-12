---
# DVTD-b9xx
title: 'Kanto shop screen: Continue footer and exit locks'
status: todo
type: feature
priority: normal
created_at: 2026-09-10T16:01:06Z
updated_at: 2026-09-12T12:57:02Z
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
