---
# DVTD-ziss
title: Playtest the gate-4 strip cliff (ESCALATION_CAP needs no change)
status: todo
type: task
priority: normal
created_at: 2026-08-06T15:30:17Z
updated_at: 2026-08-06T15:47:20Z
blocked_by:
    - DVTD-iq13
---

Fallout of ADR-019 (depth decoupled from width), shipped knowingly.

Checks come only from configs (ADR-017) and `ESCALATION_CAP = 3`, so an un-upgraded Unit Tests never demands more than 4 of 5 at any depth. Fewer configs therefore means fewer demands: a three-slot build owes less than a wide one and can climb to gate 12 unpunished. Under ADR-018 the slot ladder hid this; now nothing does.

Marciano's call was to ship the decoupling first and feel where the wall wants to be before tuning it.

Candidate levers, cheapest first:
- [ ] Raise or remove ESCALATION_CAP so deep gates demand the full window
- [ ] Consider a depth demand that does not come from a config, so narrowness stops being a discount (reopens ADR-017 Decision 1 — needs Marciano)
- [ ] Playtest gates 6-12 on a three-slot build and record where it should die

## Measured 2026-08-06 — the wall already exists, do not raise ESCALATION_CAP

Marciano spotted it: `dropCount(g) = 1 + floor(g/2)`, so a build with fewer configs than the strip quota is wiped by one bad window. It starts at **gate 4**, not gate 12.

Driven through the real reducer:

```
3-slot FAILS AT GATE 6: owed 3 strips, 0 configs left after repair
  next window: status=dead | "Gate 6 broke a bare build — run over."
6-slot FAILS AT GATE 6: owed 4 strips, 2 configs left after repair
  next window: status=rewarding | cleared normally
```

Demands are identical narrow vs wide (Correct 1 to 4/5, ESCALATION_CAP-capped, and every config's own check). What differs is the *consequence* of one failure. So width reads as a hit-point pool, which is the tradeoff the decoupling needed.

A flawless 3-slot run does summit: 13 days, 65 polls, coverage 2412%, storage capped.

**Revised recommendation:** leave ESCALATION_CAP alone. The narrow-is-easier worry was wrong on the consequence side. What is left is a playtest question, not a tuning bug:

- [ ] Playtest whether the gate-4 cliff reads as fair or as a gotcha (no warning is shown that a failure here is fatal)
- [x] Surfaced the strip quota inline in the answering pipeline header ("a fail peels 3", cinnabar when it would take everything) — shipped 2026-08-06

Downgraded from high; the ADR-019 open risk is closed.
