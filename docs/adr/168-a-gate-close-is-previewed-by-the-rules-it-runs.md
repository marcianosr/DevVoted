# ADR-168: A gate close is previewed by the rules it runs

## Status

Accepted — 2026-10-01 (DVTD-hsus). Extends ADR-160 (the gate close is recorded
once) from the record to the preview. Keeps ADR-161 §1's promise rule for Dry
Run and ADR-159's clearing band.

## Context

The close lived as a private function inside `answer.model`, beside answer
grading, so the screens that preview it could not call its parts. They copied
them, and three copies had drifted:

- **The peel on a retry.** The close escalates the peel by half its share on
  every attempt at the same gate. The stake called the same quota without the
  attempt count, so a third try read "peels 3" while the close took 6, and could
  call a miss survivable when it ended the run.
- **A mirrored poll's credit.** The close credits the poll it grades, which a
  mirror audit can turn from a single into a multiple. The stake credited the
  poll on the page, so under a mirror its accuracy figures and Dry Run's
  promise counted 1 where the close counted 2.
- **Dry Run's clear line.** The projection tested against HEALTHY, left out the
  estimate's units and the flawless floor, while the close clears at OK below
  the Champion.

## Decision

1. **The close is its own module.** `run/domain/gateClose.model.ts` holds
   `settleGate` (what `closeWindow` was) and the rules a preview needs, so
   `answer.model` grades answers and nothing else.
2. **A preview asks the close's own rules.** `missPeelFor(state)` is the peel a
   miss on this gate takes, attempts included; the close and the stake both
   call it. `gateProjectionFor(state, preview, ahead)` builds the same
   `GateClose` the close builds, for a right and a wrong next answer with every
   unseen poll a missed multiple, and asks `gateRulingFor` whether it clears.
   Its demand is `clearingLineAt(ladder, gate)`, the line the close clears at.
3. **One credit rule.** `pollCreditFor(state, poll)` mirrors first, then applies
   the hidden-answer-type audit. The reducer and the stake both call it.

## Consequences

- Dry Run's projection was still rendered by nothing (ADR-123), so Dry Run
  left the roster the same day (DVTD-7upk) and `gateProjectionFor` went with
  it. The corrected projection is in git if the meter mark is ever built.
- The stake's fatality still ignores a catcher: a miss that lands in DANGER
  spends Try/Catch, one that lands SHAKY does not, and the stake cannot know
  which band a miss lands in before it happens.
