---
# DVTD-oc69
title: Docker Image carries one config from your last build as an offer
status: todo
type: feature
priority: normal
created_at: 2026-09-25T11:00:13Z
updated_at: 2026-09-25T18:06:11Z
parent: DVTD-r2k9
---

**What:** A run service that guarantees one config from your last finished build appears as a normally priced offer in the first shop.

**Why:** A good build dies with its run and nothing lets you aim at it again.

## Done when

- [ ] The config is chosen from the previous finished run's build before the run starts
- [ ] It is offered at its draft price, never granted
- [ ] It is consumed by the first shop
- [ ] It cannot be bought with no finished run behind it

## Notes

- ADR-115 D7 and D9: an offer, not a grant, so ADR-050 D4 and ADR-051 D1 stand. ADR-029's rejection of account-level offer steering is overruled for run services only (ADR-115 D8).
- `rollDraft` (`draft.model.ts`) takes a guaranteed offer; the last finished run's build is read from run history (the Dex already reads it).
- Depends on the run-services purchase bean.

2026-09-25 (ADR-116): **unlock: Finish a run with one starting config still installed** — nothing records the opening hand today (no `startingConfigIds` on the run state or the runs table), so this needs the dealt hand stamped at run start and a one-shot metric ticked at run end when the build still holds one of them.

2026-09-25, later (DVTD-lm8p): roster row and counter built: `dockerImage`, archive-sold; the one-shot `finished-holding-a-dealt-config` ticks in `endMetrics` when the build still holds a config from `RunState.available`, which is the dealt hand and is never rewritten after `createRun`, so no field was added; caption `Keep a starting config to the end`. Earned reads *not for sale yet* until DVTD-0now sells it. Marciano's table reads "choose one installed config; guarantee it as a normally priced offer in the next run".
