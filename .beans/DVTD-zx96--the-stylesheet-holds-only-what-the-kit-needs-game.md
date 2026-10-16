---
# DVTD-zx96
title: The stylesheet holds only what the kit needs; game styles sit with their components
status: completed
type: task
created_at: 2026-10-16T09:49:38Z
updated_at: 2026-10-16T09:49:38Z
parent: DVTD-5303
---

**What:** The single stylesheet is split so the kit keeps its tokens and generic styles, and every game style sits beside the component that uses it; rules nothing used are gone.

**Why:** One 2300-line stylesheet mixed the kit with the game and carried rules no screen used, so it could not travel with the kit.

## Done when

- [x] Rules no screen uses are deleted
- [x] The kit's styles live with the kit, game styles beside their components
- [x] The compiled stylesheet is unchanged apart from the deleted rules
- [x] No comments remain in any stylesheet

## Notes

app.css is now 11 import lines. Kit: src/ui/kanto-theme/kanto.css. Game: gateThemes.css, Swatch.css, OutcomeReveal.css (run/gate), coverage.css, build.css (run/build), ConfigChip.css (run/config), runScreens.css (run/run), community.css (run/community), PollMarkdown.css (run/poll).

## Summary of Changes

Deleted 18 unused rules (btn-color-cycle and its keyframes, text-gradient-green, text-legendary, legendary-bar/quick/shimmer/ring-flow, prismatic-border/chip, bg-prismatic, bg-hatched, bg-theme-strong, glow-theme(-soft), score-bump, using-mouse, the data-screen-transition block): 54 compiled rules fewer, nothing else. Split by a postcss script that classifies each block by owner; mixed reduced-motion blocks were split per owner. Compiled CSS compared rule by rule: identical apart from the deletions and Tailwind merging the two Champion rules that now sit together. Rule order changed across files; the only equal-specificity overlap that could apply (.screen-rise > * against the poll card) cannot match, because the card is never a direct child of the screen body. All 89 comments removed (Marciano: no comments in CSS either), CLAUDE.md exemption dropped. Specs read CSS through allStyles() in src/test/styles.harness.ts; CoverageBar.spec's ruleOf anchored to a line start. Build, lint, 337 files / 6273 tests, dead-code check pass.
