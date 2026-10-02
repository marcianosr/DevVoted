---
# DVTD-khhw
title: Shop and poll props come from the viewmodel
status: completed
type: task
priority: normal
created_at: 2026-09-25T19:45:48Z
updated_at: 2026-09-30T17:18:32Z
parent: DVTD-y3vn
---

**What:** The shop screen and the poll screen get their props from one application function each, and the wiring components hold only hooks, local state and that one call.

**Why:** The shop wiring encodes which services you can buy, at what cost and the two-press abandon, and the poll wiring sequences twenty viewmodel helpers; both are tested only by rendering.

## Done when
- [x] Shop props are one function over the run view, handlers and local state; the rules are covered through ShopView.spec, which still renders the component
- [x] Service rows derive from the roster and the shop controls, and a ninth sold service fails to compile (the row table is a Record over ShopSoldId)
- [x] Poll props are one function over the run view, handlers and local state; the mood, options and author rules are covered through PollView.spec
- [x] Both wiring components are wiring only (PollView 56 lines, ShopView 66 with its six pieces of local state) and the component specs still render them

## Notes
Plan section "Slice 5" (5a). Convention: `{screen}ScreenPropsFor({ view, on, ui })`. `SHOP_SERVICE_RULES satisfies Record<ShopSoldId, ServiceRowRule>` over `ShopControls`, rows from `REGISTRY_CONTROL_LIST.filter(isSoldInShop)`. Keep `shortfallOf` exported (a factory re-exports it); un-export `OfferDeal`, `pollDifficultyFor`, `pollHistoryFor`. `usePollKeyboard` stays in the component. Do not fold the Dex's service lines (follow-up bean).

## Summary of Changes (2026-09-30)

`shopScreenPropsFor({ view, runNumber, rivalsInReach, on, ui })` in `shopScreen.viewmodel.ts` absorbed `offersOf`, `focusCoverageOf`, the per-service row table, the locked and uncarried rows, `controlsOf` and the footer copy; `ShopView.component.tsx` is hooks, six `useState`s and one call. `pollScreenPropsFor({ view, runNumber, answered, selectedOptionIds, on, ui })` in `pollScreen.viewmodel.ts` absorbed the option, question, author and mood builders and returns null when there is no poll; `PollView.component.tsx` keeps the keyboard hook (`enterActionFor` exported for it). The three copies of the card disclosure state became `useDisclosure(names, openByDefault)` in `src/shared/hooks` with its own spec. `shortfallOf` moved to `~/shared/lib/storage.ts` so the shop and new-run viewmodels share it without a cycle. No new viewmodel specs were written: the seven component specs render the same builders through the components.
