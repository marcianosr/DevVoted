---
# DVTD-v1qf
title: 'Kanto polish: glyph button width, shelf control type scale, uninstall copy'
status: completed
type: task
priority: normal
created_at: 2026-09-10T07:50:04Z
updated_at: 2026-09-10T07:56:31Z
---

Mock-review fixes on the kanto kit: glyph Buttons render as tall pills because BUTTON's w-fit overrides GLYPH_SHAPE's size-*; ShelfControl's title sits a rung above the config names it should match; Uninstall's eyebrow is hardcoded uppercase and its ledger labels are muted rather than default text. Plus a Screens group in Storybook for PollScreen and ShopScreen.

## Summary of Changes

- `Button.ui`: `w-fit` moved off the shared base onto `FIGURES` (label + capped shapes only). Tailwind emits `.w-fit` after `.size-*` in the same layer, so a base `w-fit` won the specificity tie and collapsed every glyph button to the width of its glyph while it kept its full height — the × and (i) presses rendered as tall pills. Two specs pin it: a glyph button carries `size-5` and no `w-fit`; a labelled one carries `w-fit h-5`.
- `Typography`: new `subtitle` variant — `text-sm font-bold`, tag `h2`, faint tone. Title one rung down, minus the tracking, for a control name that has to read at the size of the rows it sits among. Added to the spec tables, the ramp story and the variant control.
- `ShelfControl`: title moves from `title` to `subtitle`, so Rebuild/Extend read at config-name size instead of a rung above the shelf.
- `Uninstall`: eyebrow lowercased to `uninstall` (the kit has no shouted copy; the capitals were in the string). Ledger labels move from `text-theme-muted` to `text-theme-faint`.
- Storybook: PollScreen and ShopScreen regrouped under `Kanto/Screens/`.

Verified: `npm test` 220 files / 3861 passed / 6 skipped / 2 todo; `npm run lint` clean (909 modules, one pre-existing Screen.stories warning); `tsc --noEmit` clean; stories typecheck at the pre-existing 30, none in kanto-theme; prettier clean.

## Open

`Modal` still builds its own scrim and panel rather than wrapping `<dialog>`. jsdom 29.1.1 has `HTMLDialogElement` but no `showModal`/`close`/`show`, and three spec files in this repo already hand-stub the prototype. Not changed here.

## Summary of Changes

- **`Button.ui.tsx`** — `w-fit` moved off the shared base onto `FIGURES` (which every label and capped shape already carries). Tailwind v4.3.3 emits `.w-fit` after `.size-*` in the same layer, so the base `w-fit` was winning the tie and rendering glyph buttons at the width of their glyph with the height of a label button — the `×` and `i` presses read as pills. Two specs pin it: a glyph button keeps `size-5` and carries no `w-fit`; a labelled button keeps `w-fit h-5`.
- **`Typography.ui.tsx`** — new `subtitle` variant: `text-sm font-bold`, tag `h2`, faint tone. Title one rung down, without title's `tracking-wide`, for a control name that has to read at the size of the rows it sits among. Added to the spec's tag/style/tone tables and to the stories Ramp.
- **`ShelfControl.ui.tsx`** — title moves from `title` to `subtitle`, so "Rebuild the shelf" reads at the size of the config names above it instead of a rung larger.
- **`Uninstall.ui.tsx`** — eyebrow drops to lowercase (`uninstall`), matching the kit; ledger labels move from `text-theme-muted` to `text-theme-faint`. Eyebrow spec now selects by tag, since the confirm button answers to the same word.
- **Storybook** — `PollScreen` and `ShopScreen` grouped under `Kanto/Screens/`.

Verified: `npm test` 220 files / 3861 passed / 6 skipped / 2 todo; `npm run lint` clean (909 modules, one pre-existing `Screen.stories.tsx` unused-param warning); `tsc --noEmit` clean; stories typecheck at the 30 pre-existing errors with none in kanto-theme; prettier clean on every touched file.

## Open

`Modal.ui.tsx` is still a div-based scrim + panel rather than a native `<dialog>`. Discussed but not changed: it would trade Tier-1 purity for a real focus trap, Esc-to-close and top-layer stacking. Follow-up if wanted.
