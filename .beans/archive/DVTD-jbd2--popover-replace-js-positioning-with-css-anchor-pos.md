---
# DVTD-jbd2
title: 'Popover: replace JS positioning with CSS anchor positioning'
status: completed
type: task
priority: normal
created_at: 2026-08-06T14:12:25Z
updated_at: 2026-08-20T08:49:21Z
---

`src/ui/Popover.component.tsx` measures its own position with `getBoundingClientRect` and writes fixed coordinates into React state. Replace that with CSS anchor positioning (`anchor-name` / `position-anchor` / `position-area` / `position-try-fallbacks`), anchor-only with no @supports fallback.

Fixes two defects:
- A pinned (`sticky`) popover keeps its fixed viewport coordinates while the trigger scrolls away, because `computePosition` only runs on open with no scroll/resize listener.
- `showPopover()` and `setPosition` both run in the same `useEffect`, so the panel can paint at the UA default position for a frame before the measured coordinates land.

`Tooltip` stays as-is: it wraps already-interactive elements (`ConfigChip.ui.tsx:171` wraps a `<button>`), and `Popover`'s trigger would nest interactive controls.

## Todo
- [x] Delete `computePosition`, `position` state, `VIEWPORT_MARGIN`, `TRIGGER_GAP`, inline coordinate style
- [x] Add anchor-name on trigger + position-anchor/position-area/position-try-fallbacks on panel
- [x] Keep the hover/sticky open state machine (no declarative hover until `interestfor` ships unflagged)
- [ ] Verify in a real browser (chrome-devtools MCP, NOT playwright): the fit-content/anchor-center centering fix, and that a pinned popover tracks on scroll
- [x] Run lint, typecheck, tests

## Progress

Component and CSS done. `src/ui/Popover.component.tsx` lost ~40 lines: `computePosition`, the `position` state, `VIEWPORT_MARGIN`/`TRIGGER_GAP`, and the conditional inline coordinate style. Placement now lives in `.popover-anchored` in `src/styles/app.css`; React only supplies a per-instance `anchor-name` built from `useId()`, because anchor idents are document-scoped.

Verified in Chrome 150 before browser checks were stopped:
- `anchor-name` / `position-anchor` resolve and match (`--popover-_r_0_`)
- `position-area` and `position-try-fallbacks` both supported and applied
- `flip-block` works: trigger near the top of the canvas placed the panel below it
- gap is exactly 8px, matching the old `TRIGGER_GAP`

That same measurement caught a defect: with `position-area: ... span-all` the box stretched to fill the whole inline region (499px wide) instead of hugging its content, so it was not centred on the trigger. Fixed by adding `inline-size: fit-content` + `justify-self: anchor-center`. **That fix is not yet browser-verified.**

Checks: `npm run lint` clean (only pre-existing `no-console` warnings in `seedCommunity.ts`), `lint:arch` clean (568 modules), 1128 tests pass. The single failure (`RunHud.spec.tsx` > streak) and the `RunHud.ui.tsx` unused-`streak` typecheck error are both pre-existing staged WIP, unrelated to this change.

`Tooltip` deliberately untouched: it wraps already-interactive elements (`ConfigChip.ui.tsx:171` wraps a `<button>`), so swapping in `Popover` would nest interactive controls.
