---
# DVTD-4mqr
title: Gate outcome screen opens on coverage
status: completed
type: task
created_at: 2026-09-14T11:40:00Z
updated_at: 2026-09-14T11:40:00Z
---

The gate outcome screen gets the panel treatment: the loose coverage bar and the
standalone perfect-bonus box merge into one Coverage fold, and the screen stands
on a bare ground like the other three run screens.

## Todo

- [x] Coverage fold holds the bar + the perfect bonus, open by default
- [x] "Coverage by category" -> "By category"; "Storage bonus" -> "Payout"
- [x] Screen ground bare; the action bar in a PanelV2
- [x] specs updated, lint, build, tests green

## Summary of Changes

`GateOutcomeScreen.ui.tsx` gained a `CoveragePanel`: a `Fold` titled "Coverage"
carrying the `CoverageBar`, the perfect-bonus prose when there is one, and a band
badge derived from the bar the screen already computed. It leads the panel list
and is the ONE fold open by default.

`BonusPanel` is gone — the bonus no longer has a box of its own; its summary
("the bar filled") and its +KB badge ride on the Coverage head.

Renames avoid doubling the word now that Coverage is its own panel:
"Coverage by category" -> "By category", "Storage bonus" -> "Payout".

The screen is `ground="bare"` on both branches (the run-over cinnabar one too),
and `ScreenFooter` sits in a headerless `PanelV2` with `rule={false}`, matching
New run, Prep and Poll.

Nothing was needed on `Fold` itself: reskinning it to `PANEL_V2_SURFACE` under
DVTD-o91z already gave this screen the panel chrome.

## Two decisions taken with Marciano

- Panel labels stay **capitalised** across all four screens, not lowercase as the
  mocks draw them. The mocks are treated as shorthand.
- A folding panel keeps its **rotating caret** rather than taking the static
  panels' square glyph. A folding head reading differently from a static one is
  honest: only some panels fold.

## Two specs changed, both real

- "opens with every fold shut" is now "opens on coverage alone" — Coverage is
  deliberately open, the rest still shut.
- "leads the folds with the bonus" is now "leads with coverage, and prices the
  perfect bonus inside it" — folds[0] is Coverage and the bonus summary lives in
  its head.

## Not built

The mock's 1-5 step badges in the Coverage panel are Trail's verdict row, and
Trail was deleted outright in DVTD-o91z at Marciano's request. The five verdicts
are still listed in The five answers panel, so nothing is lost, but the compact
row is gone. Worth a word if he wants it back in some other form.

The mock's "5.9 units · 5 slots" summary would need unit data the outcome frame
does not carry today; the Coverage head reuses the bonus summary instead.

## Verification

- `GateOutcomeScreen.spec.tsx` 39/39.
- `npm test` — 4299 passed, 6 skipped, 2 todo; only the 2 pre-existing
  `gate.model.spec.ts` "floor rule" failures remain.
- lint clean, lint:arch no violations (983 modules), tsc 0 errors.
- CHANGELOG entry added.
