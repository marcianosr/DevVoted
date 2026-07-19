# ADR-011: Persistent runs with daily shared segments

## Status

Accepted 2026-07-18. **Supersedes ADR-009 Decision 1** (a run does not span days) and the "expire stale runs" plan it implied (DVTD-j7ip, scrapped). ADR-009's seed machinery, social rationale, and Decisions 2/4/5 survive unchanged. Depends on ADR-005/006/009.

## Context

While designing run expiry, Marciano rejected the one-day-run premise outright: the game is a **roguelite** — a run continues where you left off, across days. ADR-009 had rejected multi-day runs for two reasons:

1. *"Breaks same polls same day"* — that objection targeted depth-based variants (continuing your start-day's sequence, or playing today's sequence from your run position). The segment model below is a shape the spike never considered: it keeps everyone on today's polls.
2. *"Catastrophic death — dying on day 4 burns four days of build"* — this one stands and is **accepted knowingly**. The slower a player paces, the more calendar days one death wipes. A softener is deliberately left open (see Consequences) pending playtest evidence.

## Decision

### 1. A run persists until won or dead — it never expires

There are no stale-run finalizers and no `completion_reason: "expired"`. An `active` run simply waits for its player.

### 2. Each calendar day appends today's shared sequence as a segment

On the first interaction of a new calendar day (relative to the run's last-played segment):

- the run's **unplayed tail is dropped** — polls you didn't reach yesterday are missed, permanently;
- **today's shared sequence** (ADR-009 seed, minus polls already answered in this run — enforced by the `polls_responses_session_run_poll_uniq` index) is **appended**;
- play continues from the start of the new segment.

Same-day resume is unchanged: stop at poll 3, come back tonight, poll 4 is waiting.

Everyone playing on a given day therefore answers the same polls from the top of the same list — the water-cooler moment and per-poll community splits survive intact.

### 3. Gates are indifferent to day boundaries

The 5-poll window (ADR-006) fills across segments. Answer 2 polls Monday and 3 Tuesday: the gate fires Tuesday mid-session. No per-day quota, no forced daily minimum.

### 4. Persistence: a materialized per-run sequence

Hydration can no longer derive the poll list from `daily_run_polls` by the run's single `seed_date` — a run now owns an ordered list built from multiple days. The run's sequence is materialized per run (append + truncate at day rollover) and becomes the hydration source. `runs.seed_date` becomes the run's **start date** (kept for the one-new-run-per-day unique and cohort stats). Session `polls_responses.answer_date` records the day the answer was actually given, not the run's start date.

> ⚠ **Amended (DVTD-li9i, 2026-07-18)**: the one-new-run-per-day unique is dropped — a player may **abandon** the active run (`completion_reason: "abandoned"`; leftover storage banks per `storageCreditRate` in `rules.model.ts` — nothing, as of 2026-07-19) and start fresh the same day. One-answer-per-poll-per-day survives differently: a new run's sequence is today's seed **minus polls the player already answered today in any run**, so community splits stay one vote per player.

## Consequences

- **Positive**: roguelite identity restored; slow players keep their build; the shared daily conversation is untouched; no zombie-run cleanup machinery needed.
- **Negative (accepted)**: a multi-day build dies whole. Softener candidates if playtests show it stings — banked reward per cleared gate, bounded run length, or the pay-to-revive lever (DVTD-uret reframing). Decide with data, not upfront.
- **Leaderboard reshape**: ADR-009's "same-seed daily ranking" no longer describes a whole run. DVTD-1q2y becomes two views: *progress today* (same-day segment, comparable across everyone) and *run completion* (won/dead, gates, duration in days).
- The engine's `polls` array is no longer fixed at run birth — rollover mutates the materialized sequence *outside* the reducer; the reducer stays pure and day-unaware.
