---
# DVTD-gj7j
title: Draw the build weight as a named, coloured bar
status: completed
type: feature
priority: normal
created_at: 2026-09-15T08:41:35Z
updated_at: 2026-09-15T09:02:57Z
---

A fourth kanto weight shape: one contiguous bar, a segment per config, each in its own colour, with the config's name and weight printed inside. Reads at a glance without hovering, which SlotTrack, WeightTrack and CoverageBar cannot do.

Decided with Marciano before building:
- the number is build weight (slots), the ADR-082 axis, not storage KB
- new sibling; `WeightTrack` untouched and still serves `Build`
- segment colour cycles a fixed ramp of KANTO_COLORS and means "a different config", nothing more (the mock's two 2-weight segments are different colours, so it is not the ADR-055 size ramp)

Named `WeightBar`, not `StorageBar`: "storage" is live in this codebase and means KB (`MetaStorageBar`, `StorageGauge`, CONTEXT.md).

## Todo

- [x] Add paired `segment-theme` utility to `src/styles/app.css` (bright fill, dark hue-matched ink; `badge-theme` is the inverse)
- [x] Fold the labelled bar into `src/ui/kanto-theme/WeightTrack.ui.tsx` (no sibling)
- [x] Rewrite `WeightTrack.spec.tsx` (36 tests)
- [x] Rewrite `WeightTrack.stories.tsx`
- [x] Hover popup: a segment opens the configs own ConfigInfo panel
- [x] Switch the new run screen off the slots arm onto weight
- [x] Verify: full suite, lint, build, story sweep, built-CSS emission

## Summary of Changes

The bar is a segment per config, grown by `flexGrow: slots`, each carrying the configs name and its weight inside it, in its own colour from a fixed ramp.

**Merged into `WeightTrack`, not shipped as a sibling.** An earlier `WeightBar` was built and then deleted on Marcianos call; `WeightTrack` keeps its name, its `held` prop, the dashed room tail and `roomLineOf`, so `Build` and the shop were untouched by the swap.

### `src/styles/app.css`

One new paired utility, `segment-theme`: `badge-theme` inverted (bright fill, dark hue-matched ink). Sampling the mock showed every fill at L 0.764 and every ink at L 0.386 regardless of hue, i.e. the same construction `badge-theme` documents. That exact pair reads 4.29:1 on cerulean, under AA, so the ink is held at L 0.3 for 5.89:1 at the worst hue. Same call `ring-theme-soft` records.

### `WeightTrack.ui.tsx`

- Contiguous flex segments (`basis-0` + `flexGrow`), replacing the absolutely-positioned gapped blocks. Floats work for free.
- Labels degrade by share of the axis: name + figure at 12%, figure alone at 5%, nothing below. An `sr-only` line carries the full text at every width, so the degradation never reaches a screen reader.
- `SEGMENT_RAMP` orders `KANTO_COLORS` for hue separation; a naive walk puts `pallet` (hue 150) beside `viridian` (145) and renders two identical greens.
- `fill.info` mounts the configs own `ConfigInfo` on hover, using ConfigChips `group/info` CSS-only pattern. It right-aligns past the middle of the bar.
- **The bar carries no `overflow-hidden`** — that would clip the popup. Rounded ends moved onto `first:`/`last:` segments instead.

### Reach

- `Build.fillOf` threads `config.info` into the fills, so the popup works on every screen that draws a build.
- `Build` now forwards `caption` to `WeightTrack`. It only ever forwarded it to `SlotTrack`, so `NewRunScreen`s `caption: false` was silently ignored — latent, and only visible once the weight arm printed a room line.
- The new run screen moved off the `slots` arm onto `weight`, so it draws the bar instead of dashed vacancy boxes. Its heading reads `0 of 4 weight · 4 free`, which matches the panels own footer prose; it previously said `slots`.
- The shop was already on the `weight` arm and picked the bar up with no change.

### Verification

4266 passed, 2 failed (`gate.model.spec.ts` "the floor rule" — pre-existing, reproduced with these changes stashed, both files untouched at HEAD). Lint clean, depcruise clean (980 modules), `npm run build` green, story sweep clean (30 pre-existing errors, none in the touched files, no bare identifiers), and every new utility confirmed present in the built CSS.

### Left open

`Build`s `slots` arm (`SlotTrack`, `Vacancy`, `occupancyFillOf`, `track`) now has no live caller — only `Build.stories` and `SlotTrack.stories`. Worth a follow-up bean to delete it.
