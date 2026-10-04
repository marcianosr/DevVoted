---
# DVTD-yifo
title: One place decides what a right answer pays
status: completed
type: task
priority: high
created_at: 2026-09-25T19:45:46Z
updated_at: 2026-09-25T20:01:23Z
parent: DVTD-y3vn
---

**What:** One function prices a right answer and returns its attribution, and the number quoted before an answer comes from that same function.

**Why:** Four formulas exist today and the preview skips focus, missed-poll and cache and applies throttle unconditionally, so the coverage a player is promised can differ from the coverage they are paid.

## Done when
- [x] The prep and shop preview equals what the next answer pays, for every config alone and for the tested pairs
- [x] The engine walks a build's coverage effects once per answer
- [x] Every export with no production caller in the ratio model is gone
- [x] Payouts are unchanged: the answer engine's existing spec passes without edits
- [x] The changelog states the honest preview

## Notes
Plan section "Slice 2". New `build/domain/answerPayout.model.ts` (`answerPayoutFor`, `previewContextFor`, `perAnswerPreviewFor`); `PayoutContext` in `effect.model.ts` with the `focusCategory !== undefined` guard. Deletes `coverageProfileFor`, `throttleFor`, `coveragePerCorrectRaw`, `coverageForAnswer`, `coverageBreakdownForAnswer`, `coverageFactorsForAnswer`, `wagererFor` from `build.model.ts`; the DVTD-j3aw cluster and `gainPerCorrectFor`/`coverageAfter`/`coverageMultiplierFor`/`coverageMultiplierOf`/`focusBonusFor` from `coverageRatio.model.ts`; `RunView.perAnswer`; `answerScore.viewmodel.ts`. Absorbs DVTD-j3aw (`isRunUnwinnable` deleted, design question filed separately). DVTD-5121 is stale (its file was deleted with old-theme) and is closed when this lands. CONTEXT.md: replace the Coverage row with Answer payout; delete the Answer score row.

## Summary of Changes

- New `build/domain/answerPayout.model.ts`: `answerPayoutFor` walks a build's coverage effects once and returns `{ earned, breakdown, factors }`; `previewContextFor` and `perAnswerPreviewFor` quote the next answer through that same walk with no category. `PayoutContext` (category optional) added to `effect.model.ts`, and `coverageOf` guards `focusCategory !== undefined` so a preview matches no Focus.
- `answer.model.ts` `scoreAnswer` makes one call instead of three. `answer.model.spec.ts` was not touched and passes: payouts did not move.
- Deleted from `build.model.ts`: `coverageProfileFor`, `throttleFor`, `coveragePerCorrectRaw`, `perAnswerPreviewFor`, `coverageForAnswer`, `coverageFactorsForAnswer`, `coverageBreakdownForAnswer`, and the unread `coverageMultiplier` / `coverageAdd` fields of `BuildModifiers`. Deleted from `coverageRatio.model.ts`: the DVTD-j3aw cluster and the four preview formulas (392 → 207 lines). Deleted `RunView.perAnswer` (no reader; `gateStake.perAnswer` is the live one) and `answerScore.viewmodel.ts` (no reader).
- Kept on purpose: `payoutRatioFor` / `perfectBonusFor` / `gatePayoutKb` / `PAYOUT_RATIO_CAP` (DVTD-tjc7 decides them; the gate factory reads them) and the ladder building blocks `rungAt`, `okDropAt`, `floorUnitsAt`, `unitsToRatio`, `surplusUnits` (live internal callers, spec'd).
- Specs: `answerPayout.model.spec.ts` (ported cases plus the roster-wide invariant "preview equals payout" over every config alone, four pairs, both moments and both answer types); `build.model.spec.ts` 813 → ~330 lines; `coverageRatio.model.spec.ts` keeps the Monte-Carlo balance block through `answerPayoutFor`; `effect.model.spec.ts` gains "focuses nothing when the category is unknown".
- Docs: CONTEXT.md Coverage row → Answer payout; Answer score row deleted; two Retired terms rows. CHANGELOG `### Changed`: the quoted per-answer figure now follows the poll in front of you.
- Verified: `npm run typecheck` clean, `npm run lint` clean (depcruise 730 modules, wiki in sync), `npm test` 200 files / 3827 tests (baseline 199 / 3802).
