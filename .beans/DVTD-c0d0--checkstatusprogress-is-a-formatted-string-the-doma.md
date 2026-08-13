---
# DVTD-c0d0
title: CheckStatus.progress is a formatted string the domain then sniffs
status: todo
type: task
priority: normal
created_at: 2026-08-13T10:38:40Z
updated_at: 2026-08-13T10:38:40Z
parent: DVTD-82c4
---

`CheckStatus.progress` (`effect.model.ts:45`) is a pre-formatted string built at 7 sites in shapes that vary per check: "2/3", "not seen", "12%/20%", "3/5 categories". The numbers behind it are already on the same type as `current` and `target`.

Two consequences:

1. `configRole.model.ts:59` runs a regex over it — `isCounter = /^[\\d/%.]+$/` — to decide **layout**: counters go in the value column, prose drops under the description. A presentation decision made in the domain by sniffing the shape of a string.
2. It is the one remaining formatted string in `GateRewardValue`, which is why that union carries a `checkProgress` variant instead of being all quantities (DVTD-52f2).

Fix shape: give `progress` a structured type (ratio / percentOfTarget / categories / remark), let the screens format it, and let the value-vs-note placement follow the variant instead of a regex.

Not urgent: nothing is broken, and DVTD-52f2 isolated the debt behind one named variant rather than leaving it spread.

## Todo
- [ ] Model `CheckStatus.progress` as a union across the 7 producers in `effect.model.ts`
- [ ] Replace `isCounter`'s regex with a variant check
- [ ] Drop the `checkProgress` variant from `GateRewardValue`
