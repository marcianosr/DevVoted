---
# DVTD-yjjt
title: BuildFooter 'changing' count is hardcoded to 0
status: todo
type: bug
priority: low
created_at: 2026-09-13T09:52:22Z
updated_at: 2026-09-13T09:52:22Z
---

ADR-069 defines `changing` as 'its figure moves on this answer', an overlay on the ready/applies/offline partition. `buildCountsOf` (pollScreen.viewmodel.ts) returns `changing: 0` unconditionally, so the vermillion badge never draws.

Wiring it needs per-answer effect deltas RunView does not carry: ADR-069 itself notes it would come from `autoUpgradeRemaining`, a paid action's doubling fee, and the faucet approaching FAUCET_CAP_KB.

Left out of DVTD-gzbc on purpose.
