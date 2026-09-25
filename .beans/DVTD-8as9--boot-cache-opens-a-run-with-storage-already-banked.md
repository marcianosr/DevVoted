---
# DVTD-8as9
title: Boot Cache opens a run with storage already banked
status: todo
type: feature
priority: normal
created_at: 2026-09-25T11:00:12Z
updated_at: 2026-09-25T18:06:10Z
parent: DVTD-r2k9
---

**What:** A run service that starts the run with storage already banked.

**Why:** Every run opens at zero storage, so the archive has nothing to hand a returning player at the moment it matters.

## Done when

- [ ] The price in archive bytes and the grant in run storage are both dials
- [ ] The banked storage shows on the new-run screen and in the first shop
- [ ] It is consumed with the run

## Notes

- ADR-115 D7. A straight stipend: it knowingly overrules DVTD-8ty4's "never a straight upgrade" rule for this one row; that rule now covers granted packages only.
- Overlaps 8ty4's Startup package (+128 KB banked for 3 space). Reconcile there if packages are ever built.
- `createRun` sets `storage: 0`; ADR-036 D3's rescue stipend (`32 KB × gate`) is the precedent for opening with a balance.
- Depends on the run-services purchase bean.

2026-09-25 (ADR-116): **unlock: Bank at least 256 KB from one run** — no metric measures a single run's archive credit today; `finishSessionRun` computes `creditBytes` and adds it straight onto `users.archived_storage`, so this needs a one-shot metric ticked at run end when the credit reaches 256 KB (target-1 counter on the objective ledger, the `lean-gate-four` shape).

2026-09-25, later (DVTD-lm8p): roster row and counter built: `bootCache`, archive-sold, never in the shop; the one-shot `banked-256-one-run` ticks in `endMetrics` when `archiveCreditBytes(next)` reaches `BOOT_CACHE_BANK_KB` (256) on the action that ends the run; caption `Bank 256 KB in one run`. Earned reads *not for sale yet* in the Dex until DVTD-0now sells it. Marciano's table reads "pay storage now so the next run starts with a smaller amount, e.g. pay 128 KB to carry 64 KB": a 2:1 rate is the example for the two dials.
