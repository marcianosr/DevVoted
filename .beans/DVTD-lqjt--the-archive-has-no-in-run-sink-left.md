---
# DVTD-lqjt
title: The archive has no in-run sink left
status: todo
type: task
priority: normal
created_at: 2026-09-14T17:09:27Z
updated_at: 2026-09-14T17:09:27Z
---

ADR-049 is retired and `startSlot.model.ts` is deleted, so archived storage no longer buys anything inside a run. ADR-074 flagged this as open and ADR-082 did not answer it.

Today the archive only goes up: a run's leftovers credit into it on death or victory, and nothing spends it. That makes it a number with no decision attached.

Options, none chosen:
- A pre-run purchase that is not width (a starting-hand reroll, a guaranteed focus, an extra suggested pick).
- A run-start stipend, the way a git tag rescue already works.
- Nothing, and the archive becomes purely a progression score.

## Todo

- [ ] Decide whether the archive needs a sink at all
- [ ] If it does, design one that is not width (ADR-082 rents width by the gate)
