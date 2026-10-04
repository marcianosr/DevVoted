---
# DVTD-inrq
title: Gate-0 prep has no route
status: completed
type: task
priority: critical
created_at: 2026-09-15T14:14:07Z
updated_at: 2026-09-16T10:54:05Z
parent: DVTD-0x5c
---

proto-run shows a prep screen between the build and the first poll, driven by a local `startStep` flag. In the wired flow `useRunRouteSync` allows only `/run/configure` under `configuring`, so `/run/prep` bounces back before the run starts.

Decide which: make `/run/prep` legal under `configuring` in `routesForStatus`, or keep pre-start prep as a sub-step inside `RunConfigure`.

- [x] Pick the shape
- [x] Wire it
- [x] Spec the route sync for `configuring`

## Summary of Changes

Shape picked: `/run/prep` is legal under `configuring`, so `routesForStatus` returns `[new, prep]`. One screen, one URL, at every gate including gate 0, and a reload mid-prep stays on prep.

`RunNew.onStart` navigates to `/run/prep` instead of dispatching `start`; `RunPrep` fires `start` before gate 0 and `finish-reward` after every later one, both landing on `/run/poll`. The back exit uses the existing `backLabel` prop and reads `Back to the build`.

Specced in `runRoutes.viewmodel.spec.ts`. Recorded in ADR-088 decision 6.
