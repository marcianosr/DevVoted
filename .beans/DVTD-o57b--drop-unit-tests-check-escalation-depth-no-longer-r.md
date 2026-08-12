---
# DVTD-o57b
title: 'Drop Unit Tests check escalation: depth no longer raises the demand'
status: completed
type: feature
priority: high
created_at: 2026-08-12T11:37:45Z
updated_at: 2026-08-12T11:42:32Z
parent: DVTD-kulw
---

currentRequirement drops the gate-depth term. An un-upgraded Unit Tests demands its checkAmount forever; only bought levels raise it. Reverses the escalation half of ADR-017 and moots DVTD-ziss's premise.

## Summary of Changes

`currentRequirement(pipeline)` is now `min(SLICE_WINDOW, checkAmount + level - 1)`; it lost its `gatesCleared` parameter. `escalation` and `ESCALATION_CAP` deleted from rules.model.

Docs: new ADR-033, inline supersede markers in ADR-017 (Decision 1 and the open-questions note), ADR README row, wiki §4.4 + §2.10 gate table (escalation column dropped) + §4.4 upgrades + glossary Demand + the ADR-018/019 risk callout, CHANGELOG entry.

Left alone deliberately: `dropCount` (strips on fail still grow with depth) and `LINT_COSTS` (the linter fee still doubles). Only depth-driven escalation of a check the player did not choose was removed.

Follow-up: DVTD-ziss — depth is now unpriced on the correct check.
