---
# DVTD-7
title: Fix deflate config
status: todo
type: bug
priority: critical
created_at: 2026-04-27T12:06:24Z
updated_at: 2026-05-27T08:36:30Z
---

## Diagnosis (2026-05-27)

### Root cause: cost asymmetry between "what you pay" and "what you owe"

The `reductionCost` effect is a **display + affordability layer only**. Storage accounting still reads the catalog price, so the two views of "cost" never reconcile.

**What the discount touches:**
- Shop UI shows discounted prices (`withDiscount` in `src/domains/economy/services/discount.service.ts`)
- `canAddConfigToRun` (`src/domains/economy/services/configManager.service.ts:77-90`) checks affordability at `Math.floor(config.cost * (1 - costReduction))`
- `addConfigToRunHandler` (`src/domains/economy/api/handlers.ts:28-58`) resolves the discount via `getReductionCost` before validation

**What the discount does NOT touch:**
- `addConfigToRunQuery` (`src/domains/economy/api/queries.ts:26-54`) persists only `active_config_ids` — no paid cost recorded
- `calculateStorageUsed` (`src/domains/economy/services/configManager.service.ts:22-24`) sums catalog `config.cost`
- `removeConfigFromRunHandler` (`src/domains/economy/api/handlers.ts:60-81`) computes deinstall penalty from catalog `cost`

### Concrete consequence

Player with Deflate active near capacity:
1. Shop shows `.html-config` at 230KB (catalog 256KB).
2. `canAddConfigToRun` approves at 230KB.
3. `addConfigToRunQuery` persists the ID.
4. `getStorageInfo` recomputes from catalog → adds full 256KB.
5. Player ends up with `storageUsed > effectiveStorageLimit` — over-budget state that should be unreachable.
6. Deinstall refunds 50% of 256KB even though they paid ~230KB → **buy+sell cycle is a net storage gain. Exploitable.**

### History

- `8347192` (2025-10-25) feat: deflate config
- `a7cc137` (2026-01-10) fix: deflate config — first attempt
- `32264eb` (2026-01-12) fix: deflate config synergy — replaced brittle `applyEffects({ poll: null as never, ... })` in handler with direct `getReductionCost` lookup. Only fixed the handler crash, not the storage asymmetry.
- `5bb3e1f` (2026-01-12) refactor: throw error if effect is not working — added `runEffect` try/catch wrapper at `src/domains/economy/data/configs.ts:982-989`. Didn't cause the bug but made the fragility more visible.
- `09e0d84` (2026-01-13) chore: disable deflate for now — gave up. Commit message has no detail, hence "TODO: still broken" in `src/domains/economy/data/configs.ts:199`.

### Fix approaches (parked)

**Option A — Persist paid cost** (recommended): schema change so each active config carries the price actually paid. `calculateStorageUsed` sums paid cost; deinstall refund uses paid cost. One source of truth, scales to future discount effects.

**Option B — Deferred rebate**: keep catalog cost canonical, credit the discount delta as a per-run storage rebate at purchase. No schema change, but introduces a parallel ledger every cost-touching path must consult. Doesn't scale well to additional discount-style effects.

### Files affected by any fix

- `src/domains/economy/data/configs.ts:199-210` — uncomment the entry
- `src/domains/economy/services/configManager.service.ts:22-24,77-90` — storage usage + affordability
- `src/domains/economy/api/handlers.ts:60-81` — deinstall penalty
- `src/domains/economy/api/queries.ts:26-54` — possibly persist paid cost (Option A)
- `src/database/schema.ts` — schema change (Option A only)
- `src/domains/economy/data/configs.spec.ts` — re-enable `.skip`'d tests at lines 80, 549, 569, 594, 1237, 1263; add regression test asserting `getStorageInfo(run).storageUsed` matches what `canAddConfigToRun` checked against; add buy+sell exploit test asserting net storage change is zero.

### Out of scope

The five `applyEffects({ poll: {} as any })` stub call sites (`src/domains/economy/api/shopOfferings.ts:33,69,103`, `src/domains/runs/api/reroll.ts:41`, `src/domains/economy/services/configManager.service.ts:38`) are ugly but currently harmless. Worth a follow-up bean — not blocking Deflate.
