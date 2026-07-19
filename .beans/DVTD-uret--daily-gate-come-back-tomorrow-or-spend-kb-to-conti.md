---
# DVTD-uret
title: 'Daily gate: come back tomorrow or spend KB to continue'
status: todo
type: feature
priority: high
created_at: 2026-07-13T08:23:52Z
updated_at: 2026-07-19T07:44:56Z
parent: DVTD-u35m
---

Retention loop: after clearing 1 gate (a 'day'), the run pauses — the player returns tomorrow to continue for free, OR spends KB (storage) to keep climbing now. Defines the daily boundary, the KB continue-cost curve, and the paywall/return UX.

## Reframed by ADR-009

The original premise — "clearing 1 gate = a day, come back tomorrow or pay" — is **superseded**. A run no longer spans days (that reintroduced catastrophic death). Under ADR-009 a run is a **daily-seeded, shared, self-contained climb**: everyone gets the same seed that day, plays self-paced, death waits for tomorrow's seed.

What survives here: the **retry/monetization lever**, reframed as *pay to revive past a death within today's seed* (not "continue tomorrow's run today"). Keep this bean scoped to that revive/paywall + return UX; drop the day-boundary framing.

## Refinement (2026-07-19)

Marciano: lock the daily gate at **5 polls = 1 gate per day**. Playing past the gate is what the spend-KB option unlocks.
