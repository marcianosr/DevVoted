---
# DVTD-tkzn
title: 'Kanto gate-clear screen: four folds over a debrief'
status: completed
type: feature
priority: normal
created_at: 2026-09-11T07:30:45Z
updated_at: 2026-09-11T07:47:35Z
---

The gate-clear debrief in the kanto kit: a header that states the whole result, then four
folded panels (coverage by category, storage bonus, build changes, the five answers), each
summarising itself on its own strip so nothing has to be opened to be read. Everything is
shut by default.

Rides along: ADR-066 "every figure wears a badge" plus the nine-site sweep in kanto-theme.

Scope is the kit only — no routes, no .component.tsx, no change to the live /run/reward.

## Todo

- [x] Verdict.ui (PASS/PARTIAL/FAIL) + rewire Trail onto its colour map
- [x] Swatch hero size + SwatchTrack GAP
- [x] Extract LedgerRows from Ledger (existing specs must pass unmodified)
- [x] LedgerRow gains tags, verdict, optional label
- [x] Fold.ui — the bordered folding panel
- [x] ConfigChip gains detail
- [x] Icon.ui (shop, community) + Button.icon
- [x] ScreenFooter noteAt + FooterAction.icon + optional stakes
- [x] ADR-066 + README row + the 9-site badge sweep + Figures regex
- [x] kantoGate.factory.ts
- [x] GateClearScreen.ui + stories + spec
- [x] Wiki reward-report bullet + CHANGELOG

## Summary of Changes

Kit only, as scoped: no routes, no .component.tsx, the live /run/reward untouched.

**New in src/ui/kanto-theme:** `Fold.ui` (the bordered folding panel, shut by default, summary strip inside the border), `Verdict.ui` (PASS/PARTIAL/FAIL as words, and the colour map `Trail` now shares), `Icon.ui` (hand-drawn package + people SVGs behind a name union), `LedgerRows.ui` (Ledger's divided-row body, extracted so it can live inside a Fold without double-bordering) and `GateClearScreen.ui` itself. Plus `src/test/kantoGate.factory.ts`.

**Changed:** `LedgerRow` gained `tags`, `verdict` and an optional `label`; `ConfigChip` gained `detail`; `Button` gained `icon` on its plain arm; `ScreenFooter` gained `noteAt`, optional `stakes` and icons on its actions; `Swatch` gained a `hero` size (and `SwatchTrack.GAP` with it).

**ADR-066, every figure wears a badge:** the nine bare-figure sites in the kit now route through `Badge` or `Figures`, and the `Figures` regex widened to unsigned amounts (32 KB, 92.5%) while still leaving bare counts alone. One hero readout per screen stays large and unboxed. Six specs moved to `textContent` matchers because prose now splits across badge elements.

**Two mock corrections:** gate 5 is Rainbow, not Vermilion (the swatch roster decides); and the numbers come from `gateClearPayout` / `coverageDemandFor` / `planBillKb` rather than the mock's figures, so the fixture cannot drift from the rules.

**Verified:** 4226 tests pass (237 files, 6 skipped, 2 todo), lint clean bar one pre-existing warning in `Screen.stories.tsx`, dependency-cruiser finds no violations across 964 modules, `npm run build` succeeds.
