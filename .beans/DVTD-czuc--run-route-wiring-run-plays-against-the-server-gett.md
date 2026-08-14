---
# DVTD-czuc
title: 'run route wiring: /run plays against the server (getTodaysRun/startRun/dispatchRunAction)'
status: completed
type: feature
priority: normal
created_at: 2026-07-17T13:21:12Z
updated_at: 2026-07-17T17:55:07Z
---

Recreates the vanished DVTD-08ve. Wire the run rebuild to the slice-1 server layer: authed route /run renders RunGame.component (Tier 2, zero HTML) which drives the Tier-1 screens from the server RunView via TanStack Query. RunView extended with disabledOptionIds/lintCost/rebuildCost/canRebuild/slotCoverageRequired/canAddSlot so the client never needs RunState. proto-run stays as the client-side prototype.

## Summary of Changes

Shipped + verified 2026-07-17:
- RunView extended (disabledOptionIds, lintCost, rebuildCost, canRebuild, slotCoverageRequired, canAddSlot) so the client derives nothing from RunState; viewmodel spec extended.
- New: presentation/game/RunGame.component.tsx (Tier 2: useQuery + start/dispatch mutations via sessionRunQueryKeys.today, setQueryData with returned view), presentation/run/HudBar.ui.tsx, routes/_authed/run.tsx, sessionRunQueryKeys in domains/shared/queryKeys.ts.
- Won/dead screen drops play-again (ADR-009: fresh seed tomorrow), notes leftover storage is archived.
- Dev DB: applied both slice-1 migrations + targeted additive mode-column fix (dev DB had drifted; see DVTD-jskv for the migration-strategy cleanup).
- E2E verified by Marciano playing on dev: mid-run reload resumes; DB shows run_states updating live (run 63, gate 3, 15 polls answered), daily seed materialized with 50 polls, calendar rows untouched. Finish-path archived_storage credit is unit-tested; visible in DB whenever a run completes.

Build, lint+arch, 759 tests green.
