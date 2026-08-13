---
# DVTD-c8jy
title: src/ui primitives carry dead props and unreachable variants
status: todo
type: task
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T13:46:18Z
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

- [ ] Collapse `Screen.width` to `narrow | default`; delete `transition`, `center`, the duplicated Button block
- [ ] Confirm intent, then delete `StatusLine.indicator` and its dead branch
- [ ] Delete `Button.isLoading`, `Stack` `gap="8"`
- [ ] `swatchTheme(swatch)`; delete the seven guards
- [ ] Add `signTone` to the theme; delete the three copies
- [ ] Delete admin.tsx's shadow `RARITY_COLORS`; dedupe the legendary-ring string
