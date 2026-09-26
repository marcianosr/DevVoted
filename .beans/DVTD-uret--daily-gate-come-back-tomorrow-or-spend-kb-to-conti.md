---
# DVTD-uret
title: 'Daily gate: come back tomorrow or spend KB to continue'
status: todo
type: feature
priority: high
created_at: 2026-07-13T08:23:52Z
updated_at: 2026-09-12T12:58:04Z
parent: DVTD-615s
---

Retention loop: after clearing 1 gate (a 'day'), the run pauses — the player returns tomorrow to continue for free, OR spends KB (storage) to keep climbing now. Defines the daily boundary, the KB continue-cost curve, and the paywall/return UX.

## Reframed by ADR-009

The original premise — "clearing 1 gate = a day, come back tomorrow or pay" — is **superseded**. A run no longer spans days (that reintroduced catastrophic death). Under ADR-009 a run is a **daily-seeded, shared, self-contained climb**: everyone gets the same seed that day, plays self-paced, death waits for tomorrow's seed.

What survives here: the **retry/monetization lever**, reframed as *pay to revive past a death within today's seed* (not "continue tomorrow's run today"). Keep this bean scoped to that revive/paywall + return UX; drop the day-boundary framing.

## Refinement (2026-07-19)

Marciano: lock the daily gate at **5 polls = 1 gate per day**. Playing past the gate is what the spend-KB option unlocks.

## Model change 2026-09-12 (DVTD-nd6r)

Check this against ADR-071 before building. A draft of that ADR let a SHAKY gate
pay KB to advance, and it was deleted the same day: what makes a retry hollow is
re-running the same attempt, not getting it for free, and keeping KB out of the
gate keeps it spent on capacity and configs. The rejection is recorded in
`rejected.md` under "Buying past a missed gate with KB".

Paying to continue *within* a day is a different thing from paying past a gate
outcome, and it may survive. But the two are close enough that the distinction
has to be stated, or this bean reopens a direction that was just closed.

ADR-071 also adds a new reason the daily boundary matters: a gate that closes in
OK or SHAKY repeats tomorrow, so "come back tomorrow" is now the price of a
miss, not only the pace of a clear.
