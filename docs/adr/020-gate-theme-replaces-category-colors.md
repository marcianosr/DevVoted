# ADR-020: The gate themes the run; categories carry no color

## Status

Accepted (2026-08-06, Marciano). Retires the per-category Kanto palette
(DVTD-sthm, wiki §2.4's color tables, and ADR-007's category-accent convention
where they conflict).

## Context

Categories owned fixed Kanto colors (JS=saffron, CSS=cerulean, …) that drove
`--theme-color` via `[data-category-theme]`: the HUD, question card, and body
tint recolored with every poll. Since ADR-019 the gates own the game's color
identity — 13 swatches, one per gate, in the same palette. Two systems were
spending one palette on two meanings, so a color on screen was ambiguous:
saffron could mean "a JavaScript poll" or "the Marsh badge".

## Decision

1. **Categories are colorless.** They appear as plain text labels (question
   header, community board, coverage lists, Dex) — never as a
   color, chip, or themed row. `categoryTheme.ts` and the
   `[data-category-theme]` CSS are deleted; `CategoryTag` is gone.
2. **The gate being played themes the app.** `RunView.gateTheme` derives
   `swatchForGate(gatesCleared)?.theme`; run screens pass it to `Screen`, which
   sets `data-gate-theme` on its section and mirrors it onto `<body>` (page
   tint + the HUD, which sits outside the section). Answering polls of
   different categories never changes the theme; clearing a gate does.
3. **Two CSS namespaces, one palette.** `[data-swatch-theme]` keeps the *chip*
   colors (unchanged); the new `[data-gate-theme]` table carries the *ambient*
   colors. They differ only at the summit, which is the reason two namespaces
   exist:
   - **Elite** ambient is a lightened indigo (`oklch(from var(--color-indigo)
     0.7 c h)`) so text and accents read on the near-black page; the chip stays
     true indigo.
   - **Champion** has no chip color (legendary gradient) but needs an ambient
     solid: fuchsia. The gradient stays on chips/marks only.
4. **Mood beats gate.** The celadon/cleared and cinnabar/failed
   `data-screen-theme` moods stay; a screen passes mood *or* gate theme, never
   both, and the mood blocks are declared after the gate blocks so they win on
   any element wearing both.

Rejected: reusing `[data-swatch-theme]` for ambience with an `"elite-ambient"`
sentinel value — it would poison the `SwatchTheme` union and every chip
callsite, or corrupt the true-indigo chip by lightening the shared block.

## Consequences

- Theme utilities (`text-theme`, `bg-theme`, …) are untouched: they read the
  inherited `--theme-color`, so only the driver changed.
- `--meter-fill`/`--meter-bg` (scoped under the deleted category selector) are
  inlined into the `meter::` rules as `var(--theme-color)` directly. Do not
  re-home them to `:root`: a custom property's `var()` resolves where the
  property is *declared*, which would freeze meters to the root cerulean.
- Rows that used to be a rainbow (coverage-by-category, HUD coverage dropdown)
  render neutral text, not `text-theme` — per-row theme color would paint them
  all in one identical gate color and pretend to mean something.
- Outside a run (Dex, polls index) everything falls back to the `:root`
  cerulean default; the Dex filter bar keeps one neutral selected state.
- A gate-1 run day is genuinely gray (Boulder = pewter) and gate 0 is
  near-white (Pallet). Deliberate — the climb should feel like travelling
  Kanto — revisit only if playtests hate it.
- DVTD-g8ty (per-category collectible swatches, draft) must not reintroduce
  category *theming* if built; its chips would be collection artwork, not a
  theme driver.
- The answer review dropped the category label outright rather than de-coloring
  it (DVTD-dqbc). Its rows are already labelled by outcome and the expected /
  received diff is what the page exists for, so a category name beside every
  question was a third label competing for the same line. Coverage-by-category
  is where a run's category story gets told.
