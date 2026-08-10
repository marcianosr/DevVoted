---
# DVTD-ldgu
title: 'Reward screen: storage gauge, swatch chip, simplified copy'
status: completed
type: task
priority: normal
created_at: 2026-08-10T13:04:22Z
updated_at: 2026-08-10T13:20:36Z
---

RewardScreen.ui.tsx: add StorageGauge (used/cap) to the gate-cleared screen, show the cleared gate's swatch chip beside its name, replace the 'Storage buys configs' line with 'Spend your storage in the shop for various upgrades!', and shorten the shop CTA to 'Shop'.

## Summary of Changes

- RewardScreen.ui.tsx: added `storage`/`capKb` props, rendered `StorageGauge` (reused from `presentation/run/`) below the payout number.
- Cleared-gate header now shows the gate's `SwatchMark` chip beside its (swatch-themed) name, following the same pattern as GateStakeReceipt/GateRewardReport.
- Copy: "Storage buys configs. You just earned some." -> "Spend your storage in the shop for various upgrades!"
- Shop button label: "Spend it -> the shop" -> "Shop"
- Wired `storage`/`capKb` through both call sites (RunReward.component.tsx, proto-run.tsx) from view.storage/view.storageCap
- Updated RewardScreen.spec.tsx and RewardScreen.stories.tsx for the new props/copy/button label
- Verified: tsc --noEmit clean, oxlint clean on touched files, RewardScreen.spec.tsx 14/14 passing

## Follow-up: restructure to match new mock

- Layout: dropped centered/text-center composition for a left-aligned flow (Screen already pads/left-aligns; matches the new mock's flush-left header).
- Split "+32KB storage" into a big number + "storage earned" label underneath.
- Added a new line: the cleared gate's swatch via SwatchLabel + " unlocked" (e.g. "Pallet Swatch unlocked"), reusing the existing SwatchLabel component designed for exactly this ("the reward report's payout line").
- Copy: "Spend your storage in the shop for various upgrades!" -> "Spend storage on configs, upgrades and patches."
- Buttons: swapped order (shop first) and copy — "Enter shop →" (primary) then "Review answers" (neutral, dropped "your"/arrow).
- Updated RewardScreen.spec.tsx (15 tests, all passing); tsc/oxlint clean.
