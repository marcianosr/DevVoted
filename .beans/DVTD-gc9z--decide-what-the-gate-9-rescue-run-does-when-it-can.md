---
# DVTD-gc9z
title: Decide what the gate-9 rescue run does when it cannot be won
status: draft
type: feature
priority: low
created_at: 2026-09-25T19:45:53Z
updated_at: 2026-09-25T19:45:53Z
---

**What:** Decide what the git-tag rescue run does when the units it starts with cannot reach the gate it resumes at.

**Why:** A helper that would detect this case was built, spec'd and never called, so today such a run is silently unwinnable; wiring it as-is would declare a run dead at birth, which is a rules change nobody has made.

## Done when
- [ ] The rule is written down: refuse the resume, warn the player, or seed the run with enough units
- [ ] The chosen rule has a spec driven through the reducer

## Notes
Raised while deleting `isRunUnwinnable` in the answer-payout slice of the deepening pass (DVTD-j3aw's second question). `createRun` sets `bankedUnits: 0` against the resumed gate's demand (ADR-036).
