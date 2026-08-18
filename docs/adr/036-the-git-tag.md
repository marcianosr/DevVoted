# ADR-036: The git tag — a shop-bought cross-run checkpoint

## Status

Accepted — 2026-08-17 (Marciano, DVTD-taxo). Decision 1's flat price replaced 2026-08-18 by a per-gate curve with a gate-10 ceiling (DVTD-yx92). Depends on ADR-035's death model (strip audits) — a checkpoint is only worth buying once gates can kill again. Amends ADR-011's fresh-start assumption (a rescued run opens mid-ladder) and the storage-credit rule of the run-end economy (only gates actually climbed count).

## Context

Under ADR-035 a run dies only at the strip-audit gates (11 and 12) — deep, many real days in. Losing there meant restarting a multi-week climb at gate 1, which punishes exactly the players who got furthest. The fix is a checkpoint the player plants deliberately, named after the thing developers actually use to mark a point worth returning to.

## Decision 1: a shop action, not a config

**git tag** is a shop control beside Rebuild/Lock/Extend (ADR-029's third horizon, extended past the run): sold from gate 4, once per run, **priced by the gate it marks** — 128KB at gate 4, +64KB per gate, 512KB at gate 10 (`pinCostFor`). The price is the tag's worth: a checkpoint at gate 9 saves a week of climbing where one at gate 4 saves an evening, so a flat price made the shallow tag a bad deal and the deep one a steal.

**Gate 10 is the last one that sells it** (`PIN_UNTIL_GATE`). Deeper, a rescue resumes three starter configs into stacked audits and a 4-config peel (ADR-037/038) — the tag would cost a fortune to buy a death. The ceiling also lands the deepest price exactly on the free tier's whole cap. Planting writes the current gate to `users.pinned_gate` — the tag belongs to the account and outlives the run. Not a config: it occupies no slot, has no effect on play, and its whole value lands after death. (Try/catch as the carrier was considered and rejected — a catch handles an error in flight, it does not restore state.)

## Decision 2: burn on use

The next run started after a death checks out at the pinned gate and consumes the tag (`consumePinnedGate`, an atomic read-and-clear). **One rescue per purchase**: the rescued run's shop sells another from scratch, at its own gate's price. A tag that persisted until overwritten would be permanent insurance and is rejected.

## Decision 3: what a rescued run starts with

`createRun(polls, handed, startAtGate)`: `gatesCleared = N`, slots per `slotsForGatesCleared(N)`, the normal starter hand, a stipend of `32KB × N` so the first shop can widen the build, free plan, coverage 0. `startedAtGate` rides the state so the death credit pays only `(gatesCleared − startedAtGate) ÷ GATE_COUNT` — a rescue is a head start, never a cash-out. `canStart` clamps to the base three configs, since a nine-slot start cannot demand nine starters.

## Consequences

- Schema: `users.pinned_gate integer` (migration `20260817150000_add_pinned_gate.sql`).
- Constants (`rules.model.ts`): `PIN_FROM_GATE` 4, `PIN_UNTIL_GATE` 10, `PIN_COST_STEP_KB` 64, `PIN_START_KB_PER_GATE` 32 — all live-tuned.
- Consuming before creating in `startRunService` means a crash between the two costs the tag rather than duplicating it.
- Open: whether abandoning (not dying) should also consume the tag on the next start — today it does, since every fresh start checks out the tag. Revisit if that reads as a griefed purchase.
