---
# DVTD-cllf
title: 'Terminal theme: mobile variants for the late-run stories'
status: completed
type: task
priority: normal
created_at: 2026-09-01T09:36:42Z
updated_at: 2026-09-01T09:39:04Z
---

Each of the 11 Seafoam/Elite rich-data stories gets a Mobile companion: spread the story into the 390px container wrapper, same pattern as the existing Mobile stories.

## Summary of Changes

Appended a {Name}Mobile story to each of the 11 screens' stories files, spreading the late-run story (LateRun, BeforeElite, TaggedAtSeafoam, SeafoamShop, EliteGate, EliteReveal, SeafoamCleared, EliteHolds, AfterElite, FellAtElite, NearComplete) into the standard 390px wrapper decorator. EliteHoldsMobile inherits the stateful render via the spread, same as the existing Mobile of LavenderHolds.

Verified: lint + depcruise clean, story typecheck 0 terminal-theme errors, vitest 2622 passed / 3 pre-existing RewardScreen failures. Not committed.
