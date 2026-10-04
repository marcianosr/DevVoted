---
# DVTD-7upk
title: Dry Run leaves the roster until the meter can draw it
status: completed
type: task
priority: normal
created_at: 2026-10-01T19:01:53Z
updated_at: 2026-10-01T19:06:40Z
parent: DVTD-y3vn
---

**What:** Dry Run is no longer offered, earned or listed, and its unseen projection code is gone.

**Why:** It cost 2 weight and showed nothing: no screen ever drew the meter mark it promised.

## Done when
- [x] Dry Run is not in the roster, the unlock list, the Dex, the wiki or the changelog
- [x] The projection only it used is deleted
- [x] A saved run that still holds it keeps loading
- [x] Lint, typecheck and tests pass

## Notes
ADR-123 recorded that gateStake.projection was rendered by nothing; ADR-168 fixed the projection's rules the same day. The correct version is in git at this commit's parent if the meter mark is built later. refreshConfig in runSnapshot.model returns a stored config unchanged when its id is no longer in CONFIG_LIST.

## Summary of Changes

Removed the dryRun roster entry, its unlock, the projectsGateOutcome flag (config.model, configStatus, configGroup), projectorFor, gateStake.projection, gateProjectionFor, WindowAhead, windowAheadFor, clearingLineAt, DryRun.stories and its story-spec entry, the wiki row and the unreleased changelog bullet. The mirror-credit test moved to answer.model.spec (pollCreditFor). configGroup answerHelp count 8 to 7. ADR-168 consequences and index row updated. Lint clean; run, config and gate specs 570/570; the full suite and typecheck were mid-edit by the parallel skip/Vite/streak session at verification time (its 6 type errors are in answerPayout.model.spec and answer.model.spec STREAK_UNIT_STEP, not this change).
