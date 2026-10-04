---
# DVTD-y3vn
title: 'Deepening pass: rules computed once, tested at their interface'
status: in-progress
type: epic
created_at: 2026-09-25T19:45:46Z
updated_at: 2026-09-25T19:45:46Z
---

**What:** Eight refactor slices, each its own PR, that make a rule live in one place and be tested through the function that owns it.

**Why:** The architecture review of 25 September found the gate close, the answer payout, the session read, the account grants, the screen props, the config status, the run cache and the equip rule each computed in several places, so a change is made twice and a screen can disagree with the engine.

## Done when
- [ ] Every child bean is completed
- [ ] Lint, typecheck and the full test suite pass on every slice
- [ ] The domain glossary names every module the slices introduced

## Notes
Plan: `~/.claude-work/plans/1-example-2-yeah-glowing-liskov.md` (per-slice facts, decisions, steps, specs, risks, docs rows). Baseline on commit `1c7c515c`: 199 spec files / 3802 tests, lint clean. Order: 2, 1, 3, 4, 5a, 5b, 5c, 6a, 6b, 7, 8. Decisions: Marciano commits before each slice starts; slice 3 keeps `withAuthenticatedUser` and adds `withAdminUser`.
