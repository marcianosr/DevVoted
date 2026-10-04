---
# DVTD-jgcr
title: Run routes are named after their screens, and the gate outcome is one route
status: completed
type: task
priority: critical
created_at: 2026-09-16T10:27:59Z
updated_at: 2026-09-16T10:54:46Z
parent: DVTD-0x5c
---

`/run/*` carries engine-flavoured names (`configure`, `answer`, `reward`, `strip`) while the screens they mount are `NewRunScreen`, `PollScreen` and `GateOutcomeScreen`.

Two changes in one pass, because both land in `RUN_ROUTES`:

1. Rename to the screen names: `/run/new`, `/run/poll`.
2. Merge `/run/reward` + `/run/strip` into `/run/gate`. They are already ONE component (`GateOutcomeView`, verdict `cleared` vs `held`) and they live in different statuses, so the verdict derives from `view.status` with no ambiguity. 9 routes becomes 8.

`/run/prep` stays its own route: ADR-032 makes it the post-shop hub, so during `rewarding` the outcome of gate N and the prep for gate N+1 are both live. One URL cannot mean both.

`/run/shop` keeps its name: CONTEXT.md's retired-terms table keeps the shop as the screen, and `registry` is a panel prop on two screens.

- [x] `RUN_ROUTES` + `routesForStatus` in runRoutes.viewmodel.ts
- [x] Rename route files, delete strip.tsx
- [x] Update every navigate() call site
- [x] Update path citations in ADR-032/037/057/078
- [x] New ADR for the scheme itself (no id in the live-run URL; status owns the screen)
- [x] Spec routesForStatus for the merged gate route

## Summary of Changes

`RUN_ROUTES` is now `/run/new`, `/run/prep`, `/run/poll`, `/run/gate`, `/run/review`, `/run/shop`, `/run/over`: eight routes where there were nine.

`/run/reward` and `/run/strip` merged into `/run/gate`. They were already one component (`GateOutcomeView` with a `cleared` / `held` verdict) and they live in different statuses, so the verdict derives from `view.status` with no ambiguity. `RunReward` and `RunStrip` collapsed into one `RunGate`.

Prep deliberately did NOT merge in: ADR-032 makes prep the post-shop hub, so during `rewarding` the outcome of gate N and the stake of gate N+1 are both live, and one URL cannot mean two screens within one status.

`/run/shop` keeps its name: CONTEXT.md keeps the shop as the screen, and `registry` is a panel prop on both ShopScreen and NewRunScreen.

ADR-088 written for the scheme; stale path citations fixed in ADR-032/037/057/078.
