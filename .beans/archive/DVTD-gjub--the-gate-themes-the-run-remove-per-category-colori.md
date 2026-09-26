---
# DVTD-gjub
title: The gate themes the run — remove per-category coloring
status: completed
type: feature
priority: normal
created_at: 2026-08-06T19:44:53Z
updated_at: 2026-08-06T20:08:57Z
---

Category colors removed entirely (JS≠saffron etc.); the current gate's swatch drives the app-wide color scheme during a run (body tint, HUD, question card, buttons) via a new [data-gate-theme] ambient namespace. Decisions with Marciano: (1) Elite ambient = oklch-lightened indigo, chip stays true indigo; Champion ambient = fuchsia solid, gradient stays on chips. (2) Category chips dropped everywhere — category is text-only. (3) Mood themes (celadon cleared / cinnabar failed) stay and beat the gate theme.

## Todo

- [x] viewmodel: RunView.gateTheme = swatchForGate(gatesCleared)?.theme
- [x] Screen.ui: categoryCode → gateTheme (section attr + body mirror)
- [x] app.css: delete [data-category-theme] blocks; add 13 [data-gate-theme] blocks; body tint re-keyed; meter vars inlined
- [x] run flow wiring: RunAnswer/RunConfigure/RunShop/RunCommunity pass gateTheme; RunHud drops category; RunLayout; proto-run
- [x] chip removals: PollCard, AnswerResults, StatBadge, CoverageByCategory, RunCommunity.ui, PracticeBank, ShopScreen, PolldexFilterBar, CategoryTag (delete), Title, ContentSection/Content
- [x] legacy cleanup: delete categoryTheme.ts; strip inert data-category-theme attrs; old routes
- [x] tests updated + new gateTheme mapping specs
- [x] storybook: GateThemes story replaces CategoryColors; story-utils re-pointed
- [x] docs: wiki §2.4/§6.4, CHANGELOG, ADR-020
- [x] npm test / lint / build green (114 files, 1135 tests; oxlint + depcruise clean; tsc exit 0)

## Summary of Changes

ADR-020: categories are colorless, the gate being played themes the app.

- New CSS namespace [data-gate-theme] (13 values) for the ambient run theme; [data-swatch-theme] chip blocks untouched. Summit deviations: elite = oklch-lightened indigo (chip stays true indigo), champion = fuchsia solid (gradient stays on chips). Mood blocks moved after gate blocks so celadon/cinnabar win.
- RunView.gateTheme = swatchForGate(gatesCleared)?.theme; Screen.ui gained gateTheme (replacing categoryCode), sets the section attr + mirrors onto <body> (tint + HUD inheritance). RunAnswer/RunConfigure/RunShop/RunCommunity + proto-run pass it; RunReward/RunStrip keep their moods.
- All [data-category-theme] CSS deleted; --meter-fill/--meter-bg inlined into the meter:: rules as var(--theme-color) directly (re-homing to :root would freeze meters — var() resolves at declaration site).
- Category chips dropped everywhere: PollCard header, AnswerResults rows (category now faint text, \"TypeScript · multiple choice\"), RunCommunity rows, PracticeBank, CoverageByCategory (neutral bordered rows), HUD coverage dropdown, ShopScreen tooltip, PolldexFilterBar; CategoryTag and categoryTheme.ts deleted; Title/StatBadge/ContentSection/Content lost their category props; legacy domains/old-route attrs stripped.
- Storybook: CategoryColors story deleted, GateThemes story added (contrast checklist); withCategoryTheme → withGateTheme (marsh keeps the saffron look); RunHud stories also shed stale streak/configs/checks args from a pre-GateSegmentBar API.
- Docs: wiki §2.4 (color tables removed) + §6.4 + glossary; CHANGELOG headline entry + three amended Unreleased entries; ADR-020 written, ADR-007 design-system bullet superseded, ADR index updated.

Verified: vitest 1135 passed / 114 files, oxlint + depcruise clean, tsc exit 0. Browser walkthrough skipped per Marciano.

Watch item: gate 1 is Boulder pewter — a genuinely gray day; revisit if playtests hate it.
