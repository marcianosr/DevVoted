---
# DVTD-4fxt
title: 'ADR-029: does Lock belong on the run-start deal?'
status: draft
type: task
priority: low
created_at: 2026-08-23T16:42:13Z
updated_at: 2026-08-23T16:42:13Z
---

ADR-029 §4 stages the shop controls: "The opening shop shows Rebuild only; Lock and Extend arrive a gate apart."

The modern-theme start screen (DVTD-7gty, Marciano's mock #98) shows Rebuild and Lock together at run start. The reading is coherent — Rebuild is paid from the archive rather than run storage, so a reroll at run start is a real decision and a lock is what makes it one — but it contradicts the written staging.

Decide one:
- [ ] Amend ADR-029 §4: the run-start deal is not "the opening shop", and Lock applies to it
- [ ] Or drop the lock column from the start screen and keep the staging as written

Not urgent: nothing is routed. Blocks nothing.

Related: `src/ui/modern-theme/screens/StartScreen.ui.tsx` (`lock` prop is optional, so dropping it is one story edit).
