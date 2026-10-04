---
# DVTD-sh2y
title: Port the new run screen onto PanelV2
status: completed
type: task
priority: normal
created_at: 2026-09-14T10:16:31Z
updated_at: 2026-09-14T10:19:53Z
---

Wrap the new run screen's three sections in PanelV2: Build, Registry and the
bottom action bar. Headers use PanelV2.Header (glyph + title, summary pushed
right). Registry offers stay ConfigChips, not lined rows.

The closing notes become PanelV2.Footer, so each section reads header / body /
footer exactly as the panel mocks do.

Wrapping happens in NewRunScreen.ui.tsx, NOT inside Build/Registry, so
ShopScreen is untouched. Build/Registry keep computing their own summary
string; the screen reads it through a small exported helper rather than
duplicating the derivation.

Keep the `div.grid > div` column wrappers: NewRunScreen.spec selects on them,
and they carry `min-w-0` which stops a panel overflowing its grid track.

## Todo

- [x] Build: export buildSummaryOf (heading flag already exists)
- [x] Registry: add heading flag, export registrySummaryOf
- [x] ScreenFooter: add rule flag so it can drop its own border-t inside a panel
- [x] NewRunScreen: compose the three panels
- [x] specs green, lint, build

## Summary of Changes

The new run screen's three sections now each sit in a `PanelV2`.

**NewRunScreen.ui.tsx** does all the wrapping, so `ShopScreen` (which shares
`Build` and `Registry`) is untouched. Each panel is header / body / footer:

- Build: header `Build` + its summary, body the track and chips, footer the
  weight note that used to hang outside the section as a sibling.
- Registry: header `Registry` + its summary wrapped in `Figures` (unchanged
  from what it rendered before), body the ConfigChip offers, footer the note.
  The note is destructured off `registry` so it lands in the footer rather than
  inside `Registry`'s own column.
- The action bar: a headerless panel holding `ScreenFooter`.

The two `div.grid > div` column wrappers stay. They carry `min-w-0`, which keeps
a panel from overflowing its grid track, and `NewRunScreen.spec` selects on them.

**Build.ui.tsx** — exported `buildSummaryOf(props)`. `heading` already existed.

**Registry.ui.tsx** — added `heading?: boolean` (default true, so the shop is
unchanged) and exported `registrySummaryOf`.

**ScreenFooter.ui.tsx** — added `rule?: boolean` (default true). Inside a panel
the screen rule would be a second line right under the panel's own edge, so the
new run screen passes `rule={false}`. Every other screen keeps its rule.

**CHANGELOG.md** — a player-facing Changed entry under Unreleased.

## One bug worth remembering

First cut computed the header meta with `buildSummaryOf(build)` while the
component got `<Build {...build} configCount={false} ... />`. The summary
therefore kept `configCount`'s default and rendered `0 configs · 0 weight · ...`
where the screen wants `0 weight · ...`. Three specs caught it.

Fixed by building ONE `dealt: BuildProps` object and feeding it to both the meta
and the component, so the readout cannot drift from what it describes. Same
lesson as ADR-069's one-source-for-the-count-and-the-press.

## Verification

- `npx vitest run src/ui/kanto-theme/NewRunScreen.spec.tsx` — 27/27, and the
  spec needed NO changes: titles, summaries, column split and press refusals all
  still read the same.
- `npm test` — 4304 passed, 6 skipped, 2 todo. The 4 failures in
  `PollScreen.spec.tsx` and `gate.model.spec.ts` are the same pre-existing ones
  from DVTD-3rke, proven unrelated there.
- `npm run lint` clean, `lint:arch` no violations (982 modules),
  `npx tsc --noEmit` 0 errors.
