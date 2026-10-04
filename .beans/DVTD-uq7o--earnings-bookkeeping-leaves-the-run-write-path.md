---
# DVTD-uq7o
title: Earnings bookkeeping leaves the run write path
status: completed
type: task
priority: normal
created_at: 2026-09-25T19:45:47Z
updated_at: 2026-09-30T17:02:17Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-n1pr
---

**What:** What an action earned the account is computed by a pure function and written by one adapter, and the run write path only locks, reduces, settles and writes.

**Why:** The file that saves a run also grants titles, unlocks, services, swatches and the watermark across five tables, and its spec asserts database call order by index so one added statement breaks twenty tests.

## Done when
- [x] The grants an action earns are computed with no database and tested as state in, grants out
- [x] The run write path's signature, return and errors are unchanged and its caller is untouched (abandonSessionRun lost its dead userId parameter; see Summary)
- [x] The dispatch spec asserts the returned unlock and title ids where it grants them; the remaining positional asserts read the state row by key
- [x] The statement set inside the transaction is the same as before; two writes moved (see Summary), and the end-to-end dispatch specs prove the rest

## Notes
Plan section "Slice 4". New `run/run/domain/accountGrant.model.ts` (`objectiveGrantsFor`, `accountGrantsOf`) and `run/run/infrastructure/accountGrant.repository.ts` (`applyObjectiveGrants`, `applyAccountGrants`, `grantEarnedTitles`) taking the caller's `tx`; the nine private writers move verbatim. Not into `account/profile/infrastructure` (cross-aggregate infrastructure arrow). Do not merge `configsUnlockedBy`/`servicesUnlockedBy`; extract `countsReader` in `configUnlock.model.ts` for all three folds. One reorder: swatch and pin write after `settle`, same transaction. Lands after DVTD-n1pr; title rules untouched.

## Summary of Changes (2026-09-30)

- `run/domain/accountGrant.model.ts`: `objectiveGrantsFor(counts)` (configs + services off one count set) and `accountGrantsOf(before, after)` (swatch ids, first installs, planted pin, storage watermark, whether titles are due), spec'd through the run fixtures with no database.
- `run/infrastructure/accountGrant.repository.ts`: the eleven private writers moved verbatim behind three calls that take the caller's `tx`: `applyObjectiveGrants`, `applyAccountGrants`, `grantEarnedTitles`, plus `fetchCategoryPollCounts` (the title service re-pointed). Own spec on the Drizzle mock.
- `countsReader` in `configUnlock.model.ts` replaces the three hand-built metric maps in the config, service and title folds.
- `applyActionToRun` reads: seed, lock, roll, hydrate, reduce, objective grants, rebase, answer, settle, account grants, titles, record, state row, finish. Its signature, return type and both thrown messages are unchanged. Two writes moved inside the transaction: the swatch and the pin now write after the settlement (the 25 Sep plan accepted this), and the storage watermark writes before the state row instead of after the finish. Same statements, same transaction.
- `abandonSessionRun`: the inline archive credit I listed as a bug was dead code, since `storageCreditRate("abandoned", …)` is 0. It is deleted with the state read it needed, so the function only finishes the run; it no longer takes a `userId`. My earlier claim that a pinned start abandoned overpaid was wrong.
- `run.repository.spec.ts` lost the moved category-count describe and reads the state row by key instead of position; its fixtures gained one queue slot for the watermark where a close now raises it.
