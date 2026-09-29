---
# DVTD-d92i
title: Deprecated fades by 0.25 and rots past x1
status: completed
type: feature
priority: normal
created_at: 2026-09-28T08:37:56Z
updated_at: 2026-09-28T08:43:00Z
---

**What:** Deprecated keeps fading past x1 and deletes itself at x0 instead, so its last gates cut coverage rather than paying it.

**Why:** Deleting at x1 made it a pure ramp-down with no decision in it. Running past the neutral point turns the tail into a liability the player has to notice and drop. The fade step stays 0.5, so the arc is six gates rather than twelve.

## Done when

- [x] The ladder runs 3 down to 0.5 over six gates and deletes at x0
- [x] The card warns that below x1 it cuts coverage rather than paying it
- [x] Every spec asserting the x1 threshold reflects the new arc
- [x] The wiki row and the changelog state the new behaviour

## Summary of Changes

The fade step was never changed — it stays at 0.5. Only the deletion threshold moved, from `<= 1` to `<= 0` in `decay.model.ts`.

- `decay.model.ts` — `isSpent` deletes at x0 rather than x1
- `configRoster.model.ts` — Deprecated states the rot phase; `costs` names it rather than the old x1 deletion
- `config.model.ts` — `describeConfig` reads the same warning off the live multiplier
- Specs updated in `decay.model.spec.ts` (two new rungs covered: alive at x1, alive at x0.5), `config.model.spec.ts`, `effect.model.spec.ts` (renamed: x1 is now a mid-fade rung, not the end), `answer.model.spec.ts` (four fixtures moved off 1.5)
- Wiki row regenerated via `npm run docs:sync`; changelog entry under Unreleased/Changed

No refund on decay-deletion, so the copy says Deleted, not uninstalls — uninstalling separately still pays back 64 KB, which is the escape hatch from the rot phase.

Verified: 4412 tests pass, tsc clean, oxlint + depcruise + docs:check clean.
