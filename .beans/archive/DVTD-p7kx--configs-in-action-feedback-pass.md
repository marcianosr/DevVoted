---
# DVTD-p7kx
title: Configs-in-action feedback pass
status: completed
type: feature
priority: high
created_at: 2026-09-04T11:11:23Z
updated_at: 2026-09-04T11:31:57Z
---

Six defects found while reading the `Terminal/Configs in action` Storybook set (`src/ui/terminal-theme/screens/ConfigsInAction.stories.tsx`). Two are falsehoods on screen, three are missing config chips, one is a missing lock reason. Full plan: `~/.claude-work/plans/clear-i-have-some-lucky-cray.md`.

## Decisions taken

1. The retry chip quotes an honest config **range** derived from the build, not a noun swap on the slot number.
2. `DexChip` is used everywhere a config is currently bare text, run screens included.
3. In a run screen the chip carries the milled `Version` badge, not the catalogue `v2/5` figure: `maxVersion` present means catalogue, absent means badge.
4. WTFPL's Rebuild gets its reason tooltip now; the unlocked-pool filter waits for DVTD-clgs, which has to touch `rollDraft` anyway.
5. "What changed" names the cause of an auto-upgrade, not just the target.

## Todo

- [x] 1. Total is context-aware: `buildTotalFor(view, context)` routes through `coverageForAnswer` with live configs only; `perAnswerPreviewFor` untouched
- [x] 2. Peel forecast helper in `gate.model.ts` (fewest/most configs for a slot quota); five formatters quote it; `PollFact` gains `hint` for the minify caveat
- [x] 3. `DexChip` third union arm (milled badge when `maxVersion` absent); `VersionFigure` comment rewritten
- [x] 3a. Suppressor threaded: `audit.model` export, `AuditView.suppressedBy`, `AuditNote.suppressedBy`, both mappers, `PrepScreen`'s duplicate cue
- [x] 3b. `ChangedRow` gains `version` + `by`, renders a chip
- [x] 3c. `LedgerRow` gains `chip`, config rows render chips
- [x] 4. Auto-upgrade cause: `AutoUpgrade.by`, `RunState.autoUpgradedByConfigId`, `GatePayout.autoUpgradedByConfig`, row detail
- [x] 5. WTFPL: `Button.hint`, `BuyLine.lock`, ShopView sets "Config list exhausted!"
- [x] Story fixtures + specs updated (`PollView.spec` regex, `PollScreen`/`GateClearScreen`/`Audits`/`Ledger`/`BuyLine` stories)
- [x] CHANGELOG entry; wiki 2.6 retry-forecast line
- [x] Verify: `npm test`, `npm run lint`, `npm run build`, stories tsconfig

## Open, flagged not assumed

Lock and Extend also retire under WTFPL but vanish entirely instead of explaining themselves. Wiki 5.2 says the shop always shows why an action is locked, so the same treatment is the consistent move; hidden-vs-locked is a visual call, so it is left out of this pass.

The peel range quotes drops only. Minifying also pays the quota, so the true floor can be zero configs; the tooltip carries that caveat rather than the chip.

## Summary of Changes

Six defects fixed on the live terminal-theme path, plus the slot-bar width Marciano flagged mid-session.

**1. The one real bug.** `buildTotalFor` read `view.perAnswer.coveragePerCorrect`, a context-free forecast folding only `coverageMultiplier` and `coverageAdd`. Cold Start sets `openerCoverageMultiplier`, which that path structurally never reads, so the panel printed `Total ×1` above a row reading `×2` on the exact poll the ×2 was about to pay. It now routes through `coverageForAnswer` — the same function `scoreAnswer` calls — with the poll's `AnswerContext` and an offline-config filter matching `liveConfigsOf`. This closes the whole class, not just Cold Start: focus and cache were equally invisible to the old path. `perAnswerPreviewFor` was left alone; prep and the stake receipt need it context-free, and its rounding must not be re-associated.

`RevealView` calls the same function, so it took the same signature change and already had the context to hand.

**2. Retry cost.** `peelConfigRangeFor(configs, quota)` in `gate.model.ts` walks the sizes biggest-first for the floor and smallest-first for the ceiling. `GateStake` carries it as `peelConfigsOnFailure`, and `countRange` in the kit's `format.ts` prints `Remove 1 config` or `Remove 1–3 configs`. A plain `plural(n, "config")` was rejected: it would have printed "Remove 5 configs" for a 5-slot debt one 8-slot config settles.

`PollFact` gained `hint`, wrapped in the existing `Tooltip`, carrying the slot figure and the minify option — the range quotes drops only, and minifying can undercut its floor.

**3/4. Chips.** `DexChip`'s seen arm now takes `maxVersion` as optional: present means the catalogue's `v2/5` figure, absent means the milled `Version` badge every run screen already draws. `VersionFigure`'s doc comment claimed the badge was the only mid-run mark and was rewritten.

- `AuditNote.suppressedBy` — `suppressorOf` was private in `audit.model.ts` and its result thrown away by `suppressedAuditFor`; it is exported now and rides on `AuditView` as a `Config`, mapped to plain chip data by a shared `chipOf` in `PollView.component.tsx`.
- `ChangedRow` gained `version` and `by`; the row renders a chip instead of name + `Slots` tag.
- `LedgerRow` gained `chip`, so config rows chip while `gate cleared` / `subscriptions` / `balance` stay text. `name` still keys the row and labels the chip.
- `AutoUpgrade.by` / `RunState.autoUpgradedByConfigId` / `GatePayout.autoUpgradedByConfig` carry the cause; `RewardView` names it only when it differs from the target, since Dependabot's roll can land on itself and "Dependabot · by Dependabot" says nothing. That self-hit is exactly what made the screenshot read as if the cause were the change.

**5. WTFPL.** `rebuildAvailable` already returned false and `ShopView` already dropped `onRebuild`, so the button was disabled — it just never said why. `Button` gained `hint` (Tooltip + `aria-label`, mirroring `IconButton`) and `BuyLine` a `lock`. The className rides on both the Tooltip wrapper and the button because the wrapper becomes the flex child only when a hint is present.

**Slot bar.** `SlotTrack`'s `TRACK` gained `max-w-sm`. The segments only ever state a ratio, so spanning a wide panel spent a screenful saying how four slots divide.

## Scope narrowed, deliberately

The plan said all five retry-cost formatters would quote one helper. Three did (`PollView`, `PrepView`, `StartView`). The other two were left:

- `gate/presentation/GateStakeReceipt.ui.tsx` is consumed only by `shop/presentation/ShopScreen.ui.tsx`, the older `/_authed/run` set.
- `ui/modern-theme/Stake.ui.tsx` is the superseded kit.

Both already say "config" off the raw slot number and carry the same overstatement. Threading a range prop no live adapter populates would be dead code across ~6 files of two dead kits. They stay wrong until those kits are either revived or deleted.

Also still open, flagged not assumed: `lockAvailable` and `extendAvailable` go false under WTFPL and both controls vanish rather than explaining themselves, which wiki 5.2 ("the shop always shows why a locked action is locked") argues against. Hidden-vs-locked is a visual call.

## Verification

- `npm run lint` clean — oxlint plus 898 modules cruised, no dependency violations.
- `npm run build` clean, `tsc` included.
- `npm test`: **2679 passed**, 3 failed, 6 skipped, 2 todo. The 3 are the pre-existing `src/ui/modern-theme/screens/RewardScreen.spec.tsx` failures recorded in DVTD-nfnx; modern-theme is untouched by this bean.
- Stories typechecked separately with a scratchpad tsconfig clearing the exclusion: 29 errors, all pre-existing and none in a file this bean touched.
- New specs: 5 for `peelConfigRangeFor`, 3 for the auto-upgrade cause, 2 for the context-aware total (scoped to the Total row, since `×1` also appears on the facts line).

## Not verified

The screens were not opened. Per standing preference, UI changes are not screenshot-checked; the six `Terminal/Configs in action` stories are the place to look, and `max-w-sm` on the slot bar is a width judgement that wants an eye on it.
