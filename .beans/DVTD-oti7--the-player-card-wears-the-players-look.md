---
# DVTD-oti7
title: The player card wears the player's look
status: completed
type: feature
priority: normal
created_at: 2026-09-29T13:04:56Z
updated_at: 2026-09-29T13:22:04Z
---

**What:** The player card wears the player's chosen swatch across its head and shows every title they wear, over a tighter standing.

**Why:** The swatch and titles are the part of a player's look they pick, so every face in the app should show it, not only their profile page.

## Done when
- [x] The card head fades from the player's worn swatch, pallet when none is worn
- [x] Every worn title shows on the card, the first in the swatch colour
- [x] The standing names its gate and reading in one row over a pointer bar, with compact chips and badged figures
- [x] The profile's Climbing section shows the same standing
- [x] Wiki, changelog and ADR say so

## Notes
Plan: /Users/marciano/.claude-work/plans/i-want-to-redesign-drifting-wigderson.md. Close press stays map-card only: the hover tooltip is pointer-events-none.

## Summary of Changes

The card service and the climb map rows carry worn titles and the profile theme. ClimberCard's head wears the theme through data-gate-theme with a fade, and WornTitles quiets titles after the first. Standing is one shape: gate row with badges, CoverageBar pointer mode, compact ConfigChip arm, a dashed free slot and badged tiles. Also ADR-150, a wiki paragraph and the changelog.
