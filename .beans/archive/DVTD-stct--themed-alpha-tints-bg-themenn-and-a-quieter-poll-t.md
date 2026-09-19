---
# DVTD-stct
title: Themed alpha tints (bg-theme/NN) and a quieter poll trail
status: completed
type: task
priority: normal
created_at: 2026-09-11T11:22:58Z
updated_at: 2026-09-11T11:43:59Z
---

Two poll-screen fixes.

## 1. `bg-theme/20` emits nothing

`bg-theme` / `text-theme` / `border-theme` are *static* `@utility` blocks in
app.css. Static utilities take no `/opacity` modifier, so `ConfigChip`'s
`bg-theme/20` (already in the source) is inert — Tailwind emits no rule at all.

Fix: register the colour as a theme token so Tailwind generates the whole
family plus every opacity variant.

```css
@theme inline {
	--color-theme: var(--theme-color);
}
```

`inline` is load-bearing: without it Tailwind pins `--color-theme` at `:root`
and every themed element resolves to the root cerulean.

The three hand-written statics must go, or each class is emitted twice.
`bg-theme-soft` / `bg-theme-faint` / `glow-theme` stay hand-written: they
compute an `oklch()` rather than tinting the colour.

This reverses the ConfigChip spec's "chroma is crushed, not an alpha of the
full colour" assertion.

## 2. The trail dots crowd the answered polls

`Trail` puts a `·` between every pair of steps, including either side of a
badged (answered) step. A badge is already a filled box; the dot separates two
bare numbers and nothing else.

## Todo

- [x] Register `--color-theme` under `@theme inline`
- [x] Delete the duplicated `@utility bg-theme` / `text-theme` / `border-theme` (plus ring/outline/accent)
- [x] Point Typography.spec's tone check at the token, not an `@utility`
- [x] Reverse ConfigChip.spec's crushed-chroma assertions to the alpha tint
- [x] Drop the Trail separator beside any answered step
- [x] Lint, typecheck, tests

## Summary of Changes

`--color-theme` is registered under `@theme inline`, so Tailwind generates the whole themed colour family (`bg-`, `text-`, `border-`, `ring-`, `outline-`, `accent-`, `stroke-`, `fill-`) plus every `/opacity` variant via `color-mix()`. Six hand-written statics deleted as newly-duplicated: `bg-theme`, `text-theme`, `border-theme`, `ring-theme`, `outline-theme`, `accent-theme`. Everything computing an `oklch(from ...)` stays.

Four specs pinned the old world, all four fixed at the root rather than loosened:

- `Typography.spec` asserted `@utility text-theme {` exists; now asserts the token declares it.
- `ConfigChip.spec` pinned `bg-theme-raised` under the name "a tint whose chroma is crushed, not an alpha of the full colour" — the decision this reverses. Rewritten to match, with a `tintOf` helper that reads the `bg-theme/` prefix so live-tuning the alpha does not break it.
- `Build.spec` and `ShopScreen.spec` located the ConfigChip by `.bg-theme-raised`; switched to `[class*="bg-theme/"]`.

`Trail` renders a `·` only between two unanswered steps, via a `separates` predicate fed this step's verdict and the previous one's. A badge is already a filled box.

Verified: 4383 tests pass (245 files, 6 skipped, 2 todo), `npm run lint` clean (1 pre-existing warning in Screen.stories.tsx), `tsc --noEmit` exit 0.
