---
# DVTD-jozz
title: Compact the StoragePlan section
status: completed
type: task
priority: normal
created_at: 2026-09-02T20:22:39Z
updated_at: 2026-09-02T20:24:40Z
---

Playtest feedback: section takes too much vertical space. Fold held KB into the header meta, drop the zone-labels row and the current-rung row, single action row (next rung + ladder + drop/upgrade). Props and spec assertions unchanged. Also delete orphaned PlanTier from terminal ShopScreen.ui.

- [x] StoragePlan.ui.tsx compact layout
- [x] Remove dead PlanTier
- [x] Verify: lint, tsc, story tsc, tests

## Summary of Changes

Section height roughly halved: held KB moved into the header meta (held / cap / bill on one line), the zone-labels row under the bar deleted (the meter aria-label still names all three zones), the current-rung row deleted (the header already carries it), and one action row remains: faint next-prefix + next cap + rent, ladder summary, drop and upgrade pills on the right rail. At the ceiling the row leads with at-the-ceiling and keeps only the drop. Burn line unchanged (persistent, aria-live, described-by the drop). Props untouched, so every story and spec assertion held without edits. Dead PlanTier type removed from terminal ShopScreen.ui. Verification: lint clean (905 modules), tsc app+stories clean, tests 2635 passed / same 3 pre-existing modern-theme failures.
