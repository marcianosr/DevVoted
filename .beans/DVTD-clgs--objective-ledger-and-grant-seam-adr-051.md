---
# DVTD-clgs
title: Objective ledger and grant seam (ADR-051)
status: todo
type: feature
created_at: 2026-09-03T07:09:43Z
updated_at: 2026-09-03T07:09:43Z
parent: DVTD-z2r2
---

Implements ADR-051's tracking backbone: per-account objective counters and the config grant flow. Ships alone safely; unlocks accrue invisibly until the Dex UI lands.

Design: docs/adr/051-configs-unlock-on-individual-objectives.md. Architecture notes: DVTD-2try (2026-09-03 section).

## Todos

- [ ] `configUnlock.model.ts` (run/config/domain): closed metric union (incl. `category-correct:{code}` template literal), `ThematicObjective`, `ConfigUnlock` (free | earned), `CONFIG_UNLOCKS` keyed by `config.id`, helpers `FREE_CONFIG_IDS` / `isUnlockSatisfied` / `configsUnlockedBy` / `isOneShotMetric`; spec enforces exhaustiveness vs `CONFIG_LIST`, a focus config in the free set, targets > 0
- [ ] `soldThisShop` on RunState: increment in `sell()` (shopAction.model.ts), reset wherever `rebuildsUsed` resets (finishReward, gate clear in answer.model.ts, strip.model.ts); flows through RunSnapshot automatically
- [ ] `objectiveProgress.model.ts` (run/run/domain): pure `objectiveIncrementsFor(state, next, action)`; one spec per predicate plus negatives (no-op action, gate-fail close, mirror grading, sell crossing 2 to 3 exactly once)
- [ ] schema.ts + guarded migration: `users.unlocked_config_ids text[] default '{}'`, `user_objective_progress (user_id, metric, count, updated_at, PK(user_id, metric))`; seed the free nine for existing rows; no historical backfill (ADR-051)
- [ ] `insertUser` (account/auth) seeds `unlocked_config_ids` with the free nine
- [ ] `applyActionToRun`: batched `INSERT ... ON CONFLICT DO UPDATE SET count = count + excluded.count RETURNING` for touched metrics, then `configsUnlockedBy` on the fresh counts feeding `awardConfigUnlock` (clone of `awardGateSwatch`'s idempotence guard)
- [ ] `drizzleMock.factory.ts`: add `onConflictDoUpdate` to CHAIN_METHODS; repository specs (answer queues the right rows, crossing a target appends the id, no-op writes nothing)
