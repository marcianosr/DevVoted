---
# DVTD-9ejt
title: '207 Multi-Status: every poll looks multiple-choice'
status: completed
type: feature
priority: normal
created_at: 2026-09-21T07:07:36Z
updated_at: 2026-09-21T07:19:38Z
---

A seventeenth audit. Every poll arrives as a select-all and hides whether its
real answer is single or multiple. Every answer pays x1 credit rather than the
multiple-choice x2.

The honest twin of 300 Multiple Choices, which ADR-081 Decision 6 flagged as
"the part to watch": an audit that reads as a hazard but doubles the gate's
coverage, making it a good draw.

Grading is untouched. A true single still requires exactly its one correct
answer; extra picks cancel it. True multiples keep partial-share scoring.
`.length` becomes a strong counter because the gate-wide correct count reveals
how many polls are really singles. Prefetch and `git rebase -i` v2 retain value.

## Decisions

- Family `poll-reading` — never draws with 300, 404 or 451. No DENY_PAIRS entry.
- Pools A (inherited by B) and C. First possible appearance gate 4.
- The meta line says "multiple answers" — full disguise.
- One flag, `hidesAnswerType`: the x1 is the disguise's price, not a separate
  rule. A flattened credit with no hiding beside it would be a payout change
  nobody was told about.

## Todo

- [x] audit.model.ts: AuditId, `hidesAnswerType` field, MULTI_STATUS const, AUDIT_ROSTER, `auditsHideAnswerType` fold
- [x] auditSchedule.model.ts: FAMILY_OF, AUDIT_RANK, POOL_A, POOL_C
- [x] redactPoll reports answerType "multiple" when hidden
- [x] `creditedAnswerTypeFor` helper; answerContextFor + perAnswerPreviewFor read it
- [x] effect.model.ts: PollStatusContext.answerTypeHidden, Math.ceil() status reads unknown
- [x] Specs: audit.model, auditdex, auditSchedule, answer.model, runView.viewmodel, effect.model
- [x] ADR-092 (091 was already taken by the Database escrow ADR)
- [x] wiki audit table, family paragraph, pool table
- [x] CHANGELOG
- [x] Boyscout: ADR-056 Pool A table says 6, code has 7; auditdex.model.ts:18 says "fifteen rules"

## Summary of Changes

Built as ADR-092 (ADR-091 was already claimed by the Database escrow ADR).

**Domain**
- `audit.model.ts`: `"multi-status"` on `AuditId`, `hidesAnswerType?: boolean` on
  `Audit`, the `MULTI_STATUS` entry (code 207) with its description and answer
  cue, roster registration, and the `auditsHideAnswerType` fold.
- `auditSchedule.model.ts`: family `poll-reading`, rank after `mirrored`, pools A
  and C. The family rule alone keeps 207 off a 300 gate — no DENY_PAIRS entry.
- `answer.model.ts`: `creditedAnswerTypeFor`, read by `answerContextFor`.
- `effect.model.ts`: `PollStatusContext.answerTypeHidden` + `readsAnswerType`, so
  `Math.ceil()` reads `unknown` instead of leaking the type via its status.

**Application / view**
- `pollView.viewmodel.ts`: `redactPoll` takes `answerTypeHidden` and reports
  `"multiple"`. One value drives the meta line, the cap shape and the selection
  toggle.
- `runView.viewmodel.ts`: passes the flag to `redactPoll`, feeds
  `answerTypeHidden` into the config-status context, and prices
  `perAnswerPreviewFor` through `creditedAnswerTypeFor` so screen and gate agree.

**Zero grading code was edited.** `gradeOf` already gives the asked-for behaviour:
a true single needs exactly one pick, a second pick cancels it, a true multiple
keeps its quarter ladder. Prep, `.length`, Prefetch and `git rebase -i` v2 needed
no change either — the prep answer-type row was already config-gated.

**Verified**
- `npm test`: 3825 passed, 2 failed. Both failures are the pre-existing
  `gate.model.spec.ts > the floor rule` pair — confirmed by stashing the branch
  and reproducing them on a clean tree.
- `npm run lint`: clean, 0 dependency violations (769 modules). Two pre-existing
  unused-var warnings in untouched stories.
- `npm run build`: clean, 0 type errors.
- Driven end to end: presented type flips single -> multiple; a true single still
  scores `correct 1u` on one pick and `wrong 0u` on two; a true multiple pays 1u
  exact / 0.5u half where an unaudited gate pays 2u / 1u; the ADR-079 rung stays
  1 and 0.5, so the PART badge cannot lie; the stored `answerType` keeps the
  truth for the reveal and review.

**One fixture moved.** Adding a candidate to pool A reshuffles the seeded draw, so
the kanto prep fixture's gate 4 now deals 404 rather than 429; `PrepScreen.spec`
updated. Any spec asserting a specific drawn audit is coupled to pool size.

## Follow-up

Deferred deliberately, noted in ADR-092's Consequences: a **200 OK** audit that
strips the select-all premium without hiding anything, free to stack with 300 and
cancel the reward ADR-081 D6 flagged. Not built — it changes a number the player
cannot act on, and is only worth having if playtesting shows 300 is still the
draw people hope for.
