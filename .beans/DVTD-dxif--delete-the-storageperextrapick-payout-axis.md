---
# DVTD-dxif
title: Delete the storagePerExtraPick payout axis
status: draft
type: task
priority: low
created_at: 2026-08-25T11:41:04Z
updated_at: 2026-08-25T11:41:04Z
---

`.length` was the only config on the per-extra-pick axis, and DVTD-9dn0 made it pure information. The axis is now live code with no owner: `Config.storagePerExtraPick`, `extraPickPayoutFor` (pipeline.model), the `extraPickKb` pot and `perExtraPickWeight` (gateReward.model), `extraPickThisGateKb` on RunState/RunView/RewardScreen, and the reducer accumulation in run.model.

Two specs are kept alive only by a synthetic config built for them (`PER_EXTRA_PICK` in pipeline.model.spec and gateReward.model.spec) — delete those with the axis.

Decide first: is a per-extra-pick payout an axis worth keeping for a future config, or is it gone? Removing it touches ~30 sites across 12 files including the reward ledger's pot split, so it wants its own pass rather than riding along with a playtest fix.
