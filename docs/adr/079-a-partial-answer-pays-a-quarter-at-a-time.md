# ADR-079: A partial answer pays a quarter at a time

## Status

Accepted, 2026-09-13 (Marciano, DVTD-2ooc). Amends
[ADR-006](006-session-run-mechanics.md) §11, which set the share but left it
raw, and settles the zero-share partial that bean flagged as a bug.

## Context

A multi-answer poll can be answered partly right, and the engine has always
graded that fractionally: `(right picks − wrong picks) ÷ key size`, clamped to
0..1. Only coverage ever read the number.

Two problems came out of leaving it raw.

The value depended on how many correct options the poll happened to carry rather
than on how well the player answered. A 4-correct key paid quarters, a 3-correct
key paid thirds, a 5-correct key paid fifths. Nothing named the figure on
screen, so the player saw a `PART` badge and a coverage number and had no way to
connect the two.

Worse, the label and the ledger disagreed. When wrong picks cancelled the right
ones, the share came out 0 but the outcome was still `partial`, so the answer
paid nothing while holding the streak and leaving Cache neutral. A shotgun
answer was strictly cheaper than a clean miss, which is the opposite of what the
cancellation rule exists to do.

## Decision

1. **A surviving partial pays one of three rungs: 1/4, 1/2 or 3/4.** The raw
   proportion is rounded to the nearest quarter and clamped into that range. The
   ladder is fixed so that "I got most of it" means the same thing on every
   poll, whatever its key size. Precision was never the point: the player cannot
   act on the difference between 0.6 and 0.667, and both should read as half.

2. **Only an exact set pays in full.** The 3/4 ceiling is what stops a long key
   rounding up: 7 of 8 caught is 0.875, which would otherwise round to a clean
   pass. A full answer and a near-miss must never settle to the same number.

3. **A cancelled-out answer is a miss, not a partial.** A net of zero or less
   returns `wrong`, so the streak resets, Cache flushes and Dependabot's count
   restarts. `PART` now means the answer was paid something, which is the only
   reading under which the badge and the coverage figure can be trusted
   together. The alternative, a zero-paying `PART` that still shields the
   streak, priced a bad answer below a wrong one.

4. **Only coverage reads the share.** ADR-006 §11 holds unchanged on this half.
   Storage, the streak step, `window.correct` and the gate payout stay binary on
   the exact-set rule, so partial credit softens the score without softening the
   pass. The asymmetry is the rule, not an oversight: coverage is the score and
   storage is the reward, and a partial has not proven a slot.

5. **The rung is stated on screen.** The `PART` badge carries its figure
   (`PART ¾`) wherever a verdict appears: the answer reveal, the gate debrief's
   answers panel and the poll review. A ladder the player cannot read is a
   ladder that may as well not exist.

## Consequences

**Two rungs move up and one moves down, so the balance barely shifts.** Catching
2 of 3 goes from 0.67 to 0.75 and 1 of 5 from 0.20 to 0.25; catching 3 of 5
drops from 0.60 to 0.50. The balance simulation in `coverageRatio.model.spec.ts`
models integer correct answers only and never exercised a partial, so it needed
no rewrite. That is also a gap: nothing simulates a multi-heavy window.

**One function grades now, where two did.** `coverageShare` and `answerOutcome`
each re-derived the answer key and re-ran the exact-set check, which is how the
two came to disagree about a cancelled answer in the first place. Both now read
one private helper, so the verdict and the figure cannot drift apart again.
`coverageShare` also became generic over the option id, so the community board's
numeric ids and the engine's string ids grade through the same code, as
`answerOutcome` already did.

**Nothing new is persisted.** The paid share was already stored on every answer
as `coverageFactors.correct`, so the screens read an existing number and the run
snapshot's shape is untouched. History re-grades under the new rule whenever it
is recomputed from the stored picks, which shifts the longest-streak standout
for anyone whose run contains a cancelled-out answer.

**The audit hook could still break the ladder.** `auditScoreShare` lets an audit
rewrite the share after grading, which would put it between rungs and make the
badge lie. No audit defines `scoreShare` today. The first one that does has to
re-quantise, or the figure has to come from the pre-audit share.
