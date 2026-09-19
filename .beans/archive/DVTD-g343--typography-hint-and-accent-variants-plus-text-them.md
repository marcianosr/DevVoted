---
# DVTD-g343
title: Typography hint and accent variants, plus text-theme-muted
status: completed
type: feature
priority: normal
created_at: 2026-09-09T11:35:24Z
updated_at: 2026-09-09T11:35:51Z
---

Two new Typography variants from mocks: a muted 12px hint line and a 14px bold accent in the full theme colour. Needed a per-variant tone column, since the kit had one shared tone constant.

- [x] app.css: text-theme-muted utility at L 0.47, chroma c * 0.2
- [x] Typography: tone moves from a shared constant into the variant table
- [x] hint variant (text-xs, muted) and accent variant (text-sm bold, full theme)
- [x] Specs for both variants, plus a ladder test pinning muted below soft
- [x] Stories: Hint, Accent, QuietestToLoudest, and both added to the Ramp
- [x] lint + typecheck (app + stories) + tests

## Summary of Changes

- `app.css`: new `@utility text-theme-muted` at `oklch(from var(--theme-color) 0.47 calc(c * 0.2) h)`, measured off the mock (`#6c5449` on the `#100b09` ground: L 0.467, C 0.0366). Proportional chroma rather than the fixed chroma `text-theme-faint` uses, so the theme shows through.
- `Typography`: `TONE` was one shared constant for all five variants. It is now a third column in the `VARIANT` table, filled on every row. An optional `tone?` with a default does not compile, since `VARIANT[variant]` is a union of literal member types and destructuring a property some members lack is an error.
- `hint`: `text-xs font-normal`, tag `p`, muted tone. Fills the 12px rung the ladder was missing.
- `accent`: `text-sm font-bold`, tag `span`, `text-theme` at full strength.
- Specs: both variants added to the tag and style tables, per-variant tone tests, and a ladder test asserting muted's lightness sits below soft's by parsing app.css.
- Stories: `Hint`, `Accent`, `QuietestToLoudest` (all twelve themes), plus both added to the shared `Ramp` so `Scale` and `AcrossThemes` cover them.

Verified: `npm run lint` clean (861 modules), `tsc --noEmit` clean, no kanto story type errors, `npm test` 205 files / 3569 passed (10 new) / 6 skipped / 2 todo.

Open: `text-theme-muted` is 2.80:1 on the themed ground, which fails WCAG AA and even the 3:1 large-text floor. L 0.58 would clear 4.5:1. Left at the measured value because it is what the mock specifies. `accent` at full theme strength is likewise under AA on cinnabar (3.9:1) and indigo (2.5:1).
