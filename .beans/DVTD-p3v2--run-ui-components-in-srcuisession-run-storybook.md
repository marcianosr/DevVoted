---
# DVTD-p3v2
title: Run UI components in src/ui/session-run (Storybook)
status: completed
type: feature
priority: normal
created_at: 2026-07-12T08:20:00Z
updated_at: 2026-07-12T12:33:39Z
parent: DVTD-5jpw
blocked_by:
    - DVTD-iw6c
---

Presentational components (board, gate checklist, poll card, rewards, strip, climb track), plain props, Kanto colors + typography primitives, stories.

## Summary of Changes
Presentational UI for session-run, colocated in the module's presentation layer (ADR-007 §3 revised: modules own their layers; src/ui is shared design system only).

Location: src/modules/session-run/presentation/{configs,pipeline,gate,poll,run,screens}/

Components (Storybook + unit-tested, all HTML/Tailwind, plain props + callbacks):
- configs/: ConfigChip, ConfigRow, RarityLegend
- pipeline/: Pipeline
- gate/: GateRequirementList (GitHub-style check states), GateTracker, BuildSummary
- poll/: PollCard (single + multiple choice, redacted — no correct flag; reveal state)
- run/: RunSummary (= ended screen), StatBadge (category-themed value)
- screens/: ConfiguringScreen, AnsweringScreen, RewardScreen, StripScreen

Design system: 3 typography primitives (Title/Subtitle/Paragraph) in src/ui; Kanto colors via app.css [data-category-theme]; rarity via app RARITY_COLORS; no Label; no barrels.
91 tests, tsc + oxlint clean, Prettier-formatted.
