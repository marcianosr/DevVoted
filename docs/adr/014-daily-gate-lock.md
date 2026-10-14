# ADR-014: Daily gate lock — the day hands one gate's polls

## Status

Accepted 2026-07-25 (DVTD-go7e). Supersedes the poll-exhaustion-is-a-win
terminal and amends [ADR-011](011-persistent-runs-daily-segments.md) Decision 2.
ADR-011's rollover machinery and its Decision 3 survive unchanged. The
accepted cost below amended 2026-10-14 (DVTD-s8we): a run that ended after
answering today spends the day.

**Dead:** Decision 3's death rule;
[ADR-076](076-the-closing-band-decides-what-it-costs.md) owns failure now, and it
leans on this ADR harder than ADR-037 did: a gate that closes in SHAKY is
retried, and the price of retrying is a day, which only means anything because a
day hands one gate's polls.

## Context

The engine treated running out of polls as a win, and a victory banks 100% of
leftover storage. On a small poll pool this surfaced as a bug: lose every gate,
drain the deck, and the end screen says *won*, with a full cash-out.

That terminal fit ADR-009's model of one self-contained ~50-poll daily deck. The
intended cadence is different: **1 gate = 1 day = 5 polls.** The day's polls run
out, the run locks, five new polls arrive tomorrow. Running out of polls is the
*normal end of every day*, so it cannot be a terminal state.

## Decision

### 1. The daily segment is one gate: `SLICE_WINDOW` polls

Everyone gets the same 5 polls per day, and the water-cooler moment sharpens: 5
shared polls beat 50 nobody finishes. A flawless summit takes one calendar day
per gate, and every failed gate adds a day.

### 2. Poll exhaustion is not a state — the lock is derived

When the index runs past the sequence, the run is simply **waiting for
tomorrow's segment**. No new status and no engine terminal:
`isAwaitingTomorrow(state)` is derived, and `answer` no-ops without a current
poll.

*Why derived:* an explicit `waiting` status would need the rollover — code
outside the reducer — to flip status back, splitting status ownership across two
places and forcing a snapshot migration. The reducer stays day-unaware, which is
ADR-011's invariant.

### 3. Loss semantics

Dead as written. Three options were considered: no death at all, ADR-006's
strip-on-fail, or any gate loss killing the run. Strip-on-fail won, because the
build is the life bar: no-death removes the roguelike stake, and instant-death
makes configs meaningless.

That framing survives ADR-037 intact. Only the trigger moved.

### 4. A partial gate window carries across days

Answer 2 of today's 5 and stop, and tomorrow's polls fill the remaining 3. The
gate then closes mid-day and the next window starts immediately, so gates drift
off day-start alignment. That is fine: every 5 answers still close exactly one
gate. Partial progress is never wasted, and resetting the window at rollover
would be *new* punishment code.

## Consequences

- The false "won" and its 100% cash-out are gone, and the daily cadence the game
  was designed around finally exists. No schema change: the lock is a pure read.
- **Player-visible:** most days end with the run locked, with nothing to answer
  until tomorrow. Deliberately **no dedicated locked screen** — one was built and
  removed the same day, because the lock exists to stop progression, not to be a
  destination.
- **Accepted cost:** a run that answered any of today's polls and then ended
  (dead, won or abandoned) spends the day. A new run started after it can be
  built and shopped, but it is dealt no polls until tomorrow's deal. Amended
  2026-10-14 (DVTD-s8we): the new run used to get a stub segment, today's 5
  minus the answered ones, which handed a dead player the polls their old
  run's first gate had already shown.
- **Dev friction:** multi-day flows cannot be played out in one sitting without
  manipulating the date or the DB.
