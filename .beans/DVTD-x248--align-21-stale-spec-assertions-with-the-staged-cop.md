---
# DVTD-x248
title: Align 21 stale spec assertions with the staged copy/markup changes
status: completed
type: bug
priority: normal
created_at: 2026-08-12T14:39:54Z
updated_at: 2026-08-12T14:48:06Z
---

21 pre-existing red tests across 6 files assert copy and markup that the staged WIP (gives/needs copy rewrite, disclosure rows, RunHud info tooltips) changed on 2026-08-11. Code is the source of truth per Marciano; specs get aligned to it.

## Todo
- [x] config.model.spec.ts — needsOf/givesOf copy (3)
- [x] configRole.model.spec.ts — roleRows focus needs copy (1)
- [x] RoleList.spec.tsx — detail-cell markup (3)
- [x] StackPreviewList.spec.tsx — Then-prefix (1)
- [x] ConfiguringScreen.spec.tsx — stake sections/columns/stack mode (10)
- [x] RunHud.spec.tsx — info icon copy (3)
- [x] Full suite green, tsc, lint

## Summary of Changes

All 21 assertions aligned to the staged code (code was the source of truth throughout):
- needsOf copy: "Answer X polls correct when they show"; givesOf lost the "Then" prefix
- RoleList detail cell: .border-l selector -> .row-start-2 (FoldableRow disclosure redesign); fold-class expectations unchanged
- StackPreviewList: textContent function matcher for the emphasizeNumbers split
- ConfiguringScreen: "Remove 1 config" strip copy, "Pick your build" heading, bench identified by its instruction line (heading removed), fact-row !/v marks with cinnabar/celadon tones
- RunHud: new HudHint copy (gate blurb, storage-cap blurb); plan/bill copy left the HUD entirely, replaced the two plan tests with cap-reads-from-props tests

Verified: 121 files / 1465 tests passed, 0 failed. tsc clean, oxlint + depcruise clean (591 modules).
