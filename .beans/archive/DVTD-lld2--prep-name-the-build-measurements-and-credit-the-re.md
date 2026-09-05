---
# DVTD-lld2
title: 'Prep: name the build measurements and credit the reveal'
status: completed
type: task
priority: normal
created_at: 2026-09-04T07:19:34Z
updated_at: 2026-09-04T07:28:33Z
---

- [x] configs / slots as named rows, bar loses its caption
- [x] Revealed lines carry a chip naming the config that revealed them
- [x] Ready strip loses its duplicate Start button

## Summary of Changes

`build` prop is now `{ slots, slotsUsed, rows }` — the UI formats both readings, so Tier 2 stopped shipping two pre-baked strings (`meta`, `count`).

`window.source` (from `prefetcherFor(view.configs)?.label`) renders as a neutral Badge after the tally on type / categories / next gate.

NOT added: a KB line in the build. Configs occupy slots, not storage — 32 KB a slot is what one COSTS at purchase, and the KB ceiling belongs to the storage plan. A "storage 4 / 512 KB" row in the build would invent an occupancy the engine does not model.

## Follow-up

SlotTrack went back to the pre-d6f6259c layout: `basis-0` cells with `flexGrow: slots`, so the bar fills its container and a segment's width IS its slot count; free slots are one dashed cell each rather than one merged block. Kept the current FAMILY_SOLID fills (FAMILY_FILL no longer exists) and the `reading` caption, which now sits under the bar instead of beside it.

Prep footer label was `← change · {balance}`, which read as a toll for going back; it is just "Back to shop" now.
