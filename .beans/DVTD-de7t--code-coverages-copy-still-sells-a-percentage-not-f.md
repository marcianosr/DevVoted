---
# DVTD-de7t
title: Code Coverage's copy still sells a percentage, not flat units
status: todo
type: bug
priority: normal
created_at: 2026-09-15T13:17:58Z
updated_at: 2026-09-15T13:17:58Z
parent: DVTD-72d9
---

ADR-083 made Code Coverage a flat +0.1 unit that no multiplier amplifies, and the wiki says so, but the roster still tells the player otherwise: configRoster.model.ts description reads 'Every correct answer is worth 10% more coverage.' and gives reads 'Correct answers pay +10% coverage'. Both are player-visible and both describe the pre-083 multiplier. RoleList.spec.tsx:36 pins the 'gives' string, so the fix touches that spec too. Found while adding .prettierrc (DVTD-dfyy), whose own copy states the flat rule correctly - the two configs now contradict each other on the same screen.
