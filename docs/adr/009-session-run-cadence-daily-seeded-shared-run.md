# ADR-009: Session-run cadence — a daily-seeded, shared run

## Status

Accepted. **Resolves** the cadence questions ADR-005 left open (session-window size, seed model, fuel shape as they relate to cadence) and **supersedes the day-gate framing of DVTD-uret** (a run does not span days). Depends on ADR-005 (two-loop split) and ADR-006 (run mechanics).

> ⚠ **Decision 1 superseded by [ADR-011](011-persistent-runs-daily-segments.md)** (2026-07-18): runs persist across days via daily shared segments. The seed model, social rationale, and Decisions 2/4/5 stand.

> ⚠ **Seed length re-decided by [ADR-014](014-daily-gate-lock.md)** (2026-07-25): the daily sequence is `SLICE_WINDOW` (5) polls — one gate per day — and poll exhaustion is no longer a terminal. The "~50 polls/day" content-dependency figure below is stale.

## Context

ADR-005 decoupled the daily poll from runs and established two loops (daily poll = shared ritual + fuel + leaderboard; run = opt-in, self-paced, poll-count-based, drawing from a pool of past dailies). It deliberately left *how a run relates to daily play* open. A design spike worked through it.

The north star that settled the spike is **the water-cooler moment**: colleagues saying *"what did you answer to this crazy poll today?"*, *"did you see the funny one?"*, *"today's was hard, man."* That shared-experience social layer is the product's identity hook — and it only works if **everyone faces the same polls on the same day.**

The spike surfaced one hard incompatibility:

- A **shared seed** (everyone gets identical polls) enables that social layer and a fair same-seed leaderboard.
- A **config that biases *which* polls appear** (e.g. "more HTML") requires each player's poll set to differ.

These cannot both hold on the same polls. The decision below chooses the shared seed, because the social layer outranks frequency-manipulation — and category identity survives as a *value* lever instead (see Decision 4).

Rejected alternatives from the spike:
- **Persistent run across days + daily quota** (the original DVTD-uret framing): reintroduces the catastrophic-death problem ADR-005 removed — dying on day 4 burns four days of build. Also breaks "same polls same day" (players sit at different depths on a given calendar day). *(ADR-011 later adopted persistence in a different shape — daily segments keep everyone on today's polls; the death problem was accepted knowingly.)*
- **Config-shaped personal runs** (different polls per player): keeps frequency-influence but destroys the shared social layer and same-seed leaderboard. Explicitly rejected — the social layer is more important.

## Decision

### 1. A run is a daily-seeded, shared, self-contained climb

> ⚠ **Superseded by ADR-011**: a run now persists across days; each day appends today's shared sequence as a segment. Do not act on the text below.

Each day a **single seed** produces one poll sequence, **identical for every player**. A run is that day's climb. It does **not** span days: death (or stopping) ends today's run; a fresh seed drops tomorrow. This is the "daily run" model (Balatro/Slay-the-Spire dailies).

*Why:* identical daily polls are the precondition for the water-cooler social layer and a fair leaderboard. Self-contained means death only ever risks *today* — never a multi-day build.

### 2. Self-paced within the day; one answer per poll

The player advances the seed at their own pace — answer one poll and stop, or climb deep in one sitting — resuming the same seed any time that day. Each poll of the seed is **answered once** (no re-answering), keeping per-poll community splits honest. Stopping mid-gate is fine; the gate is only judged on a completed 5-poll window (ADR-006 Decision 2).

### 3. Gate = 5 polls; climb to the summit gate; death waits for the next seed

The daily "bite" is **one gate = 5 polls** — finishable in ~2 minutes, the suggested casual dose. Keen players keep climbing: gates escalate up to a soft cap (`VICTORY_GATE` in `src/modules/run/rules.model.ts`, currently 5 — live-tuned), with the shop/escalation/strip-on-fail loop of ADR-006 between gates. Death ends today's climb; the answers already given remain recorded (content is never "burned" — a poll answered in a run is unique per `(run_id, poll_id)`, so future seeds may reuse it, per ADR-005).

### 4. Category configs bias value, not frequency

Because polls are shared, **no config may change which polls appear** (that would desync the seed). Category identity instead rides **value**: Focus configs (`.js`, `.ts`, …) already grant "when this category appears, earn more coverage / carry a mastery demand." "I'm an HTML player" means *HTML pays me more*, not *HTML shows up more*. Frequency-manipulation configs are out of scope by construction.

### 5. Social = per-poll community; competitive = same-seed leaderboard

Since everyone shares the seed, community data is rich and per-poll: for any poll, the split of everyone who answered it. The leaderboard ranks the shared seed fairly (deepest gate / score). The shareable result card ("here's today's seed and what I answered") is the water-cooler artifact.

## Consequences

- **Positive**: the social layer works as intended — same polls, same day, directly comparable answers. Death is never catastrophic. Balance is tractable (a bounded `VICTORY_GATE`-gate run). ADR-006's mechanics port in unchanged; ADR-005's two loops are preserved.
- **Negative**: no "make my categories appear more often" config — a mechanic from the earlier calendar model is dropped. Mitigated by Decision 4 (value-based category identity). Also: the daily seed is a genuine **content dependency** — up to ~50 polls/day drawn from the pool; acceptable given ~475 pooled polls and cross-day reuse, but it sets a content-authoring floor.
- The seed generator becomes authority: it must be deterministic per (date) and shared, and it defines the run's poll supply and ordering — a backend concern (see DVTD-ay5e).

## Open (deferred to their phases)

- **Fuel**: whether starting a run costs fuel earned from the daily poll (ADR-005 leaned "fuel = storage"); not required for the cadence to work. The *reverse* direction is decided (2026-07-17, see ADR-005): leftover run storage credits `users.archived_storage` at run end.
- **Leaderboard shape** (deepest gate vs score) and **retry/monetization** (pay to revive past a death within today's seed — the reframed DVTD-uret lever).
- **Exact seed length / gate cap** tuning (`VICTORY_GATE` is a live-tuned placeholder), and **seed ordering** (difficulty curve, category spread).
