---
# DVTD-jyxm
title: Speed check-config (needs N fast answers)
status: draft
type: feature
priority: deferred
created_at: 2026-07-12T16:57:32Z
updated_at: 2026-07-27T14:17:00Z
parent: DVTD-615s
---

Parked: the Speed check-config and its 'fast answer' mechanism, removed from the session-run module for now.

Spec to rebuild:
- Config: family 'check', check 'speed', checkAmount 2, rewardMultiplier 2, uncommon. Description 'Gate also needs 2 fast answers — pays 2x storage.'
- Mechanism: an answer at/under SPEED_MS (4000ms) counts 'fast'; GateWindow.fast tallies them; the gate check passes when window.fast >= checkAmount.
- Plumbing needed again: SPEED_MS constant, GateWindow.fast field, elapsedMs on the answer action + reducer, and the route timing (shownAt ref -> Date.now() - shownAt as elapsedMs).
- effect.model: add a 'speed' branch to checkEffect (label 'Speed', reads window.fast); add 'speed' back to CheckKind union.
