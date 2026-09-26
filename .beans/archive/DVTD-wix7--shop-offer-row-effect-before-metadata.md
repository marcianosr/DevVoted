---
# DVTD-wix7
title: 'Shop offer row: effect before metadata'
status: completed
type: task
priority: normal
created_at: 2026-08-31T09:32:31Z
updated_at: 2026-08-31T09:39:38Z
---

The shop offer row leads with metadata (slot glyph, price) and hides what the config actually does behind the fold. Flip it: name + effect sentence on the top line, slots + preview deltas + price on a second, quieter line.

Mockup (Marciano, 2026-08-31):

```
Deprecated      All coverage earns x3, fading x0.5 per clear
4 slots  +0.4 cov  +8 KB                            128 KB
```

Decisions taken with him:
- effect line text is `givesOf(config)` (existing gives/costs vocabulary); `costs` stays in the fold
- install-preview delta chips move to the metadata line, next to slots
- offers only for now; "Your build" rows keep the single-line shape

## Todo
- [x] Entry.ui gains an optional `gives` line that re-lays the row in two lines
- [x] ShopView passes givesOf(config) and drops RowFigures from the offer row
- [x] Story for the two-line offer shape
- [x] Specs for line order and figure placement
- [x] lint + typecheck + tests

## Summary of Changes

- `Entry.ui.tsx`: optional `gives` prop. Absent, the row renders exactly as before (`OneLine`); present, it renders `TwoLine` — name + effect on a baseline-aligned top line, size + preview deltas + figure on a centred meta line, figure pushed right with `ml-auto`. The name column is a fixed `w-32` so effect sentences line up down a list. The figure moves out of `Row`s trailing slot into the meta line, which keeps PriceTags `group-open/entry` open/shut swap working since the whole thing is still inside the `<summary>`.
- `ShopView.component.tsx`: offer rows pass `gives={givesOf(config) ?? config.description}` and the bare `PriceTag` as `value`; `RowFigures` is gone from the offer row (still used by StartScreen).
- Specs: `Entry.spec` covers line order and the effect staying on a shut row; `ShopView.spec` covers effect-before-size-and-price on the real roster data.
- Stories: new `Modern/Entry > Offer`; the modern-theme shop shelf story now carries slots + effect per offer (its numeric `gives` field renamed `perCorrectKb` to free the name).
- CHANGELOG: one Unreleased entry.

Verified: `npm run lint` clean (786 modules, no dependency violations), `npm run build` (vite + `tsc --noEmit`) clean, touched specs 76/76 pass, full suite 2616 pass / 3 fail — the three failures are pre-existing in `RewardScreen.spec.tsx` (swatch naming, shortfall, kept/earned) and share no module with this change. Stories typecheck confirmed with a scratchpad tsconfig that clears the `**/*.stories.tsx` exclusion: no errors in the two story files touched.

Build rows in Your build keep the single-line shape, as decided.
