---
# DVTD-4dko
title: 'Stale checklist copy: requirement text + upgrade-card text + missing Unit Tests tooltip'
status: todo
type: bug
priority: normal
created_at: 2026-07-16T13:18:05Z
updated_at: 2026-07-16T13:18:15Z
parent: DVTD-5jpw
---

Three cheap copy/UI bugs found during playtest (DVTD-8eij), all violating ADR-006's non-negotiable that the checklist must never let displayed text and actual truth diverge:

1. Baseline requirement description text is stale -- always reads "Requires 1 correct answer to pass the gate" even after escalation raises the live counter to 0/2, then 0/3.
2. The "Upgrade a config -> Unit Tests" reward card text is stale too -- keeps showing "1 correct -> 2 correct" regardless of the current escalated baseline.
3. The "Unit Tests" pseudo-config (representing the baseline requirement, appears "fixed" in the loadout from gate 2 onward) is never introduced on the starter-pick screen and has no tooltip -- first-time players have no idea where it came from.

Minor/optional while in there: numerator-over-denominator display reads oddly once over-satisfied (e.g. "5/2", "4/1") -- consider a capped display or a checkmark state instead.
