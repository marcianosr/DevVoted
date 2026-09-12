---
# DVTD-7uil
title: Wire the closing band to the gate outcome (ADR-071)
status: todo
type: feature
priority: high
created_at: 2026-09-12T10:30:26Z
updated_at: 2026-09-12T12:58:47Z
---

ADR-071 records the decision; survivesGate is still one boolean, so OK and SHAKY are colours with nothing behind them.


## ADR-071 revised, 2026-09-12 (DVTD-2h6o)

The decision changed before any of it was wired. Build to this, not to the
morning version:

- HEALTHY — cleared: swatch won, next gate tomorrow.
- OK — paid, but the gate STAYS SHUT and runs again on five fresh polls. Not a clear.
- SHAKY — same gate again, broken streak, thin balance.
- DANGER — run ends. No retry, no peel.

**The bribe is deleted.** Only HEALTHY advances; OK and SHAKY are the same move
at different prices, and the price is a day.

**Settled 2026-09-12 (DVTD-nd6r): this clock wins.** ADR-037 decisions 1 and 2
are dead, so nothing peels on a miss and a run no longer dies by emptying its
build. The peel survives with a new trigger in ADR-074: it fires when the
build's per-gate upkeep is unaffordable. Build the four outcomes with no peel
anywhere near them.

## Todo

- [ ] Replace `survivesGate`'s boolean with a gate outcome derived from `bandFor` (cleared / repeat / dead)
- [ ] HEALTHY advances and takes the swatch; OK and SHAKY re-deal the same gate on five fresh polls
- [ ] SHAKY breaks the streak; OK does not
- [ ] DANGER ends the run at gate close, before any post-gate routing
- [ ] Pay OK and SHAKY off `gatePayoutKb` on the coverage they proved, which needs no new rule
- [ ] Route a repeat through review -> shop -> prep -> the same gate (ADR-037 decision 3), with no strip step
- [ ] The gate-clear debrief has to read as a non-clear for OK and SHAKY
