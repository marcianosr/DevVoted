# ADR-011: Persistent runs with daily shared segments

## Status

Accepted 2026-07-18. Supersedes [ADR-009](009-session-run-cadence-daily-seeded-shared-run.md)
Decision 1 and the expire-stale-runs plan it implied (DVTD-j7ip, scrapped).
ADR-009's seed machinery and its Decisions 2, 4 and 5 survive unchanged.

Segment length amended by [ADR-014](014-daily-gate-lock.md): one gate's worth of
polls, not ~50.

## Context

While designing run expiry, Marciano rejected the one-day-run premise outright:
the game is a **roguelite**, so a run continues where you left off, across days.

ADR-009 had rejected multi-day runs for two reasons, and they resolve
differently:

1. *"Breaks same polls same day"* — that objection targeted depth-based variants
   (continuing your start-day's sequence, or playing today's sequence from your
   run position). The segment model below is a shape the spike never considered:
   it keeps everyone on today's polls.
2. *"Catastrophic death, dying on day 4 burns four days of build"* — this one
   stands and is **accepted knowingly**. The slower a player paces, the more
   calendar days one death wipes.

## Decision

### 1. A run persists until won or dead — it never expires

No stale-run finalizers and no `expired` completion reason. An `active` run
simply waits for its player.

### 2. Each calendar day appends today's shared sequence as a segment

On the first interaction of a new calendar day, relative to the run's
last-played segment:

- the run's **unplayed tail is dropped** — polls you did not reach yesterday are
  missed, permanently;
- **today's shared sequence** is appended, minus polls already answered in this
  run;
- play continues from the start of the new segment.

Same-day resume is unchanged: stop at poll 3, come back tonight, poll 4 is
waiting. Everyone playing on a given day therefore answers the same polls from
the top of the same list, so the water-cooler moment and the per-poll splits
survive intact.

### 3. Gates are indifferent to day boundaries

The window fills across segments. Answer 2 polls Monday and 3 Tuesday: the gate
fires Tuesday mid-session. No per-day quota, no forced daily minimum.

### 4. Persistence: a materialized per-run sequence

Hydration can no longer derive the poll list from one `seed_date`, since a run
owns an ordered list built from multiple days. The sequence is materialized per
run (append plus truncate at rollover) and is the hydration source.
`runs.seed_date` becomes the run's **start date**, and session
`polls_responses.answer_date` records the day the answer was actually given.

**A player may abandon and restart the same day** (DVTD-li9i, 2026-07-18), which
dropped the one-new-run-per-day unique. One-answer-per-poll-per-day survives
differently: a new run's sequence is today's seed **minus polls the player
already answered today in any run**, so community splits stay one vote per
player.

## Consequences

- Roguelite identity restored; slow players keep their build; the shared daily
  conversation is untouched; no zombie-run cleanup machinery needed.
- **Accepted cost:** a multi-day build dies whole. Softeners were deliberately
  deferred to playtest evidence rather than chosen upfront; the git tag
  (ADR-036) is the one that eventually shipped.
- The engine's `polls` array is no longer fixed at run birth. Rollover mutates
  the materialized sequence *outside* the reducer, so the reducer stays pure and
  day-unaware — an invariant ADR-014 Decision 2 then leaned on.
