---
# DVTD-h9s5
title: Coverage-gated config upgrades (e.g. .js needs 20%)
status: todo
type: story
priority: normal
created_at: 2026-07-25T20:56:36Z
updated_at: 2026-07-27T14:06:41Z
parent: DVTD-u35m
---

Require category coverage before a specific config can be upgraded. E.g. the `.js` config's upgrade is locked until the player has 20% coverage in JavaScript; each upgradeable config would define its own category + threshold pair. Ties config power directly to demonstrated category mastery instead of storage/currency alone.

Sister bean: DVTD-7oa7 (config-upgrade acquisition surface for Tech Debt) — that bean gates upgrades behind accepting Tech Debt; this one gates them behind coverage. The two gating conditions may end up combined (coverage threshold AND TD acceptance) or offered as alternate upgrade paths.

## Open questions

- [ ] Which configs get an upgrade path, and what's each one's coverage threshold?
- [ ] Is the threshold per-category coverage (category the config boosts) or something else?
- [ ] Does the requirement gate purchase, or unlock an "upgrade" action on an already-owned config?
- [ ] Does losing coverage (if that's ever possible) re-lock an already-upgraded config?
- [ ] How does this interact with DVTD-7oa7's TD-based upgrade cost — combined gate or separate path?

## Todos

- [ ] Pick the first config(s) to prototype this on
- [ ] Define threshold values per config
- [ ] Decide interaction with Tech Debt upgrade surface (DVTD-7oa7)
- [ ] UI: show locked/unlocked state + progress toward threshold on config card
