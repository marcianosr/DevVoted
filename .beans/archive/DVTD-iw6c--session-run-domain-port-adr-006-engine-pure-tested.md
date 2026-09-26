---
# DVTD-iw6c
title: 'session-run domain: port ADR-006 engine (pure + tested)'
status: completed
type: feature
priority: normal
created_at: 2026-07-12T08:20:00Z
updated_at: 2026-07-12T08:34:11Z
parent: DVTD-5jpw
blocked_by:
    - DVTD-i32n
---

src/domains/session-run/ screaming structure (gate/board/configs/draft/climb). Re-implement proven reducer/checks/rewards/strip as pure tested functions. No UI.

## Summary of Changes
Ported ADR-006 mechanics into src/domains/session-run/ (screaming structure), pure + tested, no UI:
- configs/ — Config type + helpers (rarityOf, focusCoverageMultiplier, focusDemand) + CONFIGS roster (renamed from Tag/SLICE_TAGS).
- board/ — Board type, effectiveRequirement, rewardMultiplierFor, coverageForAnswer, hasLinter, disabledOptionIds, stripConfig, isBare.
- gate/ — GateWindow, escalation, dropCount, currentRequirement, checkStatuses (Correct + coverage/cold-start/speed/mirrored/focus), gatePassed, gateDemands.
- draft/ — rollDraft, rebuildCost (Fibonacci KB).
- climb/ — SessionState/SessionAction, createSession, sessionReducer (slot/answer/lint/strip/add-slot/draft/upgrade/rebuild/skip/drop).
- index.ts barrel (public API).
41 tests across 4 specs, tsc + oxlint clean. Cold-start now derived (leadingCorrect===answered) — dropped the separate openingOpen flag.
