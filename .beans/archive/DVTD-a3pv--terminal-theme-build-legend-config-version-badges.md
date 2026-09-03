---
# DVTD-a3pv
title: 'Terminal theme: build legend, config version badges, buy-slot row'
status: completed
type: task
priority: normal
created_at: 2026-09-01T11:02:48Z
updated_at: 2026-09-01T11:12:28Z
---

Feedback round 4 on the terminal-theme Storybook island (images 119-122).

- [x] Marker legend under the build (running / sitting out / you can use it / an audit stopped it)
- [x] Dot gains action + blocked variants (replaces info)
- [x] Config version badges (v1/v2) on build rows
- [x] Upgrade shows the change: v1 -> v2 and stat x1.75 -> x2
- [x] Buying an extra slot renders as a build row (+ buy slot 6 / detail / price)
- [x] Stories updated across the island
- [x] lint + tsc + story typecheck + tests

## Summary of Changes

New primitives: `Legend.ui` (marker key, hides under 2 markers, lists only markers in use), `Change.ui` (`from → to` badge pair, muted → viridian), `Version.ui` (v1/v2 badge), `BuySlotRow.ui` (+ lead, label, reason, celadon price press). Each has a story.

`Dot.ui` reworked: variants are now on/off/action/blocked (`info` removed); action is a saffron ⚡, blocked a cinnabar !. Its label map drives both aria-label and the legend text.

`Row.ui` gained a `tag` slot rendered inside the name column, so a version badge sits next to the name instead of floating at the column edge.

Screens: Poll + Reveal render the legend under the build rows; Poll/Reveal/NewRun/Prep/GateHold build rows take `version`; ShopScreen swapped `upgradeLabel`/`onUpgrade` for `upgrade: { version, changes[], label, onUse }` (version bump in the tag, stat changes beside the Upgrade button); Shop + NewRun `buySlot` is now `{ label, detail, price, onBuy }` rendered as the last build row.

Stories: `dot: info` → `action`, Telemetry is the audit-stopped row at the Elite gate, `· v2` details replaced by version badges, buy-slot rows given a reason line.

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors, vitest 2622 passed (3 pre-existing modern-theme RewardScreen failures). Nothing committed.
