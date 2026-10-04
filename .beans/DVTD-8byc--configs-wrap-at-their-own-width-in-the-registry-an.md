---
# DVTD-8byc
title: Configs wrap at their own width in the Registry and shop Build
status: completed
type: task
priority: normal
created_at: 2026-09-25T11:31:51Z
updated_at: 2026-09-25T11:35:54Z
---

**What:** The shop and new-run screens stop stretching config chips across their column and let them sit at the width they need, wrapping like the poll screen's Build footer and the Dex rows.

**Why:** A full-width row makes a short name read as wide as a long one, so five offers look like a form rather than a shelf.

## Done when

- [x] The Registry lists its offers as wrapping chips, each at its own width
- [x] The Build panel opposite it wraps the same way on both screens
- [x] Every install press still states its price at rest
- [x] A story shows the Registry inside a real half-width column, not at full screen width
- [x] Lint, typecheck and the suite pass

## Notes

Decided with Marciano: wrap both columns, keep the price always visible.

## Summary of Changes

Six lines of production change, all deletion of an opt-out.

- `Registry.ui.tsx`: the list became `flex w-full flex-wrap items-center gap-3` and `Offer` dropped `width="full"`, so a chip falls through to its own `fit` default. No new prop: both call sites want wrap.
- `ShopScreen.ui.tsx` and `NewRunScreen.ui.tsx` dropped `BUILD_LAYOUT = "column"`, letting `Build` keep its own `wrap` default.
- `ShopScreen.spec.tsx` had a test pinning the opposite behaviour. It now asserts both a build chip and an offer are unstretched and inside a wrapping row, anchored on the `About <name>` press because a chip renders its info panel even while shut, so the name alone matches twice.
- `Registry.spec.tsx` gained the same assertion; `rowOf` became `chipOf` and "dims the row" became "dims the chip", nothing being a row any more.
- `Registry.stories.tsx` gained `InAShopColumn`, which renders the shelf in one half of the shop grid. The earlier stories all sit at full screen width, where a wrapped chip's `w-80` info panel can never be seen colliding with the column beside it.

`Build`'s `column` arm stays. It has no production caller now, but it is what the specs exercise and the one-word way back.

Verified: 3750 tests in 198 files pass, oxlint clean (four warnings predate this, in untouched files), dependency-cruiser clean, `tsc --noEmit` clean, prettier clean, wiki in sync. `release.ts --dry-run` parses the changelog entry.

Not verified: the look itself. One known risk left for the eye — `ConfigInfo` is `w-80` and anchors `sm:left-0` to the chip, so an offer sitting mid-row opens its panel over the column beside it. Nothing clips it, and the poll screen's wrapped Build already behaves this way, but the shop columns are narrower. `InAShopColumn` and `OneInfoOpen` at the `md` breakpoint are where to look. The fix, if it reads badly, is an `align` on `ConfigChip`'s `PANEL` mirroring `Tooltip`'s existing one.
