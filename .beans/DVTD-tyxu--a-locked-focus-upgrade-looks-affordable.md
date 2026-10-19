---
# DVTD-tyxu
title: A locked Focus upgrade looks affordable
status: completed
type: bug
priority: normal
created_at: 2026-10-15T11:52:31Z
updated_at: 2026-10-15T11:57:36Z
---

**What:** A Focus config's next version can be locked behind category coverage, but its upgrade press shows only the price, so a player with plenty of KB sees a disabled button with no visible reason.

**Why:** A playtester with 844 KB could not upgrade a config for 128 KB and concluded they did not understand the game.

## Done when
- [x] The upgrade press on a Focus chip names the coverage it needs when that is what locks it
- [x] The disabled confirm press says what it needs instead of its price
- [x] The full reason, with the coverage you have, still shows under the upgrade

## Notes
Gate: upgradeCoverageRequired(held) = held x 5 percent run coverage in the focus category (config.model.ts), enforced in shopAction.model.ts upgrade. Reason string from upgradeRefusalOf in configChip.viewmodel.ts, rendered as a muted hint only.

## Summary of Changes

upgradesFor now returns a lock label (needs N% Category) when a Focus config's next version is coverage-locked (upgradeLockOf in configChip.viewmodel.ts). ConfigChip shows it in place of the price on the chip's upgrade press and on the disabled confirm press; the full refusal hint stays under the ledger. Story UpgradeLockedBehindCoverage. Wiki 4.4 and changelog updated.
