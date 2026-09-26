---
# DVTD-khhw
title: Shop and poll props come from the viewmodel
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:48Z
updated_at: 2026-09-25T19:45:48Z
parent: DVTD-y3vn
---

**What:** The shop screen and the poll screen get their props from one application function each, and the wiring components hold only hooks, local state and that one call.

**Why:** The shop wiring encodes which services you can buy, at what cost and the two-press abandon, and the poll wiring sequences twenty viewmodel helpers; both are tested only by rendering.

## Done when
- [ ] Shop props are one function over the run view, handlers and local state, with a spec per rule
- [ ] Service rows derive from the roster and the shop controls, and a ninth sold service fails to compile
- [ ] Poll props are one function over the run view, handlers and local state, with the mood, options and author rules tested there
- [ ] Both wiring components are under sixty lines and the component specs still render them

## Notes
Plan section "Slice 5" (5a). Convention: `{screen}ScreenPropsFor({ view, on, ui })`. `SHOP_SERVICE_RULES satisfies Record<ShopSoldId, ServiceRowRule>` over `ShopControls`, rows from `REGISTRY_CONTROL_LIST.filter(isSoldInShop)`. Keep `shortfallOf` exported (a factory re-exports it); un-export `OfferDeal`, `pollDifficultyFor`, `pollHistoryFor`. `usePollKeyboard` stays in the component. Do not fold the Dex's service lines (follow-up bean).
