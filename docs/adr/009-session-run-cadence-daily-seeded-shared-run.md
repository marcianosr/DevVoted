# ADR-009: Session-run cadence — a daily-seeded, shared run

## Status

Accepted 2026-07. Resolves the cadence questions ADR-005 left open. Depends on
ADR-005 and ADR-006.

**Live:** the seed model and Decisions 2, 4 and 5. **Dead:** Decision 1's
one-day self-contained run, superseded by
[ADR-011](011-persistent-runs-daily-segments.md); the segment length is
[ADR-014](014-daily-gate-lock.md)'s 5 polls, not the ~50 this ADR assumed.

## Context

ADR-005 decoupled the daily poll from runs and left *how a run relates to daily
play* open.

The north star that settled it is **the water-cooler moment**: colleagues saying
"what did you answer to this crazy poll today?", "did you see the funny one?",
"today's was hard, man." That shared-experience layer is the product's identity
hook, and it only works if **everyone faces the same polls on the same day.**

The spike surfaced one hard incompatibility. A shared seed enables that social
layer and a fair same-seed leaderboard; a config that biases *which* polls
appear requires each player's poll set to differ. These cannot both hold on the
same polls. Both rejected alternatives are in [rejected.md](rejected.md).

## Decision

### 1. A run is a daily-seeded, shared, self-contained climb

Dead as to "self-contained": a run now persists across days, appending each day's
shared sequence as a segment (ADR-011). **The shared seed itself survives
unchanged** and is the half that mattered: each day a single seed produces one
poll sequence, identical for every player.

### 2. Self-paced within the day; one answer per poll

The player advances the seed at their own pace and resumes it any time. Each poll
is **answered once**, which is what keeps per-poll community splits honest.
Stopping mid-gate is fine, since the gate is only judged on a completed window.

### 3. Gate = 5 polls; death waits for the next seed

The daily bite is one gate, finishable in a couple of minutes. The answers
already given stay recorded: content is never burned, because a poll answered in
a run is unique per `(run_id, poll_id)`, so future seeds may reuse it.

### 4. Category configs bias value, not frequency

Because polls are shared, **no config may change which polls appear** — that
would desync the seed. Category identity rides **value** instead: "I'm an HTML
player" means *HTML pays me more*, not *HTML shows up more*.

This is a permanent constraint on the roster, not a phase. Frequency
manipulation is out of scope by construction.

### 5. Social is per-poll community; competitive is the same-seed leaderboard

Since everyone shares the seed, community data is rich and per-poll: for any
poll, the split of everyone who answered it. The shareable result card is the
water-cooler artifact.

## Consequences

- The social layer works as intended: same polls, same day, directly comparable
  answers.
- The seed generator is authority. It must be deterministic per date and shared,
  and it defines the run's poll supply and ordering.
- The daily seed is a genuine **content dependency**, and it sets a
  content-authoring floor. ADR-014 shrank it from ~50 polls a day to 5.
- ADR-011 reshaped the leaderboard: "same-seed daily ranking" no longer
  describes a whole run, so it split into progress-today and run-completion.
