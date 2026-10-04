---
# DVTD-a6yf
title: Upgraded focus config still shows L1 text; Upgrade hover lacks effect preview
status: completed
type: bug
priority: normal
created_at: 2026-08-04T16:25:23Z
updated_at: 2026-08-04T16:36:52Z
---

Upgrading a focus config bumps level (badge shows L2, mechanics scale), but the row still reads the roster's static L1 gives/needs strings ('Get 1 JavaScript poll right / Then JavaScript polls earn ×1.5'). Also: hovering the Upgrade button should preview what the next level does, in both unlocked and gated states.

- [x] Derive gives/needs from level for focus configs (extend the describeConfig pattern)
- [x] Route roleRows and draft-offer rows through the derived helpers
- [x] Upgrade tooltip shows next-level effect; gated state keeps the coverage requirement line
- [x] Remove stray console.log(config) in effect.model.ts (debug leftover)
- [x] Specs updated; lint + typecheck + tests pass

## Summary of Changes

- `config.model.ts`: added `givesOf`/`needsOf` — focus configs derive their gives/needs copy from `level` (same move as `describeConfig`); non-focus configs pass authored roster copy through.
- `configRole.model.ts` (roleRows), `ShopScreen.ui.tsx` (draft offers), `RoleList.ui.tsx` (ghost preview) now read via the helpers.
- `configRoster.model.ts`: removed the dead static L1 gives/needs from all 10 focus entries (root cause: two sources of truth). Side effect: the package.json config gives line now reads General Frontend (matches its description).
- `ShopScreen.ui.tsx`: Upgrade button is always tooltipped — content previews the next level via describeConfig at level+1; gated state appends the coverage requirement with the category in its Kanto color.
- `effect.model.ts`: removed stray console.log(config).
- Specs: flipped the authored-needs-precedence test to level-derivation, added givesOf/needsOf coverage, updated + added ShopScreen tooltip tests. 1021 tests pass, oxlint + depcruise + tsc clean.
- Docs: wiki §4.4 sentence on the hover preview; CHANGELOG Unreleased shop bullet amended.

Follow-up (same day): gives copy now names its unit — "Then JavaScript polls earn ×2.5 coverage" (was bare "×2.5"). Specs + CHANGELOG updated.
