---
# DVTD-xtmj
title: Upgrade panel drops its cost-to-max footer and gains a close
status: completed
type: task
priority: normal
created_at: 2026-09-24T14:28:31Z
updated_at: 2026-09-24T14:31:51Z
---

**What:** Remove the `all the way to v5 costs 448 KB · press to buy v2` footer from the upgrade panel, and give the panel its own close press.

**Why:** The footer prices a climb nobody buys in one go, and the panel can only be shut from the chip button that opened it.

## Done when

- [x] The upgrade panel shows no cost-to-max line
- [x] The panel can be closed from inside itself
- [x] Tests and typecheck pass

## Summary of Changes

- `Upgrades.ui.tsx`: dropped `toMax`, `footerOf` and the divider above it; added an optional `onClose`, rendered as a `×` press on the title row.
- `configChip.viewmodel.ts`: stopped totalling the remaining rungs, so nothing computes a cost-to-max any more.
- `ConfigChip.ui.tsx`: passes its upgrade toggle to the panel as `onClose`, which matters most on a phone where the panel is a bottom sheet detached from the chip that opened it.
- Specs: dropped the three footer assertions, added two for the close press. Story `Closable` shows the in-play shape.
- `CHANGELOG.md`: one Changed entry.

Verified: `npm test` 3682 passed (193 files), `npm run typecheck` clean, `npm run lint` clean (4 pre-existing warnings in untouched files).
