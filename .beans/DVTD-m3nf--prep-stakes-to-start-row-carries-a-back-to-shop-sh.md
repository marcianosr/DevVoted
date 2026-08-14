---
# DVTD-m3nf
title: Prep stake's To start row carries a back-to-shop shortcut
status: completed
type: task
priority: normal
created_at: 2026-08-11T18:29:31Z
updated_at: 2026-08-11T18:32:54Z
---

Playtest note (2026-08-11): the receipt's 'To start / Demands 3+ configs installed' line names the demand but not where to repair it. Add a compact inline '← Back to shop' button on the To start heading row, rendered only when the caller passes a shop action (prep while the run is parked in the shop phase; proto-run prep step). Follow-up to DVTD-f7hs.

## Summary of Changes

- GateStakeReceipt gains `shopAction?: ScreenAction`: a small neutral button right-aligned on the 'To start' heading row (no extra vertical length), rendered only when passed AND the start requirement itself renders (minConfigs >= 2).
- PrepScreen threads it through; RunPrep builds one `backToShop` object worn by both the footer leftAction and the receipt shortcut (rewarding phase only — an answering deep-link prep shows neither); proto-run's prep step passes setRewardStep('shop').
- Specs: shortcut renders + fires / absent without the prop (PrepScreen.spec). CHANGELOG prep-hub entry amended. Verified: tsc clean, 75/75 across PrepScreen/ShopScreen/RunLayout specs; ConfiguringScreen's 10 reds are the known pre-existing set.
