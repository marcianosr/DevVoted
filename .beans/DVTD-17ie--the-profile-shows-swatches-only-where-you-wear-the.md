---
# DVTD-17ie
title: The profile shows swatches only where you wear them
status: completed
type: feature
created_at: 2026-10-04T11:54:47Z
updated_at: 2026-10-04T11:54:47Z
---

**What:** The profile hero drops its swatch strip, and the Appearance tab names swatches by their gate and says what wearing one does.

**Why:** The strip repeated the swatches trophy, and the tab's tiles truncated a redundant "Swatch" suffix while the one-line meta hid what a swatch is for.

## Done when
- [x] The hero shows no swatch track or minting note
- [x] Each swatch tile is named by its gate alone
- [x] The swatch heading carries one line on what wearing one does

## Notes
ProfileHero loses swatches + note props; swatchPick uses gateName; Appearance swatch header uses Panel.Header summary. ADR-180 amended.

## Summary of Changes
See Notes; specs updated in ProfileHero, profileScreen.viewmodel, swatchPick.viewmodel, Appearance.
