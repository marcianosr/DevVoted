---
# DVTD-clgs
title: Objective ledger and grant seam (ADR-051)
status: completed
type: feature
priority: normal
created_at: 2026-09-03T07:09:43Z
updated_at: 2026-09-06T11:54:44Z
parent: DVTD-z2r2
---

Implements ADR-051's tracking backbone: per-account objective counters and the config grant flow. Ships alone safely; unlocks accrue invisibly until the Dex UI lands.

Design: docs/adr/051-configs-unlock-on-individual-objectives.md. Architecture notes: DVTD-2try (2026-09-03 section).

## Todos

- [x] `configUnlock.model.ts` (run/config/domain): closed metric union (incl. `category-correct:{code}` template literal), `ThematicObjective`, `ConfigUnlock` (free | earned), `CONFIG_UNLOCKS` keyed by `config.id`, helpers `FREE_CONFIG_IDS` / `isUnlockSatisfied` / `configsUnlockedBy` / `isOneShotMetric`; spec enforces exhaustiveness vs `CONFIG_LIST`, a focus config in the free set, targets > 0
- [x] `soldThisShop` on RunState: increment in `sell()` (shopAction.model.ts), reset wherever `rebuildsUsed` resets (finishReward, gate clear in answer.model.ts, strip.model.ts); flows through RunSnapshot automatically
- [x] `objectiveProgress.model.ts` (run/run/domain): pure `objectiveIncrementsFor(state, next, action)`; one spec per predicate plus negatives (no-op action, gate-fail close, mirror grading, sell crossing 2 to 3 exactly once)
- [x] schema.ts + guarded migration: `user_config_unlocks (user_id, config_id, via_metric, unlocked_at, first_installed_at, PK(user_id, config_id))` per ADR-064 (replaces the text[] column first planned here), plus `user_objective_progress (user_id, metric, count, updated_at, PK(user_id, metric))`; seed the free eight for existing rows with `via_metric` null; no historical backfill (ADR-051)
- [x] `insertUser` (account/auth) seeds `user_config_unlocks` with the free eight, `via_metric` null
- [x] `applyActionToRun`: batched `INSERT ... ON CONFLICT DO UPDATE SET count = count + excluded.count RETURNING` for touched metrics, then `configsUnlockedBy` on the fresh counts feeding `awardConfigUnlock` (clone of `awardGateSwatch`'s idempotence guard), which writes `via_metric` (ADR-064)
- [x] `drizzleMock.factory.ts`: add `onConflictDoUpdate` to CHAIN_METHODS; repository specs (answer queues the right rows, crossing a target appends the id, no-op writes nothing)

## 2026-09-06 amendment (DVTD-0sjo)

ADR-051 gained six rows and ADR-064 the ledger shape:

- Metric union adds `offers-locked`, `exact-estimates`, `arms-switched`, `cache-hits`, `gates-reordered`; `CONFIG_UNLOCKS` covers 27 earned rows (added: yarn-lock, planning-poker, ab-test, garbage-collection, cache, git-rebase)
- `gates-reordered` counts once per committed gate order, never per drag; `cache-hits` counts when a cached hit pays (the engine already computes `cachedHitsFor`)
- The unplayed-seat guarantee reads earned rows only (`via_metric` not null)

## Summary of Changes

Shipped 2026-09-06 alongside DVTD-g6k0/DVTD-of79.

- `configUnlock.model.ts`: closed metric union, `CONFIG_UNLOCKS` (8 free + 27 earned per ADR-051 decision 3 incl. the 2026-09-06 rows), helpers. Each `ThematicObjective` carries authored `caption` (imperative) AND `earned` (past tense) — provenance copy is authored, not verb-transformed. Tie-break: both paths crossing in one dispatch grants via the thematic metric.
- `soldThisShop` + `rebasedThisGate` on RunState. gates-reordered counts on the answer that consumes the rebase flag (once per committed order, never per drag). NOTE: rebase reorders still do not survive the transaction (state.polls is dropped by the snapshot) — flagged as its own bug bean; the counter rides the flag, which does persist.
- `objectiveProgress.model.ts`: pure `objectiveIncrementsFor(state, next, action)`, 31 specs. cache-hits requires a LIVE `cacheHitStep` config (the engine's own pays-gate).
- Schema + guarded migration `20260906120000_add_config_unlocks.sql`: `user_config_unlocks` (via_metric provenance, ADR-064) + `user_objective_progress`, free-eight seed for existing users.
- Grant seam in `applyActionToRun`: batched upsert RETURNING → `configsUnlockedBy` → insert ON CONFLICT DO NOTHING RETURNING; returns `RunDispatchResult { state, unlockedConfigIds }`, placed right after the no-op check.
- `RunView.unlockedConfigIds` (just-fired) + `RunView.unlockedThisRun` (run-scoped history via `fetchUnlocksSince(userId, run.started_at)` in configUnlock.repository.ts), folded in by the dispatch and todays-run services.
- `insertUser` transactional, seeds the free eight (via_metric null). New user.repository.spec.ts.
- drizzleMock gains `onConflictDoUpdate`.
