---
# DVTD-c0d0
title: CheckStatus.progress is a formatted string the domain then sniffs
status: completed
type: task
priority: normal
created_at: 2026-08-13T10:38:40Z
updated_at: 2026-08-13T17:32:52Z
parent: DVTD-82c4
---

`CheckStatus.progress` (`effect.model.ts:45`) is a pre-formatted string built at 7 sites in shapes that vary per check: "2/3", "not seen", "12%/20%", "3/5 categories". The numbers behind it are already on the same type as `current` and `target`.

Two consequences:

1. `configRole.model.ts:59` runs a regex over it — `isCounter = /^[\\d/%.]+$/` — to decide **layout**: counters go in the value column, prose drops under the description. A presentation decision made in the domain by sniffing the shape of a string.
2. It is the one remaining formatted string in `GateRewardValue`, which is why that union carries a `checkProgress` variant instead of being all quantities (DVTD-52f2).

Fix shape: give `progress` a structured type (ratio / percentOfTarget / categories / remark), let the screens format it, and let the value-vs-note placement follow the variant instead of a regex.

Not urgent: nothing is broken, and DVTD-52f2 isolated the debt behind one named variant rather than leaving it spread.

## Todo
- [x] Model `CheckStatus.progress` as a union across the 7 producers in `effect.model.ts`
- [x] Replace `isCounter`'s regex with a variant check
- [x] Take the string out of `GateRewardValue`'s `checkProgress` variant (kept the variant — see below)

## Summary of Changes

`CheckStatus.progress` is now `CheckProgress`, a nine-variant union in
`config/domain/effect.model.ts`. Each variant names what it counts, because
that is what decides how it reads:

| variant | reads as |
|---|---|
| `answers` | `2/3` |
| `coverage` | `12%/20%` |
| `categories` | `3/5 categories` |
| `cover` | `2/3 passed` (the defeat device's cover) |
| `notSeen` | `not seen` |
| `missStreak` | `1 miss — the next one fails` / `missed 2 in a row` |
| `hidCheck` | `hid Coverage` |
| `checksFailing` | `2 checks failing` |
| `reportedPassing` | wraps the tally it is lying about |

Every player-facing string is byte-identical to before.

**The regex is gone.** `configRole.model.ts` no longer builds `status`/`note`;
`RoleRow` carries `progress` and `RoleList.ui.tsx` decides the column via
`isCounterProgress`. The words come from `describeCheckProgress`, which sits in
`PipelineReportRow.ui.tsx` beside `describeRow` for the same stated reason: the
role list and the gate report show the same check and must not phrase it two
ways.

`reportPassing` no longer string-concatenates `" (reported passing)"` onto
whatever the check said. The lie is a variant wrapping the real tally, so the
fraud stays one fact rather than a suffix that later code has to parse back off.

### Deviation from the third todo

The bean asked to **drop** `checkProgress` from `GateRewardValue` so the union
would be "all quantities". Kept as a variant, now carrying `CheckProgress`
instead of a string. Reason: "not seen" and "hid Coverage" are not amounts of
anything, so folding them into `Percent`/`Kb`/`Count` would have meant inventing
a quantity that does not exist. The debt the bean was actually pointing at — the
raw string — is gone.

### Tests

- `configRole.model.spec.ts`'s placement test moved to `RoleList.spec.tsx`, where
  the decision now lives, and became two rendered assertions instead of a shape
  assertion. Mutation-verified: making `isCounterProgress` return true for
  everything fails "drops a wordy tally under the description".
- Six domain specs that pinned the formatted strings now pin the facts. Copy is
  presentation's to change; the domain spec should not break when it does.
- 1479 passing (was 1478), tsc clean, oxlint clean, dependency-cruiser 0
  violations across 532 modules.
