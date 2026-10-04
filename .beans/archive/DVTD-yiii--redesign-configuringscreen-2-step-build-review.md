---
# DVTD-yiii
title: 'Redesign ConfiguringScreen: 2-step build review'
status: completed
type: feature
priority: normal
created_at: 2026-07-15T11:33:37Z
updated_at: 2026-07-15T11:39:49Z
---

Restructure ConfiguringScreen into two numbered steps (Pick your stack / Review your build). Add a RUN STAKES summary box (derive gates/requirement/reward from run data, static fail-penalty prose; Subtitle font). Replace GateRequirementList with typed badge rows: REQUIREMENT/CONDITIONAL/PERK, derived from a pure roleOf helper (focusCategory=conditional, backs-check=requirement, else perk). No 'becomes' divider.

## Summary of Changes

- New pure helper gate/configRole.model.ts (+ spec): roleOf (focusCategory=conditional, backs-check=requirement, else perk), roleRows, stakesRequirement.
- New UI: RoleList.ui.tsx (typed badge rows + remove control), RunStakes.ui.tsx (Subtitle-font header), StepHeading.ui.tsx (numbered circle).
- Rewrote ConfiguringScreen.ui.tsx into two numbered steps; dropped Loadout + GateRequirementList from this screen (files still used elsewhere). Wired victoryGate in proto-session-run route.
- Unslot preserved via remove control on non-fixed rows. 12 tests pass, lint + typecheck clean.
