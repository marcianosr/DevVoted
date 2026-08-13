---
# DVTD-p3rf
title: 'Two storage formatters disagree: formatKb(2048) is 2MB, formatStorage(2048) is 2 KB'
status: todo
type: task
priority: low
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T15:37:15Z
parent: DVTD-82c4
---

`src/shared/lib/storage.ts` is 91 lines and 7 exports doing three unrelated jobs.

## Two byte formatters, two units, two spacings

| Function | Output | Call sites |
|---|---|---|
| `formatKb(kb)` | `"512KB"` / `"2MB"`, no space | 4, all in `ShopScreen.ui.tsx` + `displayValue.formatKbGain` |
| `formatStorage(bytes)` | `"512 B"` / `"2 MB"`, with space | 21 (`configs.ts`, `StorageBreakdown`, `BorderShop`, `ShopContainer`, `ConfigCard`, `admin.tsx`, ...) |
| `formatStorageDetailed(bytes)` | | 3 |

`formatKb(2048) === "2MB"` while `formatStorage(2048) === "2 KB"`. Same domain quantity, and the caller has to know which unit their number is in.

`src/shared/lib/displayValue.ts:39-41` exists **explicitly because of this bug class** — its comment names "the same KB amount rolling over to MB in the shop but not in the gate report". It fixed the gate report by delegating to `formatKb` and left `formatStorage` standing.

## Domain policy wearing a shared/lib badge

`getStorageUsagePercentage` and `canAddToStorage` (:79-91) have one caller each, `src/domains/economy/services/configManager.service.ts:63,101`. `canAddToStorage(used, cost, limit) => used + cost <= limit` is an economy rule.

`STORAGE_UNITS` is the genuinely shared piece — 17 files.

## Todo

- [ ] One formatter, with the unit at the type level (extend `displayValue`'s `Kb`)
- [ ] Push `getStorageUsagePercentage` and `canAddToStorage` into `configManager.service.ts`
- [ ] `storage.ts` ends as the units table plus one formatter

## Correction (2026-08-13, same day it was filed)

**The title of this bean is wrong and the framing was misleading.** `formatKb` takes **kilobytes**; `formatStorage` takes **bytes**. So `formatKb(2048)` = 2048KB = `"2MB"` and `formatStorage(2048)` = 2048 bytes = `"2 KB"` — both correct for their own input. Feeding one number to both compares different units. There is no disagreement and no live defect.

Re-typed as a **task**, dropped to **low**, because what is actually here is a footgun rather than a bug: two same-sounding formatters whose input unit is carried only in the parameter name.

And it largely evaporates on its own. Every `formatStorage` caller is legacy:

```
6  domains/economy/components/StorageBreakdown.component.tsx
3  domains/economy/data/configs.ts
2  domains/polls/components/FallenPlayerModal.component.tsx
2  domains/economy/components/Cards/ConfigCard.component.tsx
2  domains/economy/components/BorderShop.component.tsx
1  domains/economy/components/ShopContainer.component.tsx
1  domains/economy/components/ConfigVariantDialog.component.tsx
1  domains/economy/components/Cards/ActiveCard.component.tsx
1  routes/_authed/admin.tsx
```

while `formatKb` is used only by `modules/run/shop/presentation/ShopScreen.ui.tsx` (via `displayValue.formatKbGain`). The byte-based world is the old app, which **DVTD-9qyd** deletes.

### What is still worth doing, after 9qyd

- [ ] Re-check what survives once the legacy callers are deleted; if only `formatKb` remains, delete `formatStorage`/`formatStorageDetailed` with them
- [ ] Put the unit in the type rather than the parameter name (extend `displayValue`'s `Kb`) so the two can never be confused
- [ ] Move `getStorageUsagePercentage` and `canAddToStorage` into `configManager.service.ts` — economy policy, one caller each
- [ ] Delete `parseStorage` (zero callers)

The original todo list below predates this correction.
