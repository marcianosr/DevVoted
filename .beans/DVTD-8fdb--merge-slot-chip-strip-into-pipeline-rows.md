---
# DVTD-8fdb
title: Merge slot chip-strip into pipeline rows
status: completed
type: feature
priority: normal
created_at: 2026-07-24T11:43:08Z
updated_at: 2026-07-24T12:01:06Z
---

Remove the duplicate config chip-strip (Pipeline/Loadout) on Shop + Configuring screens; the pipeline rows (RoleList) become the slots. Empty slots render as rows; sell/upgrade via click-chip popover (ConfigActions); expand as a trailing row. Retire Pipeline + Loadout.

## Decisions
- Scope: Shop + Configuring (both had Pipeline + RoleList duplication). Answering unaffected (rows only).
- Row actions: click config chip -> ConfigActions popover (Sell/Upgrade). Configuring keeps trailing remove (X).
- Empty slots -> muted dashed rows; Expand to N slots -> trailing row.

## Todo
- [x] PipelineReportRow: optional chip-as-ConfigActions popover + chip badge (new)
- [x] RoleList: slots (empty rows), actionsFor, newConfigIds, trailing
- [x] ShopScreen: drop Loadout, inline load-out header, use enriched RoleList
- [x] ConfiguringScreen: drop Pipeline, add slots to RoleList
- [x] Delete Pipeline.{ui,spec,stories} + Loadout.{ui,spec,stories}
- [x] Update RoleList stories (empty slots + shop actions)
- [x] lint + typecheck + specs + build

## Summary of Changes

- PipelineReportRow: chip renders as ConfigActions popover when chipActions given (shop sell/upgrade); optional chipBadge (new marker).
- RoleList: now the single pipeline view — empty slots as full-width dashed bars, per-row sell/upgrade popover (actionsFor), new badge (newConfigIds), trailing expand row, plus existing remove (X).
- ShopScreen: dropped Loadout; inlined load-out header; single enriched RoleList. Rewards moved BELOW the pipeline as an image-53-style line (+{gateReward}KB storage this gate, reward/coverage multipliers); removed MultiplierSummary from header and the Clears-for subtitle. Expand control is full-width and counts fixed+free slots (4 rows -> Expand to 5 slots).
- ConfiguringScreen: dropped Pipeline; RoleList gets slots (empty rows). Fixed two stale spec strings (Pick your config stack, Run rules).
- Tooltip: added className passthrough so the locked-expand trigger can go w-full.
- Deleted pipeline/{Pipeline,Loadout}.{ui,spec,stories} (folder retired).

Verified: tsc 0, lint clean (no arch violations), build ok, full suite 886 passed. 2 pre-existing failures remain (RewardScreen, StripScreen) — NOT caused by this work.

## Follow-ups (deferred)
- RewardScreen.spec + StripScreen.spec assert stale gate-report text (Gate success!/gate-1/gate-2) after the uncommitted terminal-esque GateRewardReport restyle. RewardScreen fails even at committed HEAD.
- BUG: GateRewardReport renders "Gate {n} cleared!" unconditionally — StripScreen (failed gate, cleared=false) shows FAIL badge + "cleared!". Should be conditional on cleared.
