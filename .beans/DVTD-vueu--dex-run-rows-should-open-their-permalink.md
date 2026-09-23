---
# DVTD-vueu
title: Dex run rows should open their permalink
status: completed
type: task
priority: normal
created_at: 2026-09-16T10:44:43Z
updated_at: 2026-09-22T18:48:02Z
parent: DVTD-0x5c
blocked_by:
    - DVTD-t3lt
---

`/runs/$runId` renders a finished run read-only (DVTD-t3lt), but nothing links to it: `DexRuns` rows are plain `Panel.Row` divs.

Making a row openable is a kit change, not a wiring change. `Panel.Row` has no pressable mode, and the kanto convention for pressability is a ring (see the pressable badge), so the affordance has to be designed rather than bolted on.

- [x] Decide the affordance: an `href` on `Panel.Row` — a real link, not a press
- [x] Add it to the Panel primitive with a story (`LinkedRows`)
- [x] `DexRunRow` gains `href`; `DexRuns` wires it
- [x] ~~`Dex.component` navigates~~ — unnecessary, the row IS the link

## Summary of Changes

Dex run-history rows are now links to `/runs/$runId`.

### Deviation from the plan above, and why

The bean proposed `onOpen` plus `Dex.component` navigating. Shipped an `href` instead:

- A permalink's whole point is that it behaves like one. An `href` gives middle-click,
  open-in-new-tab and copy-link-address for free; an `onOpen` button gives none of them.
- It keeps the router out of the kit. `src/ui/kanto-theme/` still imports nothing from
  `@tanstack/react-router` (`lint:arch` guards this), because the URL is built in the
  viewmodel and arrives as plain data — which is what ADR-010 Tier 1 asks for anyway.
- The kit already had this convention: `Link.ui.tsx` takes a plain `href: string`.
- `Dex.component.tsx` needed no change at all.

On the affordance: the bean expected a ring, by analogy with the pressable badge. A ring
is the kit's mark for *a press*, and this is not a press — it is a link. Used
`hover:bg-theme-raised`, the kit's existing raised surface, so the row lifts on hover
rather than claiming a press's mark.

### What changed

- `Panel.ui.tsx` — `Panel.Row` takes optional `href`; with one it renders `<a>` and adds
  `ROW_LINK`, otherwise the same `<div>` as before. The row's content is extracted once
  so both branches render `trailing` and `theme` identically. **No existing call site
  changed.**
- `DexRuns.ui.tsx` — `DexRunRow` gains `href`, passed straight to `Panel.Row`.
- `dexScreen.viewmodel.ts` — new local `archiveHrefFor(runId)`; the dex owns the archive
  URL, deliberately not `RUN_ROUTES` (that set is the live climb, and `/runs/` is the
  archive — see the note on the route itself).
- `dexRegistry.factory.ts` — the three run fixtures carry their hrefs.
- `Panel.stories.tsx` — new `LinkedRows` story, showing linked and unlinked rows together.

### Verification

- 4 new specs: 2 in `Panel.spec.tsx` (row is the link / stays a plain row without one),
  1 in `DexRuns.spec.tsx` (every row's href), 1 in `dexScreen.viewmodel.spec.ts`.
- `npm test`: 226 files, **4080 passed**, 0 failed.
- `npx tsc --noEmit` clean; `npm run lint` 0 violations, depcruise 0 across 818 modules.
- Stories typechecked against a scratch tsconfig (they are excluded from the real one):
  16 pre-existing errors, none in `Panel.stories.tsx`, no TS2304.
