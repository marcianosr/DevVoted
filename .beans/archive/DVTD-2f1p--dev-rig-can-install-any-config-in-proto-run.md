---
# DVTD-2f1p
title: Dev rig can install any config in proto-run
status: completed
type: task
priority: normal
created_at: 2026-09-15T11:25:01Z
updated_at: 2026-09-15T11:25:15Z
---

proto-run only ever sees 5 of 8 STARTER_POOL configs plus random shop offers, so most of the 36-config roster is unreachable by play. Add a dev-only picker to the Dev rig that toggles any config into the build.

## Summary of Changes

`src/routes/proto-run.tsx` only.

- The Dev rig now renders in **every** run status (it was gated to `answering`/`rewarding`), so the picker is reachable on the build, prep, shop, gate-outcome and game-over screens. The answer buttons keep their `!settled && answering` gate.
- New second row: one toggle chip per entry in `CONFIG_LIST` (36), viridian when held, `title` carrying its slot cost and description. Clicking toggles it in and out of the build.
- `toggleDevConfig` writes `state` directly rather than dispatching `install`/`uninstall`, because those only fire while `status === "configuring"` and both refuse a config that is not in `available` or does not fit `hasRoomFor`. It also appends the config to `available` so `StartView` keeps showing it as a held hand card.
- Build space follows via `smallestRungHolding`: the smallest `BUILD_SPACE_RUNGS` weight that holds the new occupancy, falling back to the top rung (32). Over five 8-slot configs the fallback lands you in the real over-capacity state, which is handled.

### The trade-off in `smallestRungHolding`

Widening to a real rung keeps the run ladder-consistent, but the rung is also the upkeep bill (`upkeepForSpace`), so parking on rung 6 bills 512 KB at the next clear. The 💾 +256 KB button covers it. Two alternatives if that friction bites:

- leave `slots` alone and sit over capacity (no upkeep jump, but the shop door locks per ADR-082)
- set `slots` to exactly the occupied count, off-ladder — `spaceRungFor` rounds **down** to the highest rung at or below it, so 9 slots bills rung 2 (32 KB)

## Verification

- `npm run build` passes (typecheck included)
- `npm run lint` clean, depcruise 0 violations across 989 modules
- `npm test`: 4373 passed, 2 failed. Both failures are `gate.model.spec.ts > the floor rule`, pre-existing on this branch and untouched by this change.
