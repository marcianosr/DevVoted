---
# DVTD-rj2j
title: 'Split answer.model.ts step 3: decompose the answer transition'
status: completed
type: task
priority: normal
created_at: 2026-08-25T16:39:58Z
updated_at: 2026-08-25T17:20:10Z
---

Follows DVTD-s5e9. That split moved `answer` out of run.model.ts intact; this one breaks the transition itself apart.

## The problem

`answer` is ~140 lines holding ~20 local consts, braiding four jobs into one scope: grading (mirror, judge, time limit, audited share, streak), scoring (coverage earned/lost, breakdown, faucet, burn), the `AnsweredPoll` review record, and state application (window tally, per-category coverage, storage, log, slot claim, the `closeWindow` branch).

Several ordering rules are held by nothing but the order the consts sit in: `answeredBefore` must read `state.window.answered` pre-increment, `widened` must wrap the post-answer state, `burnKb` must clamp against storage plus this answer's faucet.

## Shape

Four module-private helpers, in call order, then `answer` as ~18 lines of composition:

- `gradeAnswer(state, poll, optionIds, elapsedMs?) -> AnswerGrade` — carries `audits` and `configs` so every downstream step judges the same snapshot
- `scoreAnswer(state, poll, grade) -> AnswerLedger` — named Ledger, not Score: run/application already owns `AnswerScore` for the reveal projection
- `answeredPollFrom(poll, optionIds, grade, ledger, elapsedMs?) -> AnsweredPoll`
- `applyAnswer(state, poll, grade, ledger, answered) -> RunState`

Export surface unchanged (`answer` only), so the lint:arch rank order from DVTD-s5e9 is untouched.

## Out of scope

- Splitting `closeWindow` into its own file. CONTEXT.md:35 already confesses the double life; separate bean.
- The triple `coverageForAnswer` call (answer.model.ts:269 plus two inside `coverageBreakdownForAnswer`). The two paths round differently, so folding them is a behaviour question.

## Todo
- [x] Capture the test baseline before editing (DVTD-s5e9 lost 35 tests silently; a deleted test does not fail)
- [x] Add the four helpers
- [x] Replace the body of `answer` with the pipeline
- [x] Re-check the seven ordering invariants against the diff
- [x] npm run lint, npm run build, npm test at the same totals

## Summary of Changes

`answer` went from 140 lines to 19. `answer.model.ts` 371 -> 448 lines: the growth is
type declarations, four signatures and the comments that came with the lifted blocks.
Export surface unchanged, so nothing outside the file moved.

A second pass removed the seven comments the refactor authored (two type doc blocks,
two field docs, three inline notes). The seven that remain were all lifted verbatim
with their code and carry ADR references or a real WHY.

| symbol | lines | job |
|---|---|---|
| `AnswerGrade` + `gradeAnswer` | 10 + 37 | mirror, judge, time limit, audited share, streak |
| `AnswerLedger` + `scoreAnswer` | 7 + 42 | coverage earned/lost, breakdown, faucet, burn |
| `answeredPollFrom` | 27 | the review record |
| `applyAnswer` | 63 | window tally, coverage, storage, log, slot claim |
| `answer` | 19 | composition + the `closeWindow` branch |

### Two decisions worth recording

`AnswerGrade` carries `audits` and `configs` rather than letting each step re-derive
them. The comment that used to sit at the top of `answer` ("audits read the installed
pipeline, scoring the live one") becomes something the type holds: every downstream
step is handed the same snapshot instead of being trusted to ask for it the same way.

`AnswerLedger`, not `AnswerScore`. `run/application` already owns `AnswerScore` for the
reveal's projection (CONTEXT.md:51). Two same-named types either side of a layer
boundary would read as one thing. "Ledger" is already in use (`BillLedger`).

### Near-miss during the refactor

Folded `earnedCoverage - coverageLoss` into a `net` const used by both `categoryAfter`
and `window.coverageGained`. That re-associates the float addition: `a + b - c` is not
`a + (b - c)` in IEEE 754, and both results go through `roundToOneDecimal`, so a value
landing on a `.05` boundary could round differently. Reverted to the original
expression in both places. Caught by reading, not by a test — the suite would not have
caught it either.

### Verification

- `npm run lint`: clean. `lint:arch` 763 modules / 3098 dependencies, no violations.
  One pre-existing warning, untouched: `runAction.model.ts:6` no-duplicates, from the
  stray `import {} from ".../paidAction.model"` at line 27 that DVTD-s5e9 left behind.
- `npm run build`: clean, 0 tsc errors.
- `npm test`: 2337 total, 2326 passed, 3 failed, 6 skipped, 2 todo — **identical to the
  pre-change baseline**, same 3 pre-existing failures in
  `src/ui/modern-theme/screens/RewardScreen.spec.tsx`.
- `answer.model.spec.ts` alone: 69/69.
- Verified no symbol was lost: the only identifiers gone from the old body are
  `answeredPoll` (renamed `answered`) and `faucetEarnedBefore` (inlined).

### Deferred

- Split `closeWindow` into its own file. CONTEXT.md:35 still describes one file doing
  two jobs. Would need a spec split, a rank-order entry and a CONTEXT row.
- The triple `coverageForAnswer` call: `scoreAnswer` computes `earnedCoverage`, then
  `coverageBreakdownForAnswer` recomputes it twice (`pipeline.model.ts:398-399`). Its
  parts are documented to sum to `coverageForAnswer`, so `earnedCoverage` could come
  from the breakdown, but the two paths round at different points.
