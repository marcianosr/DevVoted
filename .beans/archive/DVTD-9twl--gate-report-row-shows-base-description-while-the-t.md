---
# DVTD-9twl
title: Gate report row shows base description while the target escalates
status: completed
type: bug
priority: normal
created_at: 2026-07-25T15:01:20Z
updated_at: 2026-07-25T15:06:05Z
---

DVTD-7wy6 fixed the escalated-demand text for roleRows (RoleList/CheckList), but the gate report surface (GateRewardReport → gateRewardRows → checkRow in src/modules/run/gate/gateReward.model.ts) still renders the static config.description ('Requires 1 correct answer to pass the gate.') next to an escalated progress like 2/3. Fix: route checkRow through gateRowDescription so the check's dynamic demand wins.

## Summary of Changes

`checkRow` in `src/modules/run/gate/gateReward.model.ts` now derives its description via `gateRowDescription` (the DVTD-7wy6 helper), so the gate report states the escalated demand ('Requires 3 correct answers to pass the gate.' at 2/3 progress) instead of the static roster text ('Requires 1 correct answer…'). The find-by-sourceConfigId moved inside `checkRow` so it can compute the config's role. Fallback for checks without a demand goes through `describeConfig`, which honors upgraded levels. Two new specs mirror the configRole surface: escalated demand and no-demand fallback. `gateRowDescription`'s doc comment now lists the gate report as a consumer. No changelog entry — both the report screen and the escalation text are unreleased work.
