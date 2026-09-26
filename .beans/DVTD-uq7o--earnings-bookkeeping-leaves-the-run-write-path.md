---
# DVTD-uq7o
title: Earnings bookkeeping leaves the run write path
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:47Z
updated_at: 2026-09-25T19:45:47Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-n1pr
---

**What:** What an action earned the account is computed by a pure function and written by one adapter, and the run write path only locks, reduces, settles and writes.

**Why:** The file that saves a run also grants titles, unlocks, services, swatches and the watermark across five tables, and its spec asserts database call order by index so one added statement breaks twenty tests.

## Done when
- [ ] The grants an action earns are computed with no database and tested as state in, grants out
- [ ] The run write path's signature, return and errors are unchanged and its caller is untouched
- [ ] The dispatch spec asserts the returned unlock and title ids instead of call positions
- [ ] The statement sequence inside the transaction is the same as before, proven by a characterisation test

## Notes
Plan section "Slice 4". New `run/run/domain/accountGrant.model.ts` (`objectiveGrantsFor`, `accountGrantsOf`) and `run/run/infrastructure/accountGrant.repository.ts` (`applyObjectiveGrants`, `applyAccountGrants`, `grantEarnedTitles`) taking the caller's `tx`; the nine private writers move verbatim. Not into `account/profile/infrastructure` (cross-aggregate infrastructure arrow). Do not merge `configsUnlockedBy`/`servicesUnlockedBy`; extract `countsReader` in `configUnlock.model.ts` for all three folds. One reorder: swatch and pin write after `settle`, same transaction. Lands after DVTD-n1pr; title rules untouched.
