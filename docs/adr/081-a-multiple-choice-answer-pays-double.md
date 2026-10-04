# ADR-081: A multiple-choice answer pays double

## Status

Accepted, 2026-09-14 (Marciano, DVTD-k9iv). Amends
[ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) Decision 1, which
fixed the base gain and said the poll type does not touch it. Leaves
[ADR-079](079-a-partial-answer-pays-a-quarter-at-a-time.md) whole: the share
ladder is unchanged, and this sits beside it.

## Context

A select-all poll asks strictly more than a pick-one. You have to name the whole
key, no option is a free elimination, and every wrong pick cancels a right one.
It has paid exactly the same as a pick-one since the flat `BASE_UNIT` landed,
which deleted the old 5%/8% split without replacing it. A spec pinned the
result: *"pays a multiple-choice poll exactly what a single pays"*.

That left the hardest question type as the worst-value one. A player who could
tell which polls were select-alls had every reason to hope for fewer of them.

## Decision

1. **A multiple-choice answer pays double.** `creditFor` returns 2 for a
   multiple and 1 for a single, and the credit multiplies the answer's coverage
   alongside the build:
   `BASE_UNIT × share × credit × build + streak step`.

2. **The credit is a term beside the share, not a bigger share.** `coverageShare`
   still returns the ADR-079 rung and nothing else. That rung is what the run
   persists as `coverageFactors.correct` and what the `PART ¾` badge renders, so
   doubling it in place would have made a quarter-caught answer read as a half.
   Keeping them apart means the whole ADR-079 ladder, its 3/4 ceiling and its
   cancellation rule are untouched, and its tests pass without edit.

3. **The doubling runs down the ladder.** A partial on a multiple pays twice its
   rung, so the five outcomes are 0, 0.5, 1, 1.5 and 2 units. Half a key caught
   is worth a whole clean single: the poll was harder, and half of it is real
   work.

4. **Only coverage reads the credit.** ADR-079 Decision 4 holds unchanged.
   Storage, the streak step, `window.correct` and the gate clear payout stay
   binary on the exact-set rule. Coverage is the score and storage is the
   reward, and a select-all proves one slot like anything else.

5. **The badge keeps the fraction, not the credit.** `PART ¾` means three
   quarters of the key was caught. What that was worth belongs in the coverage
   readout, which states the doubled figure as the answer's base.

6. **The 300 Multiple Choices audit pays the credit.** It rewrites every poll
   into a select-all, so under this rule it also doubles the gate's coverage.
   Taken knowingly: the audit asks for the whole wrong-option set on every poll,
   and paying for that is consistent. It makes an audit that reads as a hazard
   into a good draw, which is the part to watch.

## Consequences

The poll mix becomes the largest difficulty dial in the model, and the player
does not hold it: the seed deals it. The balance sim now measures this. A bare
build at 70% accuracy summits under 1% of all-single runs and better than a
third of runs once a quarter of the window asks for a set. Two tests in
`coverageRatio.model.spec.ts` pin the swing so it cannot widen unseen.

The 100% cap absorbs the top end. `bankableUnits` clamps a run's banked units at
`5 × (gate + 1)` and `surplusPayoutKb` pays 32 KB a surplus unit, so past about
half the window the extra credit overflows into storage instead of coverage. An
all-multiple run is no safer than a half-multiple one.

The `HEALTHY_LADDER` is deliberately not moved. The swing is real but the run
that provokes it is rare, and tuning the line before it has been played would be
guessing. If it needs a dial, the ladder is the one to turn.

Nothing new is persisted. `AnsweredPoll.answerType` already records the type,
which is what the credit reads, so history re-grades under the new rule whenever
it is recomputed. `coverageFactors` keeps the rung alone and is no longer a
complete reconstruction of what an answer paid; it never claimed to be one.

`answerContextFor` now takes the graded poll rather than the dealt one, so a
mirrored poll is credited as the select-all it became. `gradedPollFor` is the
one derivation both the scorer and the poll screen's preview read.
