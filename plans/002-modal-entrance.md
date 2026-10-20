# 002 — Fade the Modal in instead of cutting to it

- **Status**: DONE (code), feel check pending
- **Commit**: 1d068a49
- **Severity**: MEDIUM
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 2 files, ~6 lines

## Problem

`Modal` is mounted conditionally by its callers (`TitleGrantModal`,
`PollApprovedModal`). The 70% black scrim and the dialog appear in a single
frame, so the whole page darkens at once. These are rare, emotional
moments (a title granted, a poll approved), exactly where a short entrance is
worth having.

```ts
// src/ui/kanto-theme/Modal.ui.tsx:8-10 (current)
const WRAP = "fixed inset-0 z-50 flex items-center justify-center p-4";
const SCRIM = "absolute inset-0 cursor-default bg-black/70";
const DIALOG = "relative w-100 max-w-full";
```

## Target

Entrance only, using `@starting-style` via Tailwind v4's `starting:` variant (no JS):

- Scrim: `opacity 0 → 1`, `200ms`, `ease-out`.
- Dialog: `opacity 0 → 1` and `scale 0.96 → 1`, `250ms`, `--ease-out-strong`
  (`cubic-bezier(0.23, 1, 0.32, 1)`). The dialog stays centred: modals are exempt
  from trigger-origin, so `transform-origin` remains the default centre.
- No exit animation: callers unmount the Modal, and adding exit state is out of scope.
- Reduced motion: dialog fades only (scale pinned at 1); scrim fade unchanged.

## Repo conventions to follow

- Class strings are `CONSTANT_CASE` constants. No `tailwind-merge`.
- Easing token `--ease-out-strong` lives in the `@theme` block at
  `src/ui/kanto-theme/kanto.css:31`. Plan 001 adds it; step 1 adds it if missing.
- `@starting-style` precedent: `src/modules/run/build/presentation/coverage.css:43`.
- **No comments anywhere** (TS or CSS). Hard project rule.

## Steps

1. If `src/ui/kanto-theme/kanto.css` has no `--ease-out-strong`, add it inside the
   `@theme {` block directly after `--font-display: "Pixter Display", sans-serif;`:
   ```css
   	--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
   ```
2. In `src/ui/kanto-theme/Modal.ui.tsx`, replace `SCRIM` and `DIALOG`:
   ```ts
   const SCRIM =
   	"absolute inset-0 cursor-default bg-black/70 transition-opacity duration-200 ease-out starting:opacity-0";
   const DIALOG =
   	"relative w-100 max-w-full transition-[opacity,scale] duration-250 ease-out-strong starting:opacity-0 starting:scale-96 motion-reduce:starting:scale-100";
   ```
   Leave `WRAP` and the JSX untouched.

## Boundaries

- Do NOT touch `TitleGrantModal.ui.tsx`, `PollApprovedModal.ui.tsx` or any caller.
- Do NOT add exit animations, portals, or state.
- Do NOT use `scale-0` or any start scale below `0.95`.
- If the code differs from the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test -- --run src/ui/kanto-theme/Modal.spec.tsx`.
  All pass. `npx prettier --check src/ui/kanto-theme/Modal.ui.tsx`.
- **Feel check**: run `npm run dev` and open `Modal.stories.tsx` in Storybook, or
  trigger a title grant in the app.
  - The scrim fades in, it does not cut. The dialog grows a little into place from its
    centre at the same time.
  - DevTools > Animations at 10%: dialog starts at 96% size, not tiny; no overshoot.
  - It is over in about a quarter second. If it feels like it "waits", report rather
    than lengthening it.
  - Emulate `prefers-reduced-motion: reduce`: the dialog only fades.
  - Check in Safari and Firefox too. Browsers without `@starting-style` must still
    show the modal instantly. That is the acceptable fallback.
- **Done when**: both layers fade in on mount within 250ms and checks pass.
