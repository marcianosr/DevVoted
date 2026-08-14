# ADR-014: Daily gate lock — the day hands one gate's polls; exhaustion is not a terminal

## Status

Accepted 2026-07-25 (DVTD-go7e). **Supersedes** the "poll exhaustion = win" terminal
(an ADR-009 leftover: `SEED_LENGTH = 50` existed purely as headroom so
exhaustion-wins stayed rare) and **amends ADR-011 Decision 2** (the daily segment
is one gate's worth of polls, not the full 50-poll seed). ADR-011's rollover
machinery, Decision 3 (gates fill across day boundaries), and ADR-006's failure
model survive unchanged. Depends on ADR-005/006/009/011.

## Context

The engine treated running out of polls as a win (`run.model.ts`), and a
"victory" banks **100%** of leftover storage into `archived_storage`
(`storageCreditRate`). On a small poll pool this surfaced as a bug: lose every
gate, drain the deck, and the end screen says *won* — with a full cash-out.

That terminal fit ADR-009's model (one self-contained ~50-poll daily deck,
all gates in one sitting). The intended cadence is different:
**1 gate = 1 day = 5 polls.** The day's polls run out, the run locks, five new
polls arrive tomorrow. Running out of polls is the *normal end of every day*,
not an ending of the run — so it cannot be a terminal state.

## Decision

### 1. The daily segment is one gate: `SLICE_WINDOW` polls

The daily shared sequence (ADR-009 seed) is `SLICE_WINDOW` (5) polls, not 50.
Everyone gets the same 5 polls per day — the water-cooler moment sharpens
(5 shared polls beat 50 nobody finishes). A flawless summit takes
`VICTORY_GATE` calendar days; every failed gate adds a day.

### 2. Poll exhaustion is not a state — the lock is derived

When `currentIndex` runs past the sequence, the run is simply **waiting for
tomorrow's segment**. No new `RunStatus`, no engine terminal:
`isAwaitingTomorrow(state)` (status `"answering"` with no poll left) is derived
state, and the `answer` action no-ops without a current poll. The reducer stays
day-unaware (the ADR-011 invariant); the rollover appending tomorrow's polls
*is* the unlock.

*Why derived:* an explicit `"waiting"` status would need the rollover — code
outside the reducer — to flip status back, splitting status ownership across
two places and forcing a snapshot migration.

### 3. Loss semantics: strip-on-fail stands; death only for a bare build

> ⚠ **Superseded by [ADR-021](021-death-at-the-gate-that-empties-the-build.md)**: strip-on-fail stands, but the run dies at the gate whose peel quota would empty the build, not one gate later. Choice (b) below is still the choice; only its death trigger moved.

Considered: (a) no death at all — summit is the only ending; (b) keep
ADR-006's strip-on-fail; (c) any gate loss kills the run.

**Chosen: (b).** Fail a gate → peel N configs, locked until tomorrow; the run
dies only when a bare build fails a gate. The build stays the life bar —
(a) removes the roguelike stake, (c) makes configs meaningless. ADR-011
already accepted knowingly that a multi-day build can die whole; the
proportional `storageCreditRate` (die at gate k → bank k/`VICTORY_GATE`)
is unchanged.

### 4. A partial gate window carries across days

Answer 2 of today's 5 and stop: tomorrow's polls fill the remaining 3 slots
(ADR-011 Decision 3, unchanged). The gate then closes mid-day and the next
window starts immediately — gates drift off day-start alignment, and that is
fine: every 5 answers still close exactly one gate. Partial progress is never
wasted; resetting the window at rollover would be *new* punishment code.

## Consequences

- **Positive**: the false "won" (and its 100% cash-out) is gone; the daily
  cadence the game was designed around finally exists; no schema change — the
  lock is a pure read.
- **Player-visible**: most days end with the run locked — out of polls,
  nothing to answer until tomorrow's segment; victory is only ever the summit.
  Deliberately **no dedicated locked screen** (one was built and removed,
  2026-07-25): the lock exists to stop progression, not to be a destination.
  How the locked state surfaces in the UI is open — today the answer screen
  simply has no poll to serve.
- **Negative / accepted**: a player who abandons mid-day restarts into a
  stub segment (today's 5 minus already-answered) — their first gate completes
  tomorrow. Answering all 5 then abandoning leaves nothing to restart on until
  tomorrow ("No polls left for a run today").
- **Dev friction**: multi-day flows can't be played out in one sitting without
  manipulating the date/DB — a dev-only "advance day" affordance is follow-up
  work.
- ADR-009's "content dependency" shrinks from ~50 to 5 polls/day.
