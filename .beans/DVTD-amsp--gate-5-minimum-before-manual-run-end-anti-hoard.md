---
# DVTD-amsp
title: Gate 5 minimum before manual run-end (anti-hoard)
status: todo
type: feature
priority: high
created_at: 2026-06-04T08:05:40Z
updated_at: 2026-06-04T08:05:40Z
blocked_by:
    - DVTD-enj5
---

Prevent trivial archive farming where a user starts a run and immediately ends it for full 1MB credit. Block (or partial-credit) endRunManually() before gate 5.

## Design question
- Hard block: no archive credit before gate 5 (harsh on early frustration)
- Partial credit: e.g. 25-50% conversion below gate 5, full credit at gate 5+ (softer, still kills exploit)

## Touchpoints
- src/domains/runs/services/runCompletion.service.ts — endRunManually
- src/domains/economy/services/archive.service.ts — conversion rate becomes gate-dependent
- UI: 'Start New Run' button disabled or warning shown before gate 5
- Death path (endRunForThresholdFailure) should keep full credit — not an exploit vector

## Blocked by
DVTD-enj5 (foundation merged)

## Todo
- [ ] Decide hard-block vs partial-credit
- [ ] Read current gate tracking on run (where is 'current gate' state?)
- [ ] Gate-aware credit in archive.service
- [ ] Server-side enforcement in endRunManually
- [ ] Client warning/disable on Start New Run before gate 5
- [ ] Tests covering: gate <5 + manual end, gate 5+ + manual end, death at any gate
