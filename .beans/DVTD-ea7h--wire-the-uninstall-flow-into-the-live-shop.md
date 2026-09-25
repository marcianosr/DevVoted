---
# DVTD-ea7h
title: Uninstall exists in the kit but not in the real shop
status: todo
type: feature
priority: normal
created_at: 2026-09-22T18:49:30Z
updated_at: 2026-09-24T12:49:07Z
parent: DVTD-cb52
---

**What:** Make the uninstall flow reachable from the live shop.

**Why:** The kit demos an affordance the game does not have: the whole flow lives in a story.

## Done when
- [ ] What an uninstall refunds is decided, and matches what the shop actually pays
- [ ] The shop offers uninstall, backed by the real balance, slots and capacity
- [ ] What freeing a slot does to rented build space is decided
- [ ] Specs run against the live viewmodel, not the demo factory

## Notes

Split out of DVTD-7tof, where it sat under 'Held back — needs your call'. **Decided
2026-09-22: wire it in**, rather than delete it.

## What exists

Nine designed, working, fully-specced files under `src/ui/kanto-theme/`: `Modal`,
`Confirm` and `Uninstall`, each with `.ui`, `.spec` and `.stories`. `Uninstall.ui`
composes `Confirm.ui` + `Weight.ui`.

## Why it is unreachable

No file under `src/routes/**` reaches any of them. Production `ShopScreen.ui.tsx` has
**no `onUninstall` prop at all** — the entire flow exists only inside
`ShopScreen.stories.tsx:28-82`, which holds a local `uninstalling` state, opens
`<Modal label=\"Uninstall\">` and renders `<Uninstall onConfirm onCancel />`.

So the kit demos an affordance the game does not have.

## The discrepancy to settle first

`uninstallFor` (`src/test/kantoPoll.factory.ts:126`) computes its refund with
`sellRefund(config)` — the **undiscounted** function. The shop prices everything else
through `sellRefundIn` (`draft.model.ts:64-71`), which accounts for the draft discount and
returns 0 when the shop offers the full roster.

Its surrounding figures are demo constants too: `UNINSTALL_BALANCE_KB = 704`,
`UNINSTALL_SLOTS_USED = 7`, `UNINSTALL_CAPACITY = 10` (`:122-124`).

So the first question is not 'where does the button go', it is **what an uninstall is
worth**. Answer that against `sellRefundIn` before wiring anything, or the live shop will
quote a refund it does not pay.

Related: ADR-082 made build space rented by the gate, so freeing a slot mid-run has
consequences the story's fixed `capacity: 10` does not model.

- Decide the refund rule: `sellRefundIn` (discount-aware) or flat `sellRefund`
- Add `onUninstall` to `ShopScreen.ui` and its props
- Back the modal with real balance/slots/capacity from `shopScreen.viewmodel.ts`
- Decide what an uninstall does to build space under ADR-082
- Spec the refund and the freed slot against the live viewmodel, not the factory
