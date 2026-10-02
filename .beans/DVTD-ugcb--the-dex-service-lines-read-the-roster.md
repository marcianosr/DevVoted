---
# DVTD-ugcb
title: The Dex service lines read the roster
status: completed
type: task
priority: low
created_at: 2026-09-25T19:45:54Z
updated_at: 2026-09-30T16:54:13Z
blocked_by:
    - DVTD-khhw
---

**What:** The Dex's service lines and standing prices read the service roster instead of their own tables.

**Why:** The Dex keeps two records keyed by service id beside the roster, so a ninth service or a price change is written twice and only one of the two fails to compile when missed.

## Done when
- [x] The Dex derives each service's line and standing price from the roster and the price rules
- [x] A service without a Dex line fails to compile (this already held: the tables are Record<RegistryControlId, string>)

## Notes
Follow-up to the shop-and-poll slice of the deepening pass. The shop states this run's prices from `ShopControls`; the Dex states standing prices across runs, which is why the two were not folded together there. `dexScreen.viewmodel.ts` `SERVICE_LINES` and `CONTROL_PRICES`.

## Summary of Changes (2026-09-30)

Two things, one of them the real bug. **Grading:** the Dex graded answers with its own counts-based `evaluatePollAnswer` and its query never read the `mirrored` flag, so a mirrored answer was graded against the unflipped key while the run and the board flip it. `polldex.repository.ts` now returns each response's key (option ids, correctness, answer type, mirrored) and `polldex.service.ts` grades with the run's `answerOutcome` / `mirrorGrading`; `pollAnswer.model.ts` and its spec are deleted, CONTEXT.md's Poll row points at the one rule, and the service spec has a mirrored case. **Lines:** the where-half of each Dex service line is derived from the roster (`soldIn`, `opensAfterGates`, `closesAfterGates`) instead of restated; only the duration copy stays as a table. That surfaced a drift: the old text said Extend was sold "from Cascade" (its unlock gate) while the roster sells it after gate 3, Thunder, which the availability line already stated. The Dex no longer imports the shop viewmodel: the carry label lives in shared copy as `NEW_RUN_PRICE`. The compile-time guarantee the bean asked for already held, since both price tables are `Record<RegistryControlId, string>`. Not touched: the profile importing the Dex's runs-tab internals (candidate 7 territory).
