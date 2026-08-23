---
# DVTD-gkln
title: 'Modern-theme Dex screen: shell + Gates panel'
status: completed
type: task
priority: normal
created_at: 2026-08-23T18:00:19Z
updated_at: 2026-08-23T18:08:04Z
---

Storybook-only reskin of the Dex (image #110) in src/ui/modern-theme/. Shell (title + 5-tab bar) plus the Gates panel in full; other four tabs are placeholders.

Kit changes:
- [x] Tabs.ui.tsx (new primitive: modern-theme has no tablist)
- [x] Legend.ui.tsx takes items + RARITY_LEGEND preset (zero call sites today)
- [x] Dot.ui.tsx gains shape disc|box (mirrors MarkShape)
- [x] Swatch.ui.tsx gains finish flat|fill (bg-legendary for Champion's gradient)

Screens:
- [x] screens/DexScreen.ui.tsx + spec + stories
- [x] screens/GatesPanel.ui.tsx + spec + stories (13-gate fixture in stories)

Verify:
- [x] tsc, stories typecheck, lint, tests
- [x] vite build + CSS hash (Storybook restart expected)

Mock data verified against the domain: coverage = COVERAGE_DEMANDS, peels = GATE_FAIL_STRIPS + Strip audits at 11/12, audits = GATE_AUDITS, unlocks = wiki 2.8 + PIN_FROM_GATE.

## Summary of Changes

Built the Dex shell + Gates panel in `src/ui/modern-theme/`, Storybook only.

**Kit (4 changes):**
- `Tabs.ui.tsx` NEW: `role=tablist`/`tab`, `aria-selected`, active tab `border-theme`. Count is a separate `Text` after a literal space (accname would otherwise read "Polls23/418"); flex gap keeps the spacing honest.
- `Legend.ui.tsx` now takes `items: readonly LegendItem[]`; `marker` optional so a legend can key a column that has no swatch. `RARITY_LEGEND` preserves the old behaviour. Had zero call sites, so free to reshape.
- `Dot.ui.tsx` gains `shape: disc|box` (Mark's own two words, declared locally to keep the primitives uncoupled). Props stay whole rather than destructured: a rest spread off the discriminated union drops the discriminant.
- `Swatch.ui.tsx` gains `finish: flat|fill`; `fill` = the existing `bg-legendary` Kanto gradient. Needed because app.css deliberately sets no `--theme-color` for `champion`, so Champion's pip would have fallen through to `:root` cerulean.

**Screens:**
- `screens/DexScreen.ui.tsx`: Dex title, Tabs, `role=tabpanel` slot. No `theme` prop, unlike every in-run screen: `:root` is already cerulean and the Dex is not a gate.
- `screens/GatesPanel.ui.tsx`: hard-coded blurb, 13-row grid list, Legend footer. The row is a local `GateRow` on a 6-column grid rather than `Row`/`Entry`, because the mock aligns coverage/peels/chips into columns down all 13 rows. `gatesClearedTo(n)` in the stories derives all 13 states from one number, so no story can draw a ladder with a gap in it.

**Mock verified against the domain** before transcribing: coverage = `COVERAGE_DEMANDS`, peels = `GATE_FAIL_STRIPS` + the Strip audits at 11/12, gate order (Lavender 4, Seafoam 8) = `GATE_SWATCHES`, audits = `GATE_AUDITS`, unlocks = wiki 2.8. The mock even has `git tag` at gate 4 (`PIN_FROM_GATE`), which the wiki table omits.

**Verification:** tsc 0; stories typecheck 0 in modern-theme (26 pre-existing elsewhere); lint clean (743 modules, 2848 deps); 2085 passing / 7 failed, all 7 the known pre-existing reds (5 RewardScreen copy edits, 2 skin/Crumb). CSS hash `app-DaLUO2hD` to `app-PGh6ROmn`, so Storybook needs a restart.

## Deferred

Other four tabs are one-line placeholders. Data gaps if this is ever wired rather than mocked: no account-level gate or audit persistence (`gatesCleared` is per-run `RunState`), `Configs 12/30` has no source (no config-unlock system exists), and an audits counter must dedupe on `name` not `id` (Timeout emits `timeout-3/4/5` and Strip emits `strip-1/2`, so ids give 14 not 11).
