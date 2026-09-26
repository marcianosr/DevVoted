---
# DVTD-taxo
title: 'git tag: cross-run checkpoint pin'
status: completed
type: feature
priority: normal
created_at: 2026-08-17T09:51:44Z
updated_at: 2026-08-17T11:21:55Z
parent: DVTD-kulw
blocked_by:
    - DVTD-zjeq
---

Phase C (ADR-036). One-time-per-run shop action (PIN_COST_KB=512, from gate 4): plants a checkpoint at the current gate. After death the next run starts there (slots per slotsForGatesCleared, 32KB-per-gate stipend, tier-1 plan, coverage 0). Burn on use. Persistence: users.pinned_gate column + guarded migration; RunState.startedAtGate fixes the death storage-credit rate.

## Summary of Changes

Shipped 2026-08-17 (ADR-036).

- Domain: PIN_COST_KB 512 / PIN_FROM_GATE 4 / PIN_START_KB_PER_GATE 32 in rules.model; plant-pin action (rewarding only, once per run, gate floor, affordability); RunState.pinPlantedAtGate + startedAtGate; createRun(polls, handed, startAtGate) opens at the pinned gate with slotsForGatesCleared width and a 32KBxN stipend; canStart clamps to the base three.
- Persistence: users.pinned_gate (migration 20260817150000, db:push applied); applyActionToRun mirrors a fresh plant onto the account; consumePinnedGate is an atomic lock-read-clear (burn on use); startRunService consumes before creating so a crash costs the tag rather than duplicating it; death credit counts gatesCleared - startedAtGate only.
- UI: 'git tag' control beside Rebuild/Lock/Extend in the shop (tooltip explains the rescue), planted-tag confirmation line; run.validation schema covers plant-pin.
- Specs: plant guards, rescued createRun shape, base-three start, unpinned no-op; service spec mocks consumePinnedGate.
- Verified: 1518 tests green, lint clean, build + tsc clean.

Open (in the ADR): whether an abandoned run's next start should also consume the tag — today it does.
