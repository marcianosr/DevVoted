# 004 — Open the Fold body instead of snapping it

- **Status**: DONE (code), feel check pending
- **Commit**: 1d068a49
- **Severity**: LOW
- **Category**: Missed opportunities (state indication)
- **Estimated scope**: 2 files, ~25 lines

## Problem

`Fold` is a native `<details>` used across about 12 call sites. Its caret
rotates (`transition-transform`), but the body appears at full height in one
frame and pushes everything below it down at once.

```ts
// src/ui/kanto-theme/Fold.ui.tsx:9-10 (current)
const FOLD = "group/fold w-full";
```

```tsx
// src/ui/kanto-theme/Fold.ui.tsx:61 (current)
<details open={open} className={clsx(PANEL_SURFACE, FOLD)}>
```

## Target

Progressive enhancement with `::details-content` + `interpolate-size`:

- Open and close: `block-size 0 ↔ auto` and `opacity 0 ↔ 1`, `200ms`,
  `--ease-out-strong` (`cubic-bezier(0.23, 1, 0.32, 1)`), plus
  `content-visibility 200ms allow-discrete` so the content stays visible while it
  closes.
- Engines without `interpolate-size` (Safari, Firefox today) keep today's instant
  snap. This is acceptable; do not polyfill.
- Reduced motion: opacity only, no height animation.

`block-size` is a layout property, which normally breaks the transform/opacity-only
rule. It is accepted here because a disclosure must push its siblings and a
one-shot 200ms reflow on a user click is cheap. If a long `flush` Fold (a
list of many rows) janks, report it. Do not swap to `scale`.

## Repo conventions to follow

- Kit-level CSS classes live in `src/ui/kanto-theme/kanto.css` as plain classes
  (exemplar: `.press-sheen` at about line 345, with its own
  `@media (prefers-reduced-motion: reduce)` block directly below).
- Token `--ease-out-strong` in the `@theme` block, `kanto.css:31`.
- **No comments anywhere, CSS included.** Hard project rule.
- Never run prettier with `--write` on CSS files in this repo.

## Steps

1. If `src/ui/kanto-theme/kanto.css` has no `--ease-out-strong`, add it inside the
   `@theme {` block directly after `--font-display: "Pixter Display", sans-serif;`:
   ```css
   	--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
   ```
2. Append to the end of `src/ui/kanto-theme/kanto.css` (tabs for indentation):
   ```css
   .fold-reveal {
   	interpolate-size: allow-keywords;
   }

   .fold-reveal::details-content {
   	block-size: 0;
   	overflow: clip;
   	opacity: 0;
   	transition:
   		block-size 200ms var(--ease-out-strong),
   		opacity 200ms var(--ease-out-strong),
   		content-visibility 200ms allow-discrete;
   }

   .fold-reveal[open]::details-content {
   	block-size: auto;
   	opacity: 1;
   }

   @media (prefers-reduced-motion: reduce) {
   	.fold-reveal::details-content {
   		transition:
   			opacity 200ms var(--ease-out-strong),
   			content-visibility 200ms allow-discrete;
   	}
   }
   ```
3. In `src/ui/kanto-theme/Fold.ui.tsx`, change `FOLD`:
   ```ts
   const FOLD = "fold-reveal group/fold w-full";
   ```

## Boundaries

- Do NOT touch Fold call sites, `NavDisclosure` (plan 003), or the caret.
- Do NOT replace `<details>` with JS-driven height.
- If `block-size: 0` makes a Fold with `open` render collapsed on first paint in
  any engine, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test -- --run src/ui/kanto-theme/Fold.spec.tsx`.
  All pass. `npx prettier --check src/ui/kanto-theme/Fold.ui.tsx`.
- **Feel check** (`npm run dev`, any screen with a Fold, e.g. the Dex or profile):
  - Chrome: the body slides open and closes the same way. Content below moves smoothly.
  - Click the summary twice quickly: it reverses mid-way, it does not restart.
  - A Fold rendered with `open` is fully open on load, with no animation on first paint.
  - Safari and Firefox: opens instantly as before, and nothing is clipped or hidden.
  - DevTools > Animations at 10%: no overshoot; the caret and body finish together.
  - Emulate `prefers-reduced-motion: reduce`: fade only, height snaps.
- **Done when**: Folds animate open and closed in Chromium, fall back cleanly
  elsewhere, and checks pass.
