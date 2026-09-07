# ADR-065: Standouts are six climb-shaped awards

## Status

Accepted (2026-09-06, Marciano, DVTD-wii3). Reshapes the nine-award roster
from DVTD-wp69 and moves the community board onto the terminal-theme kit.
Ships the "comeback clear" idea wiki §7.3 had parked.

## Context

The terminal reskin of `/run/community` came with a six-box standouts mock,
and reviewing the shipped nine against ADR-042's anti-pillar 4 ("an award for
a behaviour teaches players to farm that behaviour") showed most of them
rewarding reflex or repetition rather than the climb.

## Decision 1: the roster is exactly six, in grid order

deepest · against the room · clean sweep · widest build · travelling light ·
comeback. The registry order in `standouts.model.ts` is the grid order, and
that file owns every threshold.

Pillar-1 check per award: *deepest*, *widest build* and *travelling light*
report a standing already public on the climb map. *Against the room* rewards
being right where the room was wrong — knowledge, not speed. *Clean sweep*
rewards a perfect window, the accuracy the game already teaches toward.
*Comeback* rewards recovering from loss, which is what a roguelite dignifies.

## Decision 2: the timed and repetition awards retire

Fastest answer, first to answer and first good die: reflex is not a skill
axis, and a clock award teaches rushing the reveal. Most *{category}* dies as
directly farmable. Longest streak and most coverage die as duplicate signals —
the map shows depth and coverage is the score, not a reward
(coverage-is-score). The `answer_time_ms` capture in `polls_responses` stays;
only the awards read it no longer.

## Decision 3: what each award measures

- **deepest** ranks `trackPosition` (gate and polls into it), not gates alone.
- **against the room** takes the poll with the lowest right-share at or below
  `AGAINST_ROOM_MAX_SHARE`, ties to the latest poll in the viewer's sequence;
  the winner among its correct answerers falls to the player-id tie-break.
- **clean sweep** walks the settled answer history back in `SLICE_WINDOW`
  chunks and attributes the first perfect chunk one gate per step behind
  `gatesCleared`. A replayed failed gate shifts that attribution by one —
  accepted as an approximation; exact attribution needs per-window gate ids in
  the snapshot.
- **widest build** ranks slots held (was config count), so the number shown is
  the number ranked.
- **travelling light** ranks depth first, then the lighter build, as the
  single score `gatesCleared * TRAVELLING_LIGHT_STRIDE - configCount`; pin
  starts that have cleared nothing are ineligible.
- **comeback** ranks `configsLost` with a floor of `COMEBACK_MIN_LOSSES`,
  eligible once `gatesCleared > startedAtGate`. A run whose losses all sit at
  its current, not-yet-recleared gate can over-credit — accepted; the exact
  version needs a second snapshot field.

## Decision 4: the run counts its own losses

`RunState.configsLost` is a new cumulative counter, bumped on a strip peel, a
decay deletion and a subscription lapse (never on a voluntary sell or drop,
never on a minify). Old snapshots read it as zero, so comeback counts from
ship day with no backfill.

## Consequences

- `StandoutInput` slims to answers, eligible poll ids, the correctness
  callback and run stats; seed-drop time, answer timing and category inputs
  are gone, and `fetchDailySeedCreatedAt` with them.
- `fetchActiveRunStats` extracts `pollsIntoGate`, `configsLost`,
  `startedAtGate` and per-config footprints (for slots held) instead of
  coverage and streak.
- Every community read now resolves `users.equipped_border_id` through the
  border catalog, so all community chips wear the equipped border
  (the DVTD-95k3 deferral lands).
