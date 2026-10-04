---
# DVTD-6vha
title: Prep screen stands its panels on the page
status: completed
type: task
created_at: 2026-09-14T10:34:15Z
updated_at: 2026-09-14T10:34:15Z
---

The prep screen gets the same treatment as the new run screen: five PanelV2
sections standing on a bare screen ground.

`BandOutcomes`, `Ledger` and `PollScores` turned out to be used by PrepScreen
ALONE, so they were restructured directly rather than gated behind flags.

## Todo

- [x] PanelTable: bleed variant, so a table that follows content keeps its gap
- [x] Ledger -> PanelV2, dead gate heading dropped
- [x] BandOutcomes -> PanelV2
- [x] Audits -> PanelV2 with Rows
- [x] PollScores + the action bar in headerless panels
- [x] PrepScreen ground defaults to bare
- [x] specs updated, lint, build, tests green

## Summary of Changes

Three of the four sections already wrapped their table in a `Panel` with the
title OUTSIDE it, so wrapping the section would have nested a panel in a panel.
Each section's inner `Panel` is now the `PanelV2` itself: title into
`PanelV2.Header`, table into the body, closing note into `PanelV2.Footer`.

**PanelTable** gained `bleed?: "all" | "sides"` (default "all", every existing
call site unchanged). `-mx-4 -my-4` exists only to escape a padded panel; it is
right when the table is the region's ONLY child (Ledger), but `-mt-4` yanks the
table up over whatever precedes it. BandOutcomes puts lead lines, objectives and
the coverage bar above its table, so it passes `bleed="sides"`.

**Audits** (local to PrepScreen) now uses `PanelV2.Rows` / `PanelV2.Row`, which
replaced its hand-rolled ROWS/ROW/DIVIDER consts exactly.

**PollScores** has no title of its own, so it sits in a headerless panel rather
than inventing a section name for it. Same for the action bar.

## Two behaviour changes worth knowing

1. `PanelV2.Header` now renders `Typography variant="title" as="h3"`, not
   `variant="subtitle"`. Prep's section titles were h3/`title`; the panel header
   was silently demoting them to h2/`subtitle` — a heading-level regression AND
   a weight drop. This also slightly enlarges the New run screen's Build and
   Registry titles, which matches the mock.

2. `Ledger`'s `heading="gate"` variant is DELETED, along with `LedgerHeading`,
   its dashed MARK and GATE_TITLE. It had no production call site; only its own
   spec exercised it. Keeping a variant alive for its own test is dead
   configuration, and the alternative was teaching PanelV2.Header
   Ledger-specific semantics.

A third Ledger test asserted a section heading renders NO glyph. That is now
deliberately false: every PanelV2 header wears the kit's square. Replaced with a
test asserting the new truth.

## Verification

- `Ledger` + `BandOutcomes` + `PrepScreen` + `PanelV2` specs: 93/93.
- `npm test` — 4305 passed, 6 skipped, 2 todo. The 4 failures in
  `PollScreen.spec.tsx` and `gate.model.spec.ts` are the same pre-existing ones
  proven unrelated under DVTD-3rke.
- `npm run lint` clean, `lint:arch` no violations, `npx tsc --noEmit` 0 errors.
