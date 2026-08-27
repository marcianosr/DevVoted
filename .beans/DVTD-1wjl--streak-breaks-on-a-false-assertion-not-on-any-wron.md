---
# DVTD-1wjl
title: Streak breaks on a false assertion, not on any wrong pick
status: todo
type: feature
priority: high
created_at: 2026-08-27T10:56:36Z
updated_at: 2026-08-27T10:56:36Z
---

A multi-answer over-pick (the whole correct set plus a wrong option) currently returns 'partial' and HOLDS the streak, while one wrong pick on a single-answer poll zeroes it. Sloppiness is protected; a single confident miss is not. Verified at answer.model.spec.ts:377 ('holds the streak (and its bonus) on a partial multi-answer pick') and runPoll.model.ts:110 nextStreak.

New rule: the streak counts consecutive answers containing no false assertion.
- single correct -> grows (unchanged)
- single wrong -> dies (unchanged)
- multi, strict subset of the correct set, no wrong options -> holds (unchanged; this is the honest hedge and must survive)
- multi, correct set plus a wrong option -> DIES (the fix)
- multi, only wrong options -> dies (unchanged)

Coverage keeps paying share-scaled on a mixed pick: this is a streak-only change, not a scoring one. Also closes a second dodge: answer.model.ts:344 keys Memory Leak's deeper burn off outcome === 'wrong', so an over-pick currently dodges the Volcano burn too.

Implementation: prefer a predicate (did the pick include a wrong option) over a fourth AnswerOutcome value, which would ripple into RunSummary badges and the review UI and would coin a vocabulary word against convention.

- [ ] ADR for the rule change (reverses tested behaviour)
- [ ] Domain: streak reads 'picked a wrong option' rather than the outcome alone
- [ ] Specs: all five rows of the table above
- [ ] Memory Leak burn keys off the same predicate
- [ ] Wiki §2.5: 'streak and storage stay binary on the exact-set rule' is false for streak. Storage IS binary (answer.model.ts:315), streak is not.
- [ ] Wiki §2.5: 'Capped, never reset' reads as 'a wrong answer never resets it'. Clarify it means 'not reset at gate boundaries'.
- [ ] CHANGELOG
