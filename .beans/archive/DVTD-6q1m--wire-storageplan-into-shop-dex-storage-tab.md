---
# DVTD-6q1m
title: Wire StoragePlan into shop; Dex storage tab
status: completed
type: task
priority: normal
created_at: 2026-09-02T19:32:49Z
updated_at: 2026-09-02T19:43:39Z
---

Integration of the DVTD-x939 StoragePlan section (user decision 2026-09-02: implement now despite open DVTD-unjq fork).

- [x] StoragePlan.ui.tsx: remove dex link (excluded by decision)
- [x] ShopScreen.ui.tsx: replace PlanRow radio list + Section with StoragePlan; collapse slot band to text while section renders
- [x] ShopView.component.tsx: map StoragePlanView -> new props (upgrade/drop = set-storage-plan tier +/-1)
- [x] Update ShopView.spec.tsx + ShopScreen.stories.tsx (module ShopScreen.spec.tsx untouched — that is the legacy /_authed/run set)
- [x] Dex: Storage ladder as unlockable tab (ui + story, locked as prop)
- [x] CHANGELOG entry
- [x] Verify: lint, tsc, story tsc, tests

## Summary of Changes

- `StoragePlan.ui.tsx`: dex link and onDex removed (user decision); `kbLabel` and `RentText` exported for the Dex panel.
- terminal `ShopScreen.ui.tsx`: PlanRow/PlanTier/RADIO/PLAN_ROW/FREE_RATE deleted; `plan` prop is now `StoragePlanProps` rendered as `<StoragePlan/>` behind the same border-t rule; the Build storage SlotTrack band collapsed to a text reading (`storage: { meta }`, SlotTrack + segmentsOf removed) since the plan meter owns the only bar on the screen.
- `ShopView.component.tsx`: `storagePlanProps()` maps StoragePlanView + balance to the section — current rung from the view, next/previous via options index, upgrade/drop dispatch `set-storage-plan` at tier +-1, both undefined when the shop is audit-locked; slot band meta is now `X of Y · Z free`. `capLabel`/`planTier` deleted; live burn line carries no victim name (the domain burns KB, it does not evict configs).
- `ShopView.spec.tsx`: plan describe rewritten — meter aria-label, upgrade dispatches tier 1, no drop below free, drop-with-burn (812 KB on 1 MB → burns 44 KB, dispatches tier 1); slot reading assertion updated.
- terminal `ShopScreen.stories.tsx`: all four shop variants carry the new plan shape with heldKb matching each header balance (the seafoam variant now legitimately shows the burn state: 1.9 MB held over a 1.5 MB lower cap).
- Dex: new `StoragePanel.ui.tsx` (+ stories) rendering the full 7-rung ladder from STORAGE_PLANS, with `locked` redacting every row; `DexScreen.stories.tsx` grows a Storage tab (`3/7`) plus a StorageLocked variant using the existing TabItem.redacted affordance. Live /dex (modern-theme) untouched — the terminal Dex is the story-level set.
- CHANGELOG: one Unreleased entry in house style.

Verification: lint clean (905 modules), tsc app + stories clean (scratchpad tsconfig over the four touched story files), tests 2635 passed / 3 failed — the same pre-existing modern-theme RewardScreen failures as before this work.

Deferred: the real unlock condition for the Dex Storage tab is Tier-2 business (terminal Dex is not wired to a route yet); dropping multiple rungs still takes one shop visit per rung — flagged to Marciano earlier as a deliberate trade.
