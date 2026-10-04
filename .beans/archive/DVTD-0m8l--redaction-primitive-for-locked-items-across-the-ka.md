---
# DVTD-0m8l
title: 'Redaction primitive: ''???'' for locked items across the kanto kit'
status: completed
type: feature
priority: normal
created_at: 2026-09-09T10:53:53Z
updated_at: 2026-09-09T10:54:12Z
---

Reusable visual gate for content the player has not unlocked. Shows ??? in place of every attribute that carries identity, applied to Audit and ConfigChip now, Poll and Swatch later.

- [x] Redaction.ui.tsx: REDACTED, Redactable<T>, Redaction component
- [x] Audit takes Redactable props, redacts code/name/cue, keeps saffron
- [x] ConfigChip takes Redactable props, drops name/version/badges/colour
- [x] Specs for the primitive and both locked components
- [x] Storybook: Kanto/Redaction entry plus Locked stories per component
- [x] lint + typecheck (app + stories) + tests

## Summary of Changes

New `src/ui/kanto-theme/Redaction.ui.tsx` exporting `REDACTED` (`"???"`), the `Redactable<T>` prop shape and the `Redaction` component. `Audit` and `ConfigChip` now take `Redactable` props; `Poll` and `Swatch` are the named future surfaces.

- The locked branch of `Redactable<T>` maps every field of `T` to `?: never`, so a caller cannot pass the secret alongside `locked`. `locked?: false` is optional, so no existing call site changed.
- A locked `Audit` redacts code, name and cue but keeps its saffron ground: being a hazard is not the secret, only which one.
- A locked `ConfigChip` drops name, version and badges entirely. One `???` badge would falsify the number of effects, and the badge hue names the family.
- One `sr-only` label per gated item rather than per redacted field, so a screen reader hears "Locked audit" once instead of three times.
- Storybook: new `Kanto/Redaction` entry with `LockedBesideUnlocked` (a grid of unlocked against locked for Audit, ConfigChip and Swatch), `WhatEachItemWithholds` and `AcrossThemes`; plus `Locked` and a partly-unlocked roster story on both component entries.

Verified: `npm run lint` clean (861 modules), `tsc --noEmit` clean, no kanto story type errors, `npm test` 205 files / 3559 passed (17 new) / 6 skipped / 2 todo.

Not built: the hook that decides what is unlocked. That reads the account unlock ledger and belongs in Tier 2 or the application layer, not in a `.ui.tsx` file that takes plain props.
