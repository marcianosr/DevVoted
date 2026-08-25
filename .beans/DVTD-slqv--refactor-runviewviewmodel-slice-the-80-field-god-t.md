---
# DVTD-slqv
title: 'Refactor runView.viewmodel: slice the 80-field god type'
status: completed
type: task
priority: normal
created_at: 2026-08-25T15:24:44Z
updated_at: 2026-08-25T16:00:33Z
---

runView.viewmodel.ts is 626 lines and RunView has 80 readonly fields. ADR-002 section 4.3 records it as "a 61-field flattened projection" - it has grown 31% since.

RunView is a trust boundary (DVTD-ay5e): redactPoll strips `correct` flags. One payload, one call, one redaction point is non-negotiable, which rules out per-screen selectors.

Both UI generations get updated: 11 live Run*.component.tsx (via useTodaysRun) and 7 proto *View.component.tsx (via a view prop from /proto-run).

## Todo
- [ ] Cleanup: delete 4 dead fields (draftOptions, top-level modifiers, log, streak), hoist auditViewsFor
- [ ] Extract answerScore.viewmodel.ts (disconnected subgraph)
- [ ] Extract gateStake.viewmodel.ts and pollView.viewmodel.ts
- [ ] Slice paidActions (8 fields)
- [ ] Slice gatePayout (12 fields)
- [ ] Slice shopControls (15 fields)
- [ ] CONTEXT.md rows for the new viewmodel files

## Guard
Assert the test total after EVERY step. Baseline 2333 total / 2322 passed. In DVTD-s5e9 a write-ordering mistake silently deleted 35 tests and the suite still reported green.

## Naming constraint
Slice types cannot be named ShopView/RewardView/PollView/PrepView/StartView/RemovalView/ReviewView (existing component names) or StorageLedger (RewardScreen.ui.tsx:113). Chosen names verified free and already documented: PaidActions (wiki), ShopControls (ADR-029), GatePayout (domain verbs).

## Summary of Changes

`RunView` went from **80 top-level fields to 44**; `runView.viewmodel.ts` from **626 to 337 lines**.

| new file | lines | owns |
|---|---|---|
| answerScore.viewmodel.ts | 81 | disconnected selectors over a built RunView |
| shopControls.viewmodel.ts | 58 | ADR-029 rebuild/lock/extend + git tag (15 fields) |
| gateStake.viewmodel.ts | 52 | GateStake, AuditView, auditViewsFor (9 importers) |
| gatePayout.viewmodel.ts | 44 | what the cleared gate paid and took back (12 fields) |
| paidActions.viewmodel.ts | 43 | lint and peek (8 fields) |
| pollView.viewmodel.ts | 31 | PollView + redactPoll, the trust boundary in one file |

### Cleanup landed with it

- Deleted 4 fields shipped to every client and read by nobody: `draftOptions`, top-level `modifiers`, `log`, `streak`.
- `auditViewsFor` now runs once per view instead of twice.
- Removed the `next*` shadowing aliases (`nextLintCost`, `nextRebuildCost`, `nextExtendCost`) and the dead `locked` / `extensions` / `reportedGate` locals, which fell out naturally once the fields moved into slices.
- Comment pass across the six viewmodel files: 86 comment lines down to 36, one line each, only the WHY the code cannot show.
- `src/test/runView.factory.ts` gained `createMockGatePayout` and `createMockShopControls` beside the existing `createMockGateStake`.

### Not done, and why

The planned `gateStake` de-duplication turned out not to be free: `audits`, `pollsPerGate`, `billKb`/`storageBillKb` and `gateNumber`/`gatesCleared` are each read on BOTH sides (e.g. RunAnswer reads `view.audits` while GateStakeReceipt reads `stake.audits`). Removing either copy needs consumer changes, so only the double computation was fixed.

### Verification

- `npm run lint`: clean, 763 modules / 3098 dependencies, no violations.
- `npm run build`: clean, 0 tsc errors.
- `npm test`: 2337 total, 2326 passed. Baseline at start was 2333/2322; the +4 is concurrent feature work, not this refactor. The 3 failures are the pre-existing `src/ui/modern-theme/screens/RewardScreen.spec.tsx` ones.
- Test total asserted after every step. One scare mid-way: the scoped count dropped 1206 -> 1192, which turned out to be `RewardView.spec.tsx` failing to LOAD because a factory script had aborted before writing `createMockGatePayout`. Nothing was deleted.

### Note on concurrency

This ran while DVTD-ecnx was being worked on in the same tree (streakCapMultiplier on PerAnswerPreview, StartView.component, StartScreen.*). Marciano chose to continue anyway. No conflicts materialised; `pipeline.model.spec.ts` briefly failed from that in-flight work and was fixed on their side.
