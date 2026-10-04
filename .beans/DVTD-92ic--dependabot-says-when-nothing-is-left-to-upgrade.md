---
# DVTD-92ic
title: Dependabot says when nothing is left to upgrade
status: completed
type: bug
created_at: 2026-10-02T17:27:05Z
updated_at: 2026-10-02T17:27:05Z
---

**What:** With every config at its top version, Dependabot kept counting and reset silently on the fifth right answer.

**Why:** Eight weight of build looked busy while doing nothing, so the player had no reason to sell it.

## Done when
- [x] Dependabot stops counting when nothing in the build can be upgraded
- [x] Its poll chip reads nothing left to upgrade in pewter
- [x] Its shop chip says the same

## Notes
- hasUpgradeLeft in autoUpgrade.model.ts; nothingToUpgrade skip reason and context flag in configStatus.model.ts; idleUpgraderBadgesFor in configChip.viewmodel.ts feeds the shop build chip.

## Summary of Changes
Count gated on hasUpgradeLeft; new skip reason and chip words; shop badge; specs, wiki, CHANGELOG.
