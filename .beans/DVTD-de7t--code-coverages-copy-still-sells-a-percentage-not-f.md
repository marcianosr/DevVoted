---
# DVTD-de7t
title: Code Coverage's shop text promises a percentage it no longer pays
status: todo
type: bug
priority: normal
created_at: 2026-09-15T13:17:58Z
updated_at: 2026-09-24T12:49:10Z
parent: DVTD-72d9
---

**What:** Fix Code Coverage's roster text, which still sells +10% coverage.

**Why:** It pays a flat amount now, and it contradicts another config sitting on the same screen.

## Done when
- [ ] The description and the gives line state the flat amount
- [ ] The spec pinning the old wording is updated
- [ ] No other config's text still calls it a percentage

## Notes

ADR-083 made Code Coverage a flat +0.1 unit that no multiplier amplifies, and the wiki says so, but the roster still tells the player otherwise: configRoster.model.ts description reads 'Every correct answer is worth 10% more coverage.' and gives reads 'Correct answers pay +10% coverage'. Both are player-visible and both describe the pre-083 multiplier. RoleList.spec.tsx:36 pins the 'gives' string, so the fix touches that spec too. Found while adding .prettierrc (DVTD-dfyy), whose own copy states the flat rule correctly - the two configs now contradict each other on the same screen.
