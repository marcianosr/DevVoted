# 001 — Give the flat Button tones press feedback

- **Status**: DONE (code), feel check pending
- **Commit**: 1d068a49
- **Severity**: MEDIUM
- **Category**: Missed opportunities (feedback)
- **Estimated scope**: 2 files, ~10 lines

## Problem

The kit Button has two families of tone. The raised tones (`primary`,
`destructive`, `prismatic`) sink on press via `enabled:active:press-sunk`. The
flat tones (`ambient`, `action`, `commit`, `danger`, `bare`, `slot`) only change
colour on hover and do nothing on press, so a tap on mobile has no
acknowledgement at all. These buttons appear on nearly every screen.

```ts
// src/ui/kanto-theme/Button.ui.tsx:7-8 (current)
const BUTTON =
	"group/press items-center justify-center leading-none ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40";
```

```ts
// src/ui/kanto-theme/Button.ui.tsx:57-65 (current)
const AMBIENT =
	"ring-theme-faint text-theme-muted enabled:hover:text-theme-soft enabled:hover:ring-theme-soft";
const ACTION = "press-theme ring-theme-soft";
const DANGER =
	"ring-theme-soft text-theme-soft enabled:hover:bg-theme-soft enabled:hover:text-theme-faint";
const BARE = "ring-transparent text-theme-muted enabled:hover:text-theme-faint";
const BRIGHT = "segment-theme ring-transparent hover:brightness-110";
const RAISED =
	"segment-theme press-raised ring-transparent enabled:hover:brightness-110 enabled:active:press-sunk disabled:bg-none disabled:bg-theme-faint disabled:text-theme-muted disabled:shadow-none";
```

```ts
// src/ui/kanto-theme/Button.ui.tsx:69-70 (current)
const SLOT =
	"border border-dashed border-theme-faint ring-transparent text-theme-muted enabled:hover:border-theme-soft enabled:hover:text-theme-soft";
```

## Target

- New easing token in the kanto theme: `--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);`
  (do NOT override Tailwind's built-in `--ease-out`; other code uses the `ease-out` utility).
- Flat tones scale to `0.97` while pressed, transition `150ms` with `--ease-out-strong`.
- Reduced motion: no scale, colour changes stay.
- Raised tones keep `press-sunk` and gain nothing new. Never stack scale on top of the sink.

Tailwind v4.3 utilities used: `scale-97` (sets the `scale` property, not
`transform`), `ease-out-strong` (generated from the theme token),
`transition-[color,background-color,border-color,scale]`, `duration-150`.

## Repo conventions to follow

- Class strings are `CONSTANT_CASE` constants composed with `clsx`. There is no
  `tailwind-merge`: when two utilities set the same CSS property, Tailwind's
  emit order decides, not the order in the string. So never put two
  `transition-*` utilities on one element; move the one on the shared base instead.
- Theme tokens live in the `@theme { … }` block at `src/ui/kanto-theme/kanto.css:31`.
- **No comments anywhere** (TS or CSS). This is a hard project rule.

## Steps

1. In `src/ui/kanto-theme/kanto.css`, inside the `@theme {` block that starts at
   line 31, add this line directly after `--font-display: "Pixter Display", sans-serif;`.
   Skip this step if another plan already added it:
   ```css
   	--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
   ```
2. In `src/ui/kanto-theme/Button.ui.tsx`, remove `transition-colors ` from `BUTTON`:
   ```ts
   const BUTTON =
   	"group/press items-center justify-center leading-none ring-1 ring-inset disabled:cursor-not-allowed disabled:opacity-40";
   ```
3. Directly above `const AMBIENT`, add:
   ```ts
   const FLAT_PRESS =
   	"transition-[color,background-color,border-color,scale] duration-150 ease-out-strong enabled:active:scale-97 motion-reduce:enabled:active:scale-100";
   ```
4. Prefix the flat tones with it, and give `BRIGHT` back the colour transition it
   had from the base:
   ```ts
   const AMBIENT = `${FLAT_PRESS} ring-theme-faint text-theme-muted enabled:hover:text-theme-soft enabled:hover:ring-theme-soft`;
   const ACTION = `${FLAT_PRESS} press-theme ring-theme-soft`;
   const DANGER = `${FLAT_PRESS} ring-theme-soft text-theme-soft enabled:hover:bg-theme-soft enabled:hover:text-theme-faint`;
   const BARE = `${FLAT_PRESS} ring-transparent text-theme-muted enabled:hover:text-theme-faint`;
   const BRIGHT = "segment-theme ring-transparent transition-colors hover:brightness-110";
   ```
   ```ts
   const SLOT = `${FLAT_PRESS} border border-dashed border-theme-faint ring-transparent text-theme-muted enabled:hover:border-theme-soft enabled:hover:text-theme-soft`;
   ```
   `commit` maps to `ACTION` in the `TONE` record, so it inherits this. Leave
   `RAISED`, `PRIMARY`, `DESTRUCTIVE` and `PRISMATIC` alone: their transition comes
   from the `press-raised` utility at `kanto.css:164-171`.

## Boundaries

- Do NOT touch `Action.ui.tsx`, `Segmented.ui.tsx`, `Tabs.ui.tsx`, `Pick.ui.tsx`, `Switch.ui.tsx`.
- Do NOT change the raised tones or `press-raised` / `press-sunk`.
- Do NOT add `tailwind-merge` or any dependency.
- Link-buttons (`href`) render an `<a>`, which `:enabled` never matches, so they get
  no scale. That is consistent with their hover rules today. Do not "fix" it.
- If the code at the cited lines differs from the excerpts, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test -- --run src/ui/kanto-theme/Button.spec.tsx`.
  All pass. Then `npx prettier --check src/ui/kanto-theme/Button.ui.tsx`.
- **Token emitted**: `npm run dev`. In DevTools, on any element, the computed value
  of `--ease-out-strong` is `cubic-bezier(0.23, 1, 0.32, 1)`. If it is empty,
  Tailwind tree-shook the token: STOP and report.
- **Feel check** (`npm run dev`, port 3005):
  - Press and hold an ambient button (e.g. "cancel" in a config Uninstall confirm). It
    shrinks slightly and springs back on release. The label text does not blur or jump.
  - Rapid-tap it. The scale retargets smoothly and never restarts from zero.
  - Press a primary button (e.g. the start-run press). It still sinks downward and
    does not shrink. Compare against `main`: the sink should feel the same or
    crisper. If it now feels different, report it (removing `transition-colors`
    from the base may change which transition wins on raised tones).
  - DevTools > Animations at 10%: the scale settles fast early and eases into place
    (strong ease-out), with no overshoot.
  - DevTools > Rendering > emulate `prefers-reduced-motion: reduce`: no scale, hover
    colours still fade.
- **Done when**: every flat-tone `<button>` scales to 0.97 on `:active`, raised tones
  are unchanged, and checks pass.
