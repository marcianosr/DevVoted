---
# DVTD-amsp
title: Gate 5 minimum before manual run-end (anti-hoard)
status: completed
type: feature
priority: high
created_at: 2026-06-04T08:05:40Z
updated_at: 2026-06-04T08:23:06Z
blocked_by:
    - DVTD-enj5
---

Prevent trivial archive farming where a user starts a run and immediately ends it for full 1MB credit. Block (or partial-credit) endRunManually() before gate 5.

## Design (locked)

Applies to BOTH death and manual end — both are exploit vectors because a player starts each run with 1MB free storage. Could farm by repeated early-death or early-quit.

| Gate | Conversion |
|---|---|
| 1 | n/a (cannot quit, cannot die per game rules) |
| 2 | 20% |
| 3 | 25% |
| 4 | 50% |
| 5+ | 100% |

Math check: at 20% gate-2 quit with full 1MB leftover, player nets 200KB — less than a 256KB common border. Legitimate play strictly dominates farming.

## Touchpoints
- src/domains/runs/services/runCompletion.service.ts — endRunManually
- src/domains/economy/services/archive.service.ts — conversion rate becomes gate-dependent
- UI: 'Start New Run' button disabled or warning shown before gate 5
- Death path (endRunForThresholdFailure) should keep full credit — not an exploit vector

## Blocked by
DVTD-enj5 (foundation merged)

## Todo
- [x] Design locked: tiered conversion (20/25/50/100 at gates 2/3/4/5+)
- [ ] Read current gate tracking on run (where is 'current gate' state?)
- [ ] Replace ARCHIVE_CONVERSION_RATE constant with getConversionRateForGate(gate)
- [ ] Pass current gate into archiveLeftoverStorage from both runCompletion paths
- [ ] Client warning/disable on Start New Run before gate 5
- [ ] Tests covering: gate <5 + manual end, gate 5+ + manual end, death at any gate



## Summary of Changes

Gate-tiered archive conversion (20/25/50/100 at gates 2/3/4/5+) wired through both run-end paths. Single new helper getCurrentGate in pipelineEvaluator.service.ts. Server-side gate-1 block lives in finishRunHandler (user-facing), not endRunManually (system can still force-end). 383 tests pass, lint+tsc clean.

### Changed
- src/domains/runs/services/pipelineEvaluator.service.ts (new helper getCurrentGate)
- src/domains/economy/services/archive.service.ts (gate-aware rate + signature change)
- src/domains/economy/services/archive.service.spec.ts (19 cases, all tiers covered)
- src/domains/runs/services/runCompletion.service.ts (pass gate, both paths)
- src/domains/runs/api/handlers.ts (gate-1 block in finishRunHandler)
- src/routes/_authed/game-over.tsx (dialog message lists tiers, inline error display)
