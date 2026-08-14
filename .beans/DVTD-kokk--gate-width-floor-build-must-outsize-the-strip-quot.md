---
# DVTD-kokk
title: 'Gate width floor: build must outsize the strip quota'
status: completed
type: feature
priority: normal
created_at: 2026-08-10T15:08:34Z
updated_at: 2026-08-10T20:37:46Z
---

A gate demands a build of at least dropCount(gate)+1 configs — the smallest width that can survive its own stake. Kills the 1-config cheese (checks come only from configs, so thinness shrank the checklist; demonstrated live at Soul gate 2026-08-10). Floor enforced at gate entry + shop guard generalizes holdsLastConfig; replays after a strip exempt (ADR-021 owns that spiral). Also kills drop-during-answering (mid-window check-shedding). Amends ADR-017 §3 (bareness rule scales from ≥1 to ≥floor), ADR-021 §3, touches ADR-019 wording.

- [x] minConfigsForGate in rules.model + spec
- [x] Entry enforcement in run.model (finish-reward under the demand = death at the gate, warned in cinnabar) + spec
- [x] start already demands a full pipeline — stricter than any early demand, no change needed
- [x] Shop guard: sell/deinstall refused below next gate's demand (atMinimumWidth) + spec
- [x] Drop is doorstep-only while answering (window.answered === 0) + spec
- [x] Demand line in the Build Summary (muted met / cinnabar under) + shop tooltip + proto-run button label
- [x] ADR-027 (+ markers in 017/019/021, README index)
- [x] CHANGELOG + wiki updated

## Summary of Changes

Shipped 2026-08-10. Curve tuned same-day by Marciano mid-implementation: `minConfigsForGate = min(gate, dropCount + 1)` — early ramp (Pallet 0, Boulder 1, Cascade 2, Thunder 3) keeps the opening gates farmable and lets a broke post-strip run recover; from gate 4 it follows one-over-the-strip-quota to 8 at the summit. Entry enforcement kills at the gate door (finishReward); replays after a strip exempt. `holdsLastConfig` generalized to `atMinimumWidth` with the last config as the hard bottom on early gates. Mid-window drop (check-shedding exploit) closed via doorstep-only guard. UI: Build Summary demand line, shop tooltip, PrepScreen chip locks, proto-run death-warning button label, UnderWidthDemand stories. Docs: ADR-027 + amendment markers, wiki §2.2, CHANGELOG.

Pre-existing test failures on the branch (14, verified also failing at HEAD or in unrelated WIP files) were left alone: lint-pledge check, RoleList folds, RunHud info icons, ConfiguringScreen labels/stack preview, config gives/needs.
