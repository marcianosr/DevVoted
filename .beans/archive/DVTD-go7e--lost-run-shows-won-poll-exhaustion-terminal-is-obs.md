---
# DVTD-go7e
title: Lost run shows "won" — poll-exhaustion terminal is obsolete
status: completed
type: bug
priority: high
created_at: 2026-07-24T15:03:09Z
updated_at: 2026-07-25T15:48:53Z
parent: DVTD-u35m
---

## Symptom
Lost a run (0 gates cleared, all fails, coverage 6.3%) but the end screen shows "won" / green.

## Cause
The engine treats **running out of polls as a win** (`run.model.ts:453` + `:512`, documented in `seed.service.ts` SEED_LENGTH comment). The only real win is clearing VICTORY_GATE (5) gates. Worse: an exhaustion-"win" banks **100%** of storage into meta (`queries.ts:452` → "victory" credit rate).

Triggered because the dev DB has few published polls: failing gate 1 a few times empties the deck before the summit is even reachable (<25 polls = summit impossible).

## Real issue: the model contradicts itself
"Exhaustion = win" only fits the **ADR-009** model (one self-contained ~50-poll deck, all 5 gates in one sitting) — which the code implements. The **intended** model (Marciano, 2026-07-24): **1 gate = 1 day = 5 polls, locks after, 5 new polls tomorrow. Poll exhaustion is not a concept.** That's the daily-gate lock — implemented **nowhere** — and ADR-009 explicitly *rejected* it (catastrophic death). ADR-011 reopened cross-day persistence but never added the per-gate lock.

## Decision needed BEFORE any code
In the daily-gate model, what does **losing a gate** do?
- (a) nothing terminal — always continue tomorrow; no "dead" run, summit is the only ending
- (b) strip-on-fail continues (ADR-006); run ends only when the build goes bare
- (c) lose = run over today; a fresh run starts tomorrow

Whether "dead" exists, the summary copy, and storage-banking-on-loss all fall out of this.

## Todo
- [x] Decide loss semantics (a/b/c) — **(b) strip-on-fail** (2026-07-25): fail → peel N, locked till tomorrow; death only when a bare build fails. Window carries across days (ADR-011 D3 survives). Lock is derived state (no new RunStatus) — reducer stays day-unaware.
- [x] Update ADR (supersede ADR-009/011 daily-gate framing) — ADR-014, + ⚠ markers in ADR-009/011
- [x] Remove "exhaustion = win"; implement the daily gate lock

## Summary of Changes

**Decisions (Marciano, 2026-07-25)**: loss = (b) strip-on-fail (death only for a bare build); partial gate windows carry across days (ADR-011 D3 survives); the lock is derived state, not a new RunStatus.

- **ADR-014** (`docs/adr/014-daily-gate-lock.md`): daily segment = SLICE_WINDOW (5) polls, exhaustion is not a terminal; amends ADR-011 D2, marks ADR-009 seed-length stale; ADR README indexed.
- **Engine** (`run.model.ts`): removed `isLastPoll` → "won" mapping in `answer`/`resumeClimb`; `answer` no-ops when no poll is on deck; new derived `isAwaitingTomorrow(state)` selector.
- **Seed** (`seed.service.ts`): `SEED_LENGTH = SLICE_WINDOW` (was 50), comment rewritten.
- **View/routes**: `RunView.isAwaitingTomorrow`; `/run/locked` route; `routesForStatus`/`syncTarget` split "answering" on the lock.
- **UI**: `LockedScreen.ui.tsx` (+ Story — the screen is the daily retention beat that ends every play day) wired via `RunLocked.component.tsx`. Content block left marked for Marciano to shape.
- **Tests**: 5 new engine lock tests, dispatch regression test (mid-window exhaustion stays active, no payout), victory test rewritten as a real summit, locked-route sync tests.
- **CHANGELOG**: "One gate a day" entry.

Verified: vitest (934 passed; 3 failures pre-exist on HEAD in RunHud/RewardScreen specs), oxlint + depcruise, tsc, production build.

**Update 2026-07-25 (DVTD-053t):** the locked screen surface (LockedScreen.ui, RunLocked, /run/locked, routing split) was removed the same day — Marciano: the lock is only meant to stop progression, not to be a destination. The engine mechanic from this bean (no exhaustion-win, answer no-op, isAwaitingTomorrow, SEED_LENGTH = SLICE_WINDOW) stands. Surface design continues in DVTD-uret.
