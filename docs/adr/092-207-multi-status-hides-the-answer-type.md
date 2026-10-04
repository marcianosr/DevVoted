# ADR-092: 207 Multi-Status hides the answer type and flattens the credit

## Status

Accepted — 2026-09-21 (Marciano, DVTD-9ejt). Adds a seventeenth audit to
[ADR-038](038-the-audit-roster.md)'s roster and amends
[ADR-056](056-audits-are-drawn-not-scheduled.md)'s pool and family tables.
Resolves the tension [ADR-081](081-a-multiple-choice-answer-pays-double.md)
Decision 6 left open. Follows the shape
[ADR-058](058-451-redacts-the-answers-and-sells-them-back.md) set for 451.

## Context

Since ADR-081 a select-all pays double, and ADR-081 Decision 6 accepted
knowingly that **300 Multiple Choices therefore doubles its gate's coverage**.
It called that "the part to watch": an audit that reads as a hazard is in fact a
good draw, because it rewrites every poll into the question type that pays most.

Separately, the answer type has always been free information. A poll states
`single answer` or `multiple answers` above its options, and the cap shape says
the same thing again. Knowing it is worth a great deal — it tells you whether a
second pick is a second chance or a cancellation — and it has never cost
anything.

207 takes that fact away and charges the premium back.

## Decision 1: the audit hides the type, and does nothing else to the poll

**207 Multi-Status** — every poll arrives as a select-all, and never says
whether it really takes one answer or several.

Nothing about correctness moves. This is the whole difference from 300, which
rewrites the key: 207 leaves the poll exactly as authored and changes only what
the player is told about it. The behaviour the audit sells falls straight out of
the existing grader (`gradeOf`), with no scoring code edited at all:

- A true single is still right on **exactly one pick** and wrong on two, because
  `exact` for a single is `picked.size === 1 && caught === 1`.
- A second pick therefore **cancels** a right one rather than costing nothing.
- A true multiple keeps its [ADR-079](079-a-partial-answer-pays-a-quarter-at-a-time.md)
  quarter ladder untouched.

That is the audit's whole play: you must infer both *which* answers and *how
many*, and guessing wide is punished on the polls where it was never needed.

## Decision 2: the view lies, the domain tells the truth

The disguise lives in `redactPoll`, the poll → `PollView` mapper 451 already
uses for sealing. It reports `answerType: "multiple"`, and that single value
drives all three tells: the meta line (`ANSWER_TYPE_LABEL`), the cap shape
(`CAP_SHAPE`) and the selection toggle. One lie, one seam.

`gradedPollFor` is untouched, so the scorer reads the poll's own type, and
`AnsweredPoll.answerType` persists the **truth**. The reveal and the review
therefore state what the poll actually was.

That last part is deliberate and not a leak. ADR-058's Consequences named the
failure to avoid — "gamble blind, learn nothing" — and an audit that never
resolves its own question would land exactly there. You answer blind; you are
told afterwards.

This departs from [ADR-038](038-the-audit-roster.md) Decision 6, which stores on
a mirrored response *which question was asked*, because under the mirror the
question genuinely changed. Under 207 it did not: the same poll was asked, with
one fact withheld.

## Decision 3: an answer is credited as a single

`creditFor` returns 1 for every answer at a 207 gate, so an exact select-all
pays one unit where it would otherwise pay two, and a half-caught set pays half
a unit rather than a whole one.

**Why the flattening belongs to the hiding.** ADR-081 justifies the premium by
the task: naming a whole key is strictly harder than picking one. That is still
true under 207 — the work did not get easier. What changed is that the player
cannot perceive, plan around, or aim at the distinction: every poll is the same
poll from their side. A premium paid on a difference invisible at the moment it
is earned is variance, not reward. Flattening makes the payout match the
experience — uniform polls, uniform pay.

**One flag, not two.** `hidesAnswerType` carries both consequences.
`flattensCredit` standing alone would describe a payout change nobody was told
about, which is not a rule the receipt could state. `mirrorsPolls` is the
precedent: one field carrying a whole rule, several code paths deep.

**The share is not the seam.** ADR-079's Consequences warn that the first audit
to define `scoreShare` must re-quantise or the `PART ¾` badge will lie. 207
avoids that entirely by moving the credit, which ADR-081 Decision 2 already
established is a term *beside* the share. `coverageFactors.correct` keeps
storing the rung alone, so the badge is untouched.

Implementation note: `creditFor` is fed an `AnswerType` at every call site, so
the rule needs no new plumbing into `build/`. One helper,
`creditedAnswerTypeFor`, answers "what is this priced as" and is read by both
`answerContextFor` (the scorer) and the per-answer preview, so the price on
screen and the price paid cannot drift.

## Decision 4: family `poll-reading`

207 joins 300, 404 and 451. All four attack the same reading step, and the
family rule is what keeps 207 and 300 apart without naming them — no
`DENY_PAIRS` entry.

The exclusion is not cosmetic. Under 300 every poll genuinely *is* a select-all
and the audit says so, so 207 would have nothing left to hide; worse, it would
strip the doubled credit that is 300's entire compensation for asking the whole
wrong-option set. The two rules contradict each other, and a family is the right
instrument for that.

Note the family rule only fires where a gate draws two or more audits. 300 lives
only in pools B and C, so gates 8 to 11 are precisely where the two could
otherwise meet — the family covers every case.

`answer-shape` as a private family plus an explicit deny pair was considered and
rejected: it buys the ability to stack 207 with 404 (blind on category *and* on
pick count) and with 451 (sealed options *and* an unknown count), which is the
punishing case ADR-058 filed 451 into `poll-reading` to prevent.

## Decision 5: pools A and C

Same placement as 451, for the same reason: **207 needs no config to counter
it**, so it is safe on a one-audit gate where a player may own nothing relevant.
Its early bite is small, since only genuinely-multiple polls lose the ×2 — a
window holding one select-all loses one unit. The sharper edge is the
over-picking risk on singles, which is a skill the audit teaches rather than a
tax it levies.

## Consequences

- **`.length` becomes the audit's counter, and needed no code.** `pickBudgetFor`
  already returns the gate-wide total of correct options across the five polls,
  so a budget of 5 proves every poll is a single. Reading the audit is a
  deduction the player can buy into.
- **Prefetch and `git rebase -i` v2 keep naming the types, and gain value.** The
  prep screen's `answer types` row was already gated behind Prefetch and sealed
  otherwise, so 207 defeats nothing there and needed no edit. An audit that
  makes an existing config sharper is a better outcome than one that switches it
  off.
- **One status had to be silenced.** `Math.ceil()`
  ([ADR-086](086-a-config-can-round-a-partial-up.md)) reports `selectAllOnly` or
  `paysOnPartial` on the build track depending on the poll's type, which would
  have stated the hidden fact for free. It reads `unknown` at a 207 gate,
  following 404's precedent — but scoped to that config alone, since 207 does not
  hide the category and everything else must stay honest.
- **Nothing new is persisted, and no history re-grades.** `coverageForAnswer`
  runs only at answer time, so the flat credit is baked into the stored
  `coverageEarned` rather than re-derived later.
- **A fixture moved.** Adding a candidate to pool A reshuffles the seeded draw;
  the kanto prep fixture's gate 4 now deals 404 rather than 429. That is the
  designed consequence of pool membership, not a regression — but it means any
  spec asserting a *specific* drawn audit is coupled to pool size.
- **Open: 207 is flat rather than dialled by depth**, unlike 408 and 410. If it
  plays soft at gate 4, the dial is the first lever. The second is
  [ADR-081](081-a-multiple-choice-answer-pays-double.md) Decision 6's other half
  — a **200 OK** audit that strips the select-all premium without hiding
  anything, free to stack with 300 and cancel the reward that makes it a good
  draw. That is deliberately not built here; it changes a number the player
  cannot act on, and is worth having only if playtesting shows 300 is still the
  draw people hope for.
