---
# DVTD-gvpw
title: Show active reward + coverage multipliers (shop + start-run)
status: completed
type: feature
priority: normal
created_at: 2026-07-16T15:24:53Z
updated_at: 2026-07-16T15:32:19Z
---

Surface the build's active reward multiplier and coverage multiplier clearly on the shop loadout header and the configuring/start-run screen.

## Summary of Changes

Added a `MultiplierSummary` (reused `StatBadge` label+value styling from the reward screen) showing the build's active **Reward multiplier** and **Coverage multiplier** (`×N` + flat `+X%`).

- `pipeline.model.ts` — `coverageProfileFor(pipeline)` → `{mult, add}` (product of Amplify mults + sum of flat adds; Focus category bonuses excluded as they're conditional). Unit-tested.
- `sessionView.viewmodel.ts` — exposes `coverageMultiplier` + `coverageAdd`.
- `MultiplierSummary.ui.tsx` — new; rendered on the **shop** header and the **configuring/start-run** "Review your build" section.
- Loadout header simplified (dropped the redundant "at N×" — the summary owns the factors now).
