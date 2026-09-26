---
# DVTD-fcr8
title: Start-button guard mirrors the engine's own refusal
status: completed
type: task
priority: low
created_at: 2026-08-13T09:15:14Z
updated_at: 2026-08-13T10:16:04Z
parent: DVTD-82c4
---

`RunConfigure.component.tsx:17` computes `slotsLeft = view.slots - view.configs.length` and enables Start on `slotsLeft <= 0`, with a comment admitting it mirrors the engine. The engine refuses the same case itself at `run.model.ts:916` (`configs.length < slots` returns state unchanged).

Sixth instance of the DVTD-w7nm pattern, found while closing that bean but outside its table of five.

Low risk: the engine already refuses, so a drifted UI guard produces a dead button, not a corrupt run. Worth folding into the run view (expose `canStart` alongside `slots`) next time that file is touched, rather than as its own pass.

## Todo
- [x] Expose the start guard from the engine or the run view, drop the UI copy

## Summary of Changes

Closed as part of DVTD-z1ij, which covered the same defect in its `canStart` todo.

`run.model.ts` now exports `canStart(pipeline)`; the reducer's `start` calls it, `RunView` exposes it, and `RunConfigure` reads `view.canStart` instead of recomputing `slots - configs.length`. Two spec cases pin the view's answer to the reducer's behaviour.
