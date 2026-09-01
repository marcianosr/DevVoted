---
# DVTD-54gi
title: Coverage sets how much of your leftover storage banks
status: todo
type: feature
priority: high
created_at: 2026-09-01T15:33:18Z
updated_at: 2026-09-01T15:33:18Z
parent: DVTD-z2r2
---

## Problem

`storageCreditRate(reason, gatesCleared)` (src/modules/run/run/domain/rules.model.ts:59) pays the archive on **depth**: 0 on abandon, 1 on victory, `gatesCleared / GATE_COUNT` on death. Two runs that die at gate 6 bank the same share whether they scraped through on the demand or doubled it, so coverage, the game's actual score, has no say in the one payout that outlives the run. Progress pays; playing well does not.

## Decision

The rate reads coverage against the victory gate's demand:

    rate = min(1, state.coverage / coverageDemandFor(VICTORY_GATE - 1))

That denominator is 290, the demand a run faces at gate 12 (`COVERAGE_DEMANDS[11]`). Abandon stays 0. Victory stays a floor of 1, so an audit-raised demand can never make a winner bank less than everything.

Use the plain ladder number, not `gateDemandFor(configs, ...)`: the audit-adjusted demand differs per build, and a cross-run payout has to be comparable between runs. A build that dodged audits should not bank more for identical play.

## Numbers

Share of leftover KB banked on a death, today against the proposal (coverage assumed at the minimum that clears that many gates):

| gates cleared | coverage met | today | proposed |
| --- | --- | --- | --- |
| 3 | 25 | 23% | 9% |
| 6 | 85 | 46% | 29% |
| 9 | 175 | 69% | 60% |
| 11 | 250 | 85% | 86% |
| victory | 290 | 100% | 100% |

Deep runs land where they already were. Early deaths bank much less, and a run that overperforms its demand banks more than its depth ever paid, which is the point.

## Why coverage is the better axis

The git tag's anti-cash-out rule falls out for free. ADR-036 has to subtract `startedAtGate` from the credit so a rescued run cannot bank the gates its checkpoint skipped. A rescued run starts at coverage 0, so a coverage-based rate already pays only for what this run scored, and the subtraction (plus the reason-and-gates signature) drops out of the formula.

## Todos

- [ ] ADR amending ADR-005's end-of-run economy bridge, and the `startedAtGate` clause of ADR-036
- [ ] `storageCreditRate` takes coverage instead of gatesCleared; both call sites in run.repository.ts (finishSessionRun, abandonSessionRun) pass `state.coverage`
- [ ] Rewrite rules.model.spec.ts's four `storageCreditRate` cases: abandon 0, victory floor 1, the table above, clamp above the demand
- [ ] Game over screen states the rate and what it banked (GameOverScreen's `archive` note is the slot)
- [ ] Stale comment at run.repository.ts:283 names a `STORAGE_CREDIT_RATE` constant that does not exist; fix while in the file
- [ ] Wiki 6.1 ("at the outcome rate") and the numbers reference
- [ ] CHANGELOG (player-visible)

## Risks to watch

- **Double counting.** Leftover KB already correlates with playing well, and the rate now multiplies the same signal a second time. Strong runs get paid twice; check the spread between a median and a strong run before shipping.
- **Early deaths get meaner.** A gate-3 death banks 9% where it banked 23%, and ADR-042 calls retention the top structural risk. The knob is a floor on the rate for shallow deaths, not the denominator.
- **Hoarding.** A high rate rewards not spending at the last shop. Not new (victory already banks 100%), but a coverage-driven rate makes it visible sooner.
- Overlaps DVTD-nljz (reward coverage spill above the gate demand): both pay for coverage earned past the demand, and they should not both pay for it.
