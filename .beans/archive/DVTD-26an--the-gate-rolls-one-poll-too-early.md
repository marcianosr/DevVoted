---
# DVTD-26an
title: The gate rolls one poll too early
status: completed
type: bug
priority: high
created_at: 2026-09-13T14:23:59Z
updated_at: 2026-09-13T14:46:14Z
---

Answering the fifth poll of a gate flips the run into the next gate while the player is still reading that fifth answer. Header, swatch track, coverage ladder and coverage denominator all jump at once, so the score appears to halve at the moment a gate finishes.

Reported live: gate 0 scored correct/correct/wrong/correct/correct and the fifth reveal read "Gate 1 - Boulder, 48.8%" against gate 1's HEALTHY 30%. Earned was 4.88 units, which is 97.6% of gate 0's five slots and 48.8% of gate 1's ten.

Cause: `answer.model.ts` closed the gate in the same reducer step as the fifth answer, while the route pins the player on the poll screen to read the reveal. Every number on that screen derives from `state.gatesCleared`.

Presentation only. `closeWindow` builds its GateClose with the pre-increment gate, so banking, banding and payout were all correct.

## Todo

- [x] `gateWindowComplete` + `closeGate` in answer.model; `answer` stops auto-closing and stops advancing currentIndex on the closing answer
- [x] `close-gate` action in runAction.model + run.validation
- [x] `answerWith` chains the close so the existing suite stays green
- [x] `gateComplete` on RunView
- [x] `gateLabelFor` shared by the header title and the button label
- [x] PollView names the gate on the last reveal's action button
- [x] proto-run: onNext closes; answerRestOfWindow rig loop must not spin
- [x] RunAnswer dispatches close-gate after committing
- [x] Tests: gate holds through its last reveal, close rebases, inert mid-gate, no sixth answer, button label, gateComplete
- [x] CHANGELOG

## Summary of Changes

`answer` records, `close-gate` settles. The answer that fills the window now leaves `currentIndex` on its own poll and does not touch `gatesCleared`, so the fifth reveal is read against the gate that asked it (97.6% of five slots, not 48.8% of ten). `closeGate` runs the same `closeWindow` one step later.

Blast radius stayed small because `answerWith` (run.factory) is the single helper every domain spec routes answers through: chaining `close-gate` there, where it is inert mid-gate, kept 16 spec files asserting on `"rewarding"`/`"awaiting-strip"` passing untouched.

- `gateWindowComplete` / `closeGate` exported from answer.model; `answer` refuses a sixth answer into a full window
- `close-gate` in runAction.model + run.validation (the schema has a type-level total-coverage assertion, so it could not be forgotten)
- `gateComplete` on RunView, so presentation routes on a derived predicate rather than a new persisted status that could drift from the window
- `gateLabelFor` in pollScreen.viewmodel feeds both the header title and the button label, replacing Header.ui's inline copy on this screen
- proto-run's `answerRestOfWindow` rig loop closes each gate; without it the loop spins forever once the window fills
- run.repository's stale comment about `currentIndex` corrected

## Also cleared while here

26 pre-existing failures from the coverage rewrite, mostly fixtures holding old-ladder numbers.

- `failGate` now carries enough history to land between the floor and the OK line. Zero units is DANGER at any gate with a floor, and DANGER ends the run (ADR-076), so every "the gate held and owes a peel" spec was exercising the wrong exit.
- `demandMet` (objectiveProgress.spec) stopped forcing `window.correct`, which was poisoning the perfect-window check
- Gate demand copy was "Needs X% coverage in its window"; coverage is a run total now, so it reads "to clear"
- `kantoGateHealthyLine` / `kantoPrepLadder` re-exported from the test factories: `lint:arch` rejects a `src/ui/*.spec` importing a module **value**, which is why those percentages were hardcoded and drifted in the first place
- CHANGELOG's Unreleased block still described the superseded model (5%/8% flat, misses bleeding, a 5-95% ladder). Rewritten, not appended to. No Fixed entry for this bug: it was introduced in unreleased work.

## Verification

lint clean, depcruise clean (972 modules), build passes. 4212 passing, 7 failing.

The 7 are not this work: 2 are the floor rule left for Marciano in `gateClosingFor`, and 5 are his in-flight WIP (BandOutcomes' `layout` removal, which also causes the 2 remaining `tsc` errors, and the PollScreen/Question trail refactor).
