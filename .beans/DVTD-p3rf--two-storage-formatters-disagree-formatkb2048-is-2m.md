---
# DVTD-p3rf
title: 'Two storage formatters disagree: formatKb(2048) is 2MB, formatStorage(2048) is 2 KB'
status: todo
type: bug
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T13:46:18Z
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
