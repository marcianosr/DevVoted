---
# DVTD-7wy6
title: Requirement row shows base description while the target escalates
status: completed
type: bug
priority: normal
created_at: 2026-07-18T08:41:24Z
updated_at: 2026-07-18T08:49:34Z
---

## Symptom

Gate 5 failed screen says "Unit Tests — Requires 1 correct answer to pass the gate." next to progress "2/3". Player had 2 correct and reasonably expected to pass.

## Cause

The requirement is real: `currentRequirement = (level ?? 1) + escalation(gatesCleared)` with `escalation = floor(gatesCleared/2)` (`src/modules/run/gate/gate.model.ts:17`, `src/modules/run/rules.model.ts:9`). At gate 5 (4 cleared) that's 1 + 2 = 3.

The engine already produces an honest, escalated description — `correctDemand(baseline)` → "3 correct answers" (`gate.model.ts:58`) — but `roleRows` ignores `check.description` and renders the static `describeConfig(config)` ("Requires 1 correct answer…") from the config roster (`src/modules/run/gate/configRole.model.ts:43`).

## Fix sketch

In `roleRows`, for `role === "requirement"` rows with a backing check, prefer the check's dynamic description (e.g. "Requires 3 correct answers to pass the gate.") over the static config description. Leave conditional/perk rows on `describeConfig`.

## Todo

- [x] roleRows prefers check.description for requirement rows
- [x] Spec: gate 5 shows "3 correct answers", gate 1 shows "1 correct answer"

## Summary of Changes

`roleRows` now derives requirement-row text from the check's dynamic description (`rowDescription` in `src/modules/run/gate/configRole.model.ts`): "Requires 3 correct answers to pass the gate." at gate 5, falling back to `describeConfig` for conditional/perk rows or checks without a demand. Two new specs cover the escalated and base cases. Coverage-gain rows get the same honesty for free (its target also escalates).
