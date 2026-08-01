---
# DVTD-5cwm
title: 'Remove fixed Unit Tests: 3 empty slots, full pipeline required to start'
status: completed
type: feature
priority: normal
created_at: 2026-07-31T15:23:57Z
updated_at: 2026-07-31T15:38:56Z
---

Marciano's call (2026-07-31): the "fixed" config mechanic dies. No auto-installed locked Unit Tests; the player starts with 3 empty slots and must fill all 3 before committing to a run. Unit Tests becomes an ordinary pick in the starting hand. The gate's baseline Correct demand stays engine-synthesized (bare pipelines still fail), so nothing needs to be locked.

## Todos (all done)

- [ ] Engine: drop Config.fixed / isFixed / freeConfigs; start refuses until every slot is filled
- [ ] createRun loses the fixed param; starting hand includes Unit Tests
- [ ] UI: ConfiguringScreen start gating + copy; ShopScreen/StripScreen fixed handling removed
- [ ] Specs reconciled (incl. Marciano's in-progress edits to run.model.spec / runSnapshot.model.spec)
- [ ] Wiki (locked/🔒 mentions), CHANGELOG

## Summary of Changes

- `Config.fixed`, `isFixed`, `freeConfigs` deleted; `isBare` = zero configs. Draft pool no longer excludes anything but owned configs (Unit Tests is draftable).
- `createRun(polls, handed)` — no fixed param; pipeline starts empty. New `start()` guard: refuses until `configs.length >= slots`.
- Reducer guards (unslot/sell/drop/strip) lost their fixed checks.
- UI: RunConfigure start button gated on a full pipeline with a slots-left hint; 🔒 badge/tooltip removed from ConfigChip (incl. dead `noFixedBadge` prop chain and a `readonly any[]` prop on GateRewardReport); ShopScreen sells anything; StripScreen offers every config.
- In-flight runs: roster-refresh-on-hydrate strips the embedded fixed flag automatically — old runs keep Unit Tests installed as a now-ordinary config.
- Wiki §2.2/§3.2/§4.1/§4.3 updated (baseline demand is the gate's own; nothing locked; 3 slots must be filled); CHANGELOG entry.
- Verified: 974 tests / 106 files green, oxlint + dep-cruiser clean, tsc build clean.

Not committed — diff awaiting review alongside DVTD-77ke.
