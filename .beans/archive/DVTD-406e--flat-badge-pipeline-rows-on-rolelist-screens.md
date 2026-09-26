---
# DVTD-406e
title: Flat-badge pipeline rows on RoleList screens
status: completed
type: feature
priority: normal
created_at: 2026-07-24T11:11:31Z
updated_at: 2026-07-24T11:18:27Z
---

Apply the GateRewardReport flat-badge row style (StatusBadge + ConfigChip + description + right value) to RoleList, replacing the accent-bar PipelineRowList style. Affects Shop (Upgrade your pipeline), Answering, Configuring screens.

## Decisions
- Solid badges mapped from state: running -> RUN, skipped -> SKIP, success -> PASS, failed -> FAIL, perk (no state) -> PERK. New StatusBadge variants run/perk.
- Unify all three RoleList screens (not shop-only).

## Todo
- [x] Extend StatusBadge with run + perk variants (+ min-width for column alignment)
- [x] Extract shared PipelineReportRow.ui (badge + chip + description + value + trailing)
- [x] Refactor GateRewardReport to use PipelineReportRow
- [x] Rewrite RoleList to flat-badge style via PipelineReportRow
- [x] Update StatusBadge story with new variants
- [x] lint + typecheck + tests + build

## Summary of Changes

- StatusBadge.ui.tsx: added run (RUN, bg-cerulean) and perk (PERK, bg-lavender) variants; added min-w-14 so the badge column stays aligned when a label is shorter (RUN). Updated doc comment + story.
- PipelineReportRow.ui.tsx (new, Tier 1): shared flat row = StatusBadge + ConfigChip + description + right-aligned value + optional trailing. Single source of the row layout.
- GateRewardReport.ui.tsx: ReportRow now delegates to PipelineReportRow (no behavior change).
- RoleList.ui.tsx: rewritten to the flat-badge style via PipelineReportRow, dropping the accent-bar PipelineRowList. state->badge map: running RUN, skipped SKIP, success PASS, failed FAIL, perk (no state) PERK. Applies to all three RoleList screens (Shop/Upgrade, Answering, Configuring).
- CheckList/PerkList (RunHud, GateRequirementList) intentionally unchanged — they keep the accent-bar style.

Verified: tsc --noEmit exit 0, npm run lint clean (no arch violations), gate + StatusBadge specs pass, npm run build succeeds. Visual check via Storybook (Run/RoleList, UI/StatusBadge) pending — browser automation extension was unresponsive.
