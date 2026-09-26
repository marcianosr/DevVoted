---
# DVTD-wccy
title: Loot a fallen player's run for storage
status: in-progress
type: feature
priority: high
created_at: 2026-06-01T15:06:17Z
updated_at: 2026-07-03T14:15:11Z
---

When a player dies, one active-run player can loot their corpse for storage. Amount scales with the gate they reached: min(gate * 20, 100) KB. First click wins (DB-transaction race-safe). Looted state is visible to everyone via the death-mark UI + modal.

## Plan

### Schema
- [x] Add to runsTable: `looted_by_user_id` (uuid → users, nullable), `looted_at` (timestamp, nullable), `loot_amount` (integer bytes, nullable)
- [x] Run `npm run db:generate` to produce migration → `drizzle/0055_fat_barracuda.sql` (apply with `npm run db:migrate` locally)

### Domain logic
- [ ] `src/domains/runs/services/lootCalculator.service.ts` — `calculateLootAmount(gateReached: number): number` returning bytes — USER WRITES THIS (formula already agreed)
- [x] Eligibility check inlined in `lootRun` query (single-source-of-truth in DB transaction; no separate predicate file needed)

### API
- [x] `run.queries.ts` — `lootRun(runId, looterUserId, looterRunId)` in a transaction: SELECT FOR UPDATE on target, assert unlooted, compute amount, update target + bump looter's storage_limit
- [x] `runs.ts` — `lootFallenRunFn` server function: auth, validate looter has active run, validate target is fallen + unlooted + not own
- [x] Extend `FallenRunPlayer` with `runId` + `lootedBy: User | null` + `lootedAt` + `lootAmount`
- [x] Update `getCommunityStatsForDailyPoll` to join looter user via alias

### Model
- [x] Add `lootedByUserId`, `lootedAt`, `lootAmount` to `Run` type + DTO + mocks

### UI
- [x] `useLootFallenRun` mutation hook (invalidate community stats + router invalidate for active run)
- [x] `FallenPlayerModal` — show `Loot` button when eligible; on success show `Looted by X · +N KB`; otherwise show same if already looted
- [x] `FallenAvatar` — when looted, overlay looter's avatar (`UserAvatar size=xs`) instead of 💀

### Verify
- [x] `npx tsc --noEmit` clean
- [x] `npm run lint` clean (only the pre-existing `economy/api/handlers.ts` duplicate-import warning remains)

## Outstanding

- `calculateLootAmount` in `src/domains/runs/services/lootCalculator.service.ts` is a TODO stub — user must write the formula body (return 0 placeholder until then, so the feature ships dead until that line is filled in).
- DB migration `drizzle/0055_fat_barracuda.sql` needs to be applied locally with `npm run db:migrate`.
- `renderDeathReason` placeholder from [[click-death-mark-to-see-why-a-player-died]] is still open (DVTD-y1ec).

## Iteration 2

- Implemented `calculateLootAmount` with the agreed formula (`min(gate * 20, 100) KB`, returns bytes) — was a stub returning 0
- `GatesMinimap` now tracks selection by `runId` instead of holding a snapshot, so modal re-projects from the latest `fallenPlayers` after the post-loot refetch lands → "looted" state appears in-place without close/reopen
- `Loot` button now shows the preview amount: `Loot +X KB` using `formatStorage(calculateLootAmount(player.currentGate))`
