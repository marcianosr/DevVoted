---
# DVTD-dcpq
title: Archive-funded slots at the start of a run
status: completed
type: feature
priority: normal
created_at: 2026-08-31T08:56:56Z
updated_at: 2026-08-31T08:59:57Z
---

The start screen can buy slots from archived storage at double the shop's ladder price. No cap: the doubled ladder is the brake (12 slots at start costs 3.1 MB, more than a perfect gate-12 clear banks). A slot bought here can be handed back for exactly what it cost until Start is pressed, and the ladder rolls back with it.

## Todo
- [x] Domain: startSlot.model.ts
- [x] Viewmodel: startSlotDeals
- [x] StartScreen + StartView wiring, proto-run archive balance
- [x] ADR-049
- [x] CONTEXT.md, wiki, changelog
- [x] Story
- [x] lint, typecheck, tests

## Summary of Changes

`startSlot.model.ts` in `run/domain`: `START_SLOT_PREMIUM = 2` over `nextSlotPriceKb`, both presses gated on `status === "configuring"` (only `createRun` sets it, nothing restores it) so a 16 KB shop slot can never sell back for 32 KB of archive. `toRunView` took an optional second `archiveKb` argument and gained `startSlotDeals`; `StartView` owns the same arm-then-spend flag the shop uses.

The archive balance in `/proto-run` is local state seeded at 512 KB. **Not wired to `users.archived_storage`** — the real debit needs a server function over `debitArchive` in `src/domains/economy/api/archive.queries.ts`, which is a separate bean.

Note: `ConfiguringScreen.ui.tsx` still tells the player "the shop rents slots on top", which ADR-046 killed. Left alone, not touched by this work.
