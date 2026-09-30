---
# DVTD-148a
title: 'Playtest design tweaks: balance badge, prep band, poll screen'
status: completed
type: task
priority: normal
created_at: 2026-09-29T17:41:42Z
updated_at: 2026-09-29T18:00:11Z
---

**What:** A batch of playtest tweaks across the balance, prep, poll and shop screens.

**Why:** The live playtest showed readouts that float, overflow, repeat themselves or hide that a keyboard works.

## Done when
- [x] The storage balance reads as a green badge with the floppy icon, in the header and the gate ledger
- [x] Prep shows the real space between bands and never leaves its panel
- [x] The poll screen states its keyboard, its poll number, and drops the pay tooltip
- [x] The gate track sits in the header row and the build sits close to the content
- [x] Planning Poker makes clear a number is to be pressed

## Notes
- Prep band: user picked the proportional CoverageBar plus band | range | pays rows over the min-width BandLadder.
- Floor mark on the CoverageBar is named SHAKY: every other mark names the band that starts at its line.
- Removed: the plan row's per-gate note, the poll screen's what-a-poll-pays tooltip.
- Tooltip shuts on mouse leave, so a click on desktop no longer pins it open.

## Summary of Changes

- Badge takes an icon; the inline Balance is a viridian badge by default; the gate ledger total badges green with the floppy.
- BandLadder is now the pinned CoverageBar plus band / range / pays rows (ADR-149 decision 1 rewritten, wiki updated).
- Poll screen: pay tooltip removed, holds badge follows the gate theme, lock-in note names letters then Enter, poll number rides the press marks.
- Header carries the swatch track in the title row (ADR-132 amended); BuildFooter drops mt-auto for mt-2; Tooltip shuts on mouse leave.
- Subscriptions: build space weight is a lead badge (BillLine.weight). Plan row note removed.
- Planning Poker: header meta until called, remedy says press a number.
- ScoringRule.ui (+ spec, stories) deleted; the Tooltip story carries its own hint.
