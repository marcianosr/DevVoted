---
# DVTD-ru6q
title: 'Run-screen polish: slot rows, refusal popover, audit hierarchy'
status: completed
type: task
priority: normal
created_at: 2026-09-05T16:17:20Z
updated_at: 2026-09-05T16:20:54Z
---

Five issues from a /proto-run playtest. Item 1 is a bug; 2-5 are polish.

Changelog: none of these earn an entry. 2-5 are cosmetic; item 1 is /proto-run-only (dev-gated) so it never shipped.

## Todo
- [x] 1. Slot row stops claiming `· empty` at 0 free (ShopView.component.tsx slotRows)
- [x] 1b. Test the 0-free case (no coverage today)
- [x] 2. ArmedPrice: Upgrade price / Uninstall price, both weight=thin
- [x] 3. Offer refusal moves from Row detail to the buy press hint
- [x] 3b. Plural fix in offerRefusalText (shared with the live shop screen)
- [x] 4. SlotTrack EMPTY cell: brighter dash + bg-hatched
- [x] 5. Audits row title to size=base, NAME gains font-bold
- [x] lint + typecheck + tests

## Summary of Changes

Item 1 root cause: the cash row guard was cash.costKb === undefined, and costKb is set whenever capacity exceeds the free four, so occupancy was never consulted. canCashSlot existed but only fed makes, a field the UI never reads. Fixed at the label rather than the guard so the refusal stays visible on the line.

Item 3 note: feeding the refusal straight into IconButton hint REPLACED the button accessible name (IconButton does aria-label={hint ?? label}). Appended it through the existing variadic actionHint instead, so the name keeps its identity prefix and gains the reason.

Item 2: the screenshot was the upgrade arm (saffron badge = variant pay), so both arms were named rather than renaming the one not seen.

Tests: 2093 pass. Two added: the 0-free cash row, and the refusal living on the press rather than in the row description.
