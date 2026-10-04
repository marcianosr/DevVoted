---
# DVTD-c8jy
title: src/ui primitives carry dead props and unreachable variants
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T16:03:30Z
parent: DVTD-82c4
---

Interface bloat in the global primitives: callers must learn options that do nothing.

## Screen.ui.tsx — 9 props, 43 call sites

```ts
// :32-36
width: {
  narrow:  "sm:max-w-2xl",
  default: "sm:max-w-6xl",
  wide:    "sm:max-w-6xl",   // byte-identical to default
}
```

`width="wide"` at 5 sites (`Dex.component.tsx:53,62`, `DexScreen.ui.tsx:22`, `RunShop.component.tsx:25`, `proto-run.tsx:568`) renders exactly as omitting it. Three values, two behaviours.

- `transition` — 5-value union, **zero production call sites**. It is always overwritten by `peekScreenNavDirection()` (:92-95), which can only yield `slide-right` / `slide-left`. `fade` and `slide-up` are reachable only from the spec and from `app.css:634,642`
- `center` — zero call sites
- The `rightAction` `<Button>` block is written twice verbatim (:160-166 and :169-175), once inside the `Popover` branch and once outside

## StatusLine.ui.tsx — 11 props, 3 callers

`indicator` is passed exactly once, as `indicator="badge"`, which is the default (`PipelineReportRow.ui.tsx:167`). **`indicator="dot"` is used nowhere**, so the `StatusDot` branch (:74-79) is dead — the two files that want dots import `StatusDot` directly. Note this reverses a 2026-08-01 change; confirm intent before deleting.

## Button.component.tsx

`isLoading` has zero production call sites (spec only). The cva declares four variant axes but `size` and `isDisabled`/`isSelected` all carry empty strings and are resolved entirely by nine `compoundVariants` — 66 lines of cva for 5 variants x 2 sizes.

## Smaller

- `Stack` `gap="8"` — zero sites (`gap="6"` x7, `gap="4"` x1)
- `StatusBadge` `emphasis="outline"` — one reachable site, via `StatusLine.badgeEmphasis`
- `"border-transparent legendary-ring"` written in both `rarityColors.ts:34` and `SwatchMark.component.tsx:53`
- `routes/_authed/admin.tsx:22` declares a local `RARITY_COLORS` instead of importing `src/ui/rarityColors.ts`, which eight other files use
- `DataTable.ui.tsx:16-23` declares a global `declare module "@tanstack/react-table"` augmentation from inside `src/ui/`, for one production caller

## swatchTheme forces its guard on every caller

`src/ui/theme/swatchTheme.ts` is 15 lines wrapping one object literal, and takes `theme` rather than the swatch. So seven call sites repeat:

```tsx
{...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}
```

`SwatchLabel.ui.tsx:35`, `SwatchChips.ui.tsx:42`, `GateSegmentBar.ui.tsx:55` and `:136`, `RunHud.ui.tsx:110`, plus `GateRewardReport.ui.tsx:171`, `RewardScreen.ui.tsx:59`, `GateStakeReceipt.ui.tsx:115-117` — each importing `hasThemeColor` from the gate domain purely for the guard. `swatchTheme(swatch)` returning `{}` for `fill` deletes seven repeats and seven domain imports.

Likewise `SwatchMark` + `swatchNameClass` + `swatchBorderClass` are three exports callers compose in a fixed order. `SwatchLabel.ui.tsx` encodes that composition; four other files re-hand-roll it.

## Sign-to-tone is copy-pasted, with a comment admitting it

```ts
// RevealScore.ui.tsx:33-39 — "Matches ScoreEquationChips' valueTone: the reveal
// and the answer screen grade the same number, so they cannot disagree"
const toneOf = (value: number): string => {
  if (value > 0) return "text-viridian";
  if (value < 0) return "text-cinnabar";
  return "text-pewter";
};
```

Identical body at `ScoreEquationChips.ui.tsx:46-50`, plus `StackPreviewList.ui.tsx:50`. All return raw class strings even though `Paragraph` accepts `tone="viridian" | "cinnabar" | "muted"`. One `signTone(value): ParagraphTone` in the theme closes it. (`RevealScore` is currently story-only — see the ylsm five-file ruling.)

## Todo

- [x] Collapse `Screen.width` to `narrow | default`; delete `transition`, `center`, the duplicated Button block
- [x] Deleted `StatusLine.indicator` and its dead branch
- [~] Kept both, deliberately — see "What I did not delete"
- [x] `swatchTheme(themeColorOf(swatch))`; all eleven call sites now ask once
- [~] Skipped — the duplicate is a live function and a dead one; see below
- [~] Ring string deduped; the admin map is not a shadow — see below

## Summary of Changes

### Screen

`width` had three values and two behaviours — `wide` and `default` were the same string, so five call sites believed they were choosing something. Collapsed to `narrow | default`; the five sites (`Dex` ×2, `DexScreen`, `RunShop`, `proto-run`) just drop the prop, so **nothing renders differently**.

`transition` had zero callers and was overwritten on every mount by `peekScreenNavDirection()`; `center` had zero callers. Both gone, along with the `center` cva variant. The nav direction is now the only source of a transition, and a screen mounted without one does not animate.

The `rightAction` Button was written twice — once inside the `Popover` branch, once outside. Now one `rightActionButton` helper that wraps in its explanation only when there is a hint.

### StatusLine

`indicator` was passed exactly once, as `indicator="badge"` — the default. The `"dot"` branch had no caller: the two surfaces that want dots import `StatusDot` directly. Prop, union type, branch and the now-unused `StatusDot` import all deleted, and `PipelineReportRow` stopped passing the default explicitly.

### swatchTheme

The guard `hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {}` was repeated at **eight** sites, each importing `hasThemeColor` for it alone — and **three more sites skipped the guard entirely** (`Standouts`, `ClimbToday` ×2), so those set `data-swatch-theme` on legendary swatches that have no CSS block.

The fix could not go where the bean said: `.dependency-cruiser.cjs`'s `ui-stays-presentational` rule allows `src/ui` to take **types** from modules but never runtime values, so `swatchTheme` cannot call `hasThemeColor`. Instead the domain answers it — new `themeColorOf(swatch)` returns the theme or `undefined` — and `swatchTheme` absorbs `undefined` by rendering no attribute. Every call site is now `{...swatchTheme(themeColorOf(swatch))}`, including the three that used to be inconsistent.

`themeColorOf` takes `Pick<GateSwatch, "theme" | "finish">` because `Standouts` carries a partial swatch, and those two fields are all it reads.

**One bug I introduced and caught mid-change**: `SwatchChips` gated theming on `owned && hasThemeColor(swatch)`, and the mechanical rewrite dropped the `owned` half — an unowned chip is drawn dashed and grey and must not wear its colour. Restored explicitly, with a comment.

### What I did not delete, and why

- **`Button.isLoading`** — no production caller, but it has a Story and a loading state is ordinary primitive capability. Deleting it removes something a caller would reasonably reach for, which is not the same as removing dead weight.
- **`Stack` `gap="8"`** — same reasoning. A spacing scale with a hole in it is worse than an unused rung.
- **`signTone`** — the two copies are `ScoreEquationChips.valueTone` (live) and `RevealScore.toneOf` (**story-only**, on the `DVTD-ylsm` ruling list). Extracting a shared theme helper to unify a live function with a dead one is not worth the module. Revisit after the ruling: if `RevealScore` goes, so does the duplication.
- **`admin.tsx`'s `RARITY_COLORS`** — not a shadow. It is a different palette (`bg-blue-100` / `text-blue-800` etc. for a light admin table) against `src/ui/rarityColors.ts`'s Kanto colours for game chips. Importing the game palette would change how the admin screen looks, for no functional gain, on a legacy route.
- **`DataTable`'s module augmentation** — structural, one caller, harmless.

The one real duplicate was `"border-transparent legendary-ring"` in both `rarityColors.ts` and `SwatchMark.component.tsx`; it is now `LEGENDARY_BORDER`, exported with the explanation that used to sit inside the rarity map.

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (531 modules), 1473 tests passing.
