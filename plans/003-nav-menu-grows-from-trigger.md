# 003 — Grow the nav menu out of its trigger

- **Status**: DONE (code), feel check pending
- **Commit**: 1d068a49
- **Severity**: LOW
- **Category**: Missed opportunities (spatial consistency)
- **Estimated scope**: 1–2 files, ~4 lines

## Problem

`NavDisclosure` (the account menu in `src/modules/app/shell/presentation/AppNav.ui.tsx:252`)
is a native `<details>`. When it opens, the panel appears in one frame with no
link to the summary that opened it.

```ts
// src/ui/kanto-theme/NavDisclosure.ui.tsx:5-10 (current)
const PANEL =
	"absolute z-30 mt-1 flex min-w-44 flex-col rounded-md border border-theme-faint bg-theme-faint py-1 shadow-lg";

const ALIGN = { left: "left-0", right: "right-0" } as const;
```

## Target

- Opening: `opacity 0 → 1`, `scale 0.97 → 1`, `150ms`, `--ease-out-strong`
  (`cubic-bezier(0.23, 1, 0.32, 1)`), via `starting:` (`@starting-style`).
- `transform-origin` is the corner under the trigger: `top right` when
  `align="right"`, `top left` when `align="left"`.
- Closing stays instant. Users close menus to get on with something; an exit
  animation would only delay them.
- Reduced motion: fade only.

Why `@starting-style` works on a `<details>` child: when the details is closed,
its content is either `display: none` (Safari/Firefox slot) or in a
`content-visibility: hidden` subtree (Chromium `::details-content`). In both cases
the panel has no prior computed style when it opens, so the browser uses the
`@starting-style` values as the transition origin. Treat this as unverified until
the feel check below passes in all three engines.

## Repo conventions to follow

- `CONSTANT_CASE` class constants; alignment lives in the `ALIGN` record.
- Token `--ease-out-strong` in the `@theme` block, `src/ui/kanto-theme/kanto.css:31`.
- **No comments anywhere.** Hard project rule.

## Steps

1. If `src/ui/kanto-theme/kanto.css` has no `--ease-out-strong`, add it inside the
   `@theme {` block directly after `--font-display: "Pixter Display", sans-serif;`:
   ```css
   	--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
   ```
2. In `src/ui/kanto-theme/NavDisclosure.ui.tsx`, replace `PANEL` and `ALIGN`:
   ```ts
   const PANEL =
   	"absolute z-30 mt-1 flex min-w-44 flex-col rounded-md border border-theme-faint bg-theme-faint py-1 shadow-lg transition-[opacity,scale] duration-150 ease-out-strong starting:opacity-0 starting:scale-97 motion-reduce:starting:scale-100";

   const ALIGN = {
   	left: "left-0 origin-top-left",
   	right: "right-0 origin-top-right",
   } as const;
   ```

## Boundaries

- Do NOT touch `AppNav.ui.tsx` or the outside-press logic in `NavDisclosure`.
- Do NOT add a close animation or turn `<details>` into controlled state.
- If the panel does not animate in any engine, STOP and report which one. Do not
  switch to keyframes or JS on your own.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test -- --run src/ui/kanto-theme/NavDisclosure.spec.tsx`.
  All pass. `npx prettier --check src/ui/kanto-theme/NavDisclosure.ui.tsx`.
- **Feel check** (`npm run dev`, signed in, click the account mark top-right):
  - The menu grows out of its top-right corner, under the avatar, not from its centre.
  - Open, close, open quickly: each open plays, and closing is instant.
  - DevTools > Animations at 10%: starts at 97%, no overshoot, done in 150ms.
  - Repeat in Chrome, Safari and Firefox. Record per engine whether it animates.
  - Emulate `prefers-reduced-motion: reduce`: fade only.
- **Done when**: the menu enters from its trigger corner in all three engines (or
  the executor reports which engine does not) and checks pass.
