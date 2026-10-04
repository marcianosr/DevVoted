---
# DVTD-tkix
title: 'PanelV2: a lined row variant'
status: completed
type: task
priority: normal
created_at: 2026-09-14T10:07:57Z
updated_at: 2026-09-14T10:10:13Z
---

The registry mock reads better with a rule between every offer row, not just
around the regions. Add a lined list to PanelV2.

Same principle as the regions, one level down: the rows container holds no
padding, each Row pads itself, so the rules reach the panel edges.

Uses `border-t` + `first:border-t-0` rather than `divide-y`, which would need a
new `divide-theme-faint` utility in app.css (the kit has border- and ring- but
no divide-). No shared CSS change needed.

## Todo

- [x] PanelV2.Rows + PanelV2.Row in PanelV2.ui.tsx
- [x] spec: full-bleed rules, first row unruled, trailing pushed right
- [x] story showing the lined registry beside the spaced one
- [x] test, lint, build green

## Summary of Changes

Two new subcomponents on `PanelV2`, no new files.

```
ROWS  flex w-full flex-col                                 <- no padding, no gap
ROW   flex w-full items-center gap-3 border-t
      border-theme-faint px-4 py-2 first:border-t-0
```

The regions' principle one level down: the list holds no padding, each Row pads
itself, so a row rule reaches both panel edges.

`border-t` + `first:border-t-0` rather than `divide-y`. Tailwind's divide
utilities take their colour from `divide-{color}` and the kit has
`border-theme-faint` / `ring-theme-faint` but no `divide-`; using it would have
meant adding a utility to app.css for something a built-in variant already does.
`first:border-t-0` also keeps the first row from doubling the header's own rule,
and is correct with no header at all.

`py-2` matches `PanelTable`'s existing `TABLE_ROW`, and lands the mock's 36px row
pitch. PanelV2 does not import from PanelTable: that helper is V1-era and carries
the `-mx-4 -my-4` hack PanelV2 exists to remove.

`Row` takes `children` + optional `trailing`, symmetric with `Footer`.

Stories added: `RegistryPanelLined` and `SpacedBesideLined` (the two readings
side by side). `RowOffer` hands its badges and buttons to `Row`'s `trailing`.

## Note

`PanelV2.ui.tsx`'s HEADER picked up `bg-theme/5` from outside this session
(a tint matching the mock's lighter header band). Preserved, not reverted. It
does not collide with the spec, which pins the surface against
`bg-theme-raised`, not against a tint.

## Verification

- `npx vitest run src/ui/kanto-theme/PanelV2.spec.tsx` — 12/12 (3 new).
- `npm test` — 4304 passed, 6 skipped, 2 todo.
- The 4 failures in `PollScreen.spec.tsx` and `gate.model.spec.ts` are the same
  pre-existing ones proven unrelated under DVTD-3rke.
- `npm run lint` clean, `lint:arch` no violations, `npx tsc --noEmit` 0 errors.
