---
# DVTD-vokq
title: Old-theme copy still teaches the dead per-gate coverage meter
status: todo
type: bug
priority: normal
created_at: 2026-09-14T15:47:16Z
updated_at: 2026-09-14T15:47:16Z
---

Three live old-theme surfaces describe the meter ADR-073 replaced, which is what makes the gate-boundary re-base read as a loss:

- `RunHud.ui.tsx` popover: "Each gate deals 5 polls and demands a coverage total earned inside them." The meter is cumulative over every slot the run has opened, not earned inside the window.
- `GateStakeReceipt.ui.tsx`: "Earn {demand}% coverage this gate" - same framing. Live on /run/shop, /run/configure, /run/strip.
- `GameLoopExplainer`: "Correct answers earn coverage %. Wrong answers lose %." There is no loss term in the meter at all.

All old-theme, on the /run/* flow being replaced, which is why they were not fixed with DVTD-65yi.

## Todo

- [ ] Decide whether to fix in place or wait for the kanto port
- [ ] Rewrite the three strings
