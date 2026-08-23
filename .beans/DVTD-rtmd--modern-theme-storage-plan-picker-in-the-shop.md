---
# DVTD-rtmd
title: 'Modern-theme: storage plan picker in the shop'
status: completed
type: feature
created_at: 2026-08-23T20:03:58Z
updated_at: 2026-08-23T20:03:58Z
---

The subscription ladder as a shop control (ADR-023): pick a cap, pay a per-gate
bill, billed pass or fail.

New `Plan.ui.tsx` (one rung: radio, cap, terms, figure; locked arm carries no cap
or terms so a sealed tier cannot leak) and `StoragePlan.ui.tsx` (the fold: rungs,
the switching blurb, the next-gate bill line). `ShopScreen` takes
`storagePlans?: StoragePlanProps` as data rather than a rendered node.

Fixtures come from the domain, not by hand: `storagePlanLadder(gatesCleared)`
already returns every unlocked plan plus the next one, which is exactly the mock's
four rungs plus one `???`. `+128 / +256 / +512` are cap deltas from the plan in
force and `296 free now` is 512 - 216, matching the shop header's own figure.

Also added the gate swatch to `ShopHeader`, using the same NAME/BADGE consts
`GateHeader` uses so the two headers sit their badge identically.

## Summary of Changes

- `Plan.ui.tsx` + spec + stories (6 tests)
- `StoragePlan.ui.tsx` + spec + stories (5 tests)
- `ShopScreen` gains `storagePlans`; its spec keeps only presence/absence, the
  rung detail moved down to StoragePlan's spec
- `ShopHeader` gains the swatch (+1 test)
- tsc clean, lint + lint:arch clean (710 modules), stories typecheck clean
