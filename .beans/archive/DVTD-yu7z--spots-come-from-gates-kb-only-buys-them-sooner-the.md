---
# DVTD-yu7z
title: Spots come from gates; KB only buys them sooner. The KB cap goes.
status: completed
type: feature
priority: normal
created_at: 2026-08-28T11:29:15Z
updated_at: 2026-08-28T12:13:11Z
---

Marciano, 2026-08-28. The holding cap is not binding (320 held against 1024) so it is doing no work, and the per-gate bill is already the better anti-hoarding brake: a drain pressures continuously, a ceiling only at the top. Bundling cap and spots on one plan row also sells two things at once.

New model: every run reaches the same ceiling (24 spots) on the same gate-staged ladder. KB buys a rung EARLY and never past the ceiling. No holding cap, no per-gate bill, no lapse, no eviction.

Ladder: 4 (start) / 8 gate 2 / 12 gate 5 / 16 gate 8 / 24 gate 11, early at 0 / 64 / 128 / 256 / 512 KB.

- [x] rules.model: StoragePlan -> SpotRung; delete STORAGE_CAP_KB, the bill, the ladder helpers
- [x] run.model: capacityFor off (gatesCleared, boughtRung); drop planDowngraded, gateBillKb
- [x] answer.model: delete chargeStorageBill; a clear that crosses a rung widens on the spot
- [x] shopAction: change-plan -> unlock-rung; drop the finishReward clamp
- [x] viewmodel: drop storageCap/storageBillKb; rung options
- [x] billLedger: the plan line goes, config subscriptions stay
- [x] UI: Storage header is a balance; Plan -> Rung; StoragePlan -> PipelineCapacity
- [x] Over-capacity is now unreachable — decide keep-as-guard vs delete
- [x] Specs, stories, ADR-023/030/044, wiki, CHANGELOG

## Summary of Changes

The subscription is gone, the KB cap with it, and width is now a gate schedule that money can only hurry along. ADR-045 records it and supersedes ADR-023 outright.

### Domain

- `StoragePlan`/`STORAGE_PLANS` -> `SpotRung`/`SPOT_RUNGS`: `{tier, spots, fromGate, earlyKb}`. No `capKb`, no `billKb`. `STORAGE_CAP_KB` deleted.
- `capacityFor(gatesCleared, boughtRung)` = `spotRungFor(rungHeldAt(...)).spots`. Both inputs only climb, so capacity is monotonic — which is what makes over-capacity unreachable rather than merely unlikely.
- `RunState.storagePlan` -> `boughtRung`; `gateBillKb` and `planDowngraded` deleted. `chargeStorageBill` deleted from `answer.model`; `recapacitied` now runs AFTER `gatesCleared` advances, so a clear that crosses a rung widens on the spot rather than a gate late.
- `changePlan` -> `unlockRungEarly`: charges `earlyKb`, records the tier, widens. Cannot reach past the ceiling because `rungAbove` runs out. The "already reached" guard turned out to be unreachable (if the schedule had it, `rungHeldAt` would return it as held) so it is gone with a comment saying why.
- Action `change-plan` -> `unlock-rung`, payload dropped. The zod `Assert` types in `run.validation.ts` were the tripwire that caught every stale call site.
- `billLedger` lost `planBillKb`/`planTier` and its plan line. That was the only bill that ever charged on a miss, so `onMissKb` is now always 0 and a redo costs nothing recurring.
- `finishReward`'s cap clamp deleted; nothing clamps a balance anywhere now.
- Gate Dex: `GateUnlock` kind `plan` -> `rung`, carrying spots alone.

### UI

- `Storage.ui` is a balance with no `Meter`. Same for the legacy `StorageGauge` (name is now a lie; it goes with the legacy HUD under DVTD-9dn0).
- `Plan.ui` -> `Rung.ui` (no radio at all: you do not choose a rung), `StoragePlan.ui` -> `PipelineCapacity.ui`. `RunView.storagePlans` -> `spotRungs`, plus `spotCeiling`.
- Only the rung still ahead says anything besides its width — the gate it arrives on and its price. Marciano's mock had "from the start" and "yours since gate 2" on the held rungs; he cut both, and they are not rendered.
- Dropped the mock's separate "24 is the ceiling" row: the footer line states the rule and the number together, and a row for it as well was the same fact twice.
- `RunShop`'s `disabled: busy` was overwriting the action's own disable rather than adding to it. Fixed while in there.

### Left open, flagged

- The mock's per-spot cell run inside each rung row is not built: the SpotTrack directly above already draws spots as bars, and a third spot visualisation looked like duplication. Easy to add if he wants it.
- No clear-screen announcement when a gate widens the pipeline. The capacity section on the very next screen shows the new rung as held, which is the same news one click later; a second announcement is the kind of doubling he has been cutting all session.
- KB now has one fewer sink and no ceiling, so a large late balance is possible. The top rung's 512 KB is the intended answer and the first number to tune.

Verified: lint clean (787 modules), tsc clean, 2564 passed / 3 failed (the documented RewardScreen baseline, DVTD-9dn0), story typecheck 25 pre-existing errors and none new. Prettier run only on files this bean touched; `config.model.*`, `strip.model.*`, `GateRewardReport.ui.tsx` and `app.css` left unformatted because they are Marciano's WIP or were already dirty at HEAD.
