---
# DVTD-ie68
title: Restructure Button cva config to remove conflicting classes
status: completed
type: task
priority: normal
created_at: 2026-08-04T07:46:32Z
updated_at: 2026-08-04T07:49:31Z
---

The cva config in src/ui/Button.component.tsx is hard to follow: primary's styles are scattered across empty variant slots and compoundVariants, and size classes conflict with primary's compound sizing (px-4 vs px-6, text-sm vs text-base), relying on Tailwind stylesheet order to resolve. Restructure so each output class comes from exactly one place, preserving rendered behavior.

- [x] Restructure cva config (conflict-free)
- [x] Verify resolved class output matches current effective styles
- [x] Tests, lint, typecheck pass

## Summary of Changes

Restructured the cva config in `src/ui/Button.component.tsx` so no two sources emit the same Tailwind property for the same prop combination:

- `size` variant slot emptied (registration-only, same idiom as `isDisabled`/`isSelected`); all sizing moved to `compoundVariants`.
- Non-primary sizing uses a cva array match: `variant: ["secondary", "theme", "danger", "neutral"]`.
- Compound entries grouped: sizing, then primary fill, then toggle state.

Verified behavior-preserving via a scratch script diffing old vs new resolved class sets for all 40 prop combos: only removals are the former conflict-losers on primary (`px-4 py-2 text-sm` default, `py-1.5` small); the winning classes are identical. Tests 998 passed / 106 files, lint + depcruise + tsc clean.
