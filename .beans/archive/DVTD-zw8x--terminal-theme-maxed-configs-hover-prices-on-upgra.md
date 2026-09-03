---
# DVTD-zw8x
title: 'Terminal theme: maxed configs, hover prices on upgrade/uninstall'
status: completed
type: task
priority: normal
created_at: 2026-09-01T15:26:24Z
updated_at: 2026-09-01T15:30:27Z
---

Shop build rows show one price tag next to two buttons (upgrade and uninstall), so it is unclear which action the figure belongs to.

- [x] IconButton gains `hint`, rendered as the native title tooltip and as the accessible name
- [x] Shop build rows drop the inline price in the idle state
- [x] Upgrade button hover reads "Upgrade for 64 KB"
- [x] Uninstall button hover reads "Uninstall for 16 KB"
- [x] Armed (confirm) state shows the price for both actions
- [x] `maxed` rows render the word "maxed" where the upgrade button sat
- [x] Stories: .js v5 in the Earth shop is maxed; upgrade labels capitalised

## Summary of Changes

`IconButton` gained an optional `hint`, set as both the native `title` tooltip and the accessible name, so the visible label stays short while hover and screen readers get the price.

`ShopScreen` build rows no longer render a price in the idle state. The upgrade button hints `Upgrade for 64 KB`, the uninstall button hints `Uninstall for 16 KB`. The price tag now appears only in the armed (confirm) state, and for both actions rather than only for removal, since that is the moment the figure has to be legible. Confirm labels dropped their inline figures for the same reason.

`ShopBuildRow` gained `maxed?: boolean`. A maxed row shows a faint `maxed` where the upgrade button sat; a row with neither `upgrade` nor `maxed` still shows nothing, which is the not-upgradable case (Overclock, Deprecated). The two states are distinct in the domain too: `isUpgradable` is false both at the level ceiling and for configs with no upgradable field.

Earth shop story: `.js` at v5 is maxed. Upgrade labels capitalised to Upgrade so the hint reads as a sentence and the accessible name contains the visible label.

Verified: lint clean (879 modules), `tsc --noEmit` clean, story typecheck 24 pre-existing errors and none in terminal-theme, tests 2639 passed with the 3 known modern-theme RewardScreen failures.
