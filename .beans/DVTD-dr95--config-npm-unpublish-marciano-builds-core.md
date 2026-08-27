---
# DVTD-dr95
title: 'Config: npm unpublish (Marciano builds core)'
status: in-progress
type: feature
priority: normal
created_at: 2026-08-26T19:28:46Z
updated_at: 2026-08-26T19:51:02Z
parent: DVTD-72d9
---

Legendary thwart config: name a config you own; it is sold out in everyone's shop tomorrow (left-pad memorial). Claude scaffolds (roster entry, state field, spec skeletons, TODO-marked reducer action + draft-roll filter); Marciano implements the core logic as a learning exercise.

- [x] Scaffold: roster entry + RunState field + signatures + it.todo specs
- [ ] Core: unpublish reducer action (Marciano)
- [ ] Core: draft roll exclusion (Marciano)
- [ ] Decide: does the unpublish last one day or until run death; can it be re-published

## Scaffold pointers

- Core action: `unpublish` in src/modules/run/run/domain/shopAction.model.ts (guards for publisher + owned target are in; the TODO block lists the four decisions)
- Pool filter: `rollDraft` in src/modules/run/shop/domain/draft.model.ts (thread `state.unpublishedConfigIds` through `shopDraft` in run.model.ts)
- State: `unpublishedConfigIds` on RunState (initialized in createRun)
- Specs waiting: 3 it.todo in shopAction.model.spec.ts, 2 in draft.model.spec.ts
- Roster entry `npm-unpublish` ships already (legendary, 256KB) — drafting it currently does nothing until the core lands
