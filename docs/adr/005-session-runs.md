# ADR-005: Session runs and the two-loop model

## Status

Accepted. Phase A (scaffolding) shipped; the three questions that blocked Phase C are now resolved (see below). Remaining open items are deferred to later phases, not blocking.

> **Naming (2026-07-17):** the module and all UI are named plain **"run"** (`src/modules/run/`, `Run*` identifiers). "Session run" survives only as this ADR family's historical term for the concept — and as the `mode: "session"` column value, which is a schema discriminator, not product naming.

## Context

DevVoted serves one daily poll per calendar day, and a "run" *is* that daily-poll stream: a run advances one poll per real day, gates evaluate every 5 polls, so a full run spans ~a month. This couples two experiences that want different rhythms:

- A **daily poll** wants to be a shared, ~1-minute, social ritual — the identity and retention hook.
- A **roguelike run** wants momentum in a sitting and cheap retry — a build coming online, escalating tension, win-or-die-then-go-again.

Stretching a roguelike across a month makes death catastrophic (weeks lost to one gate) and prevents the build from ever "coming online." A throwaway vertical-slice prototype (`src/domains/runs/prototype/`, validated as fun) confirmed the loop works at **session speed**: configure a pipeline of tags, face escalating gates, draft/upgrade between them, strip-on-fail, summit or die.

We are therefore splitting into **two loops**:

- **Loop 1 — Daily Poll**: unchanged in spirit. One shared poll/day, leaderboard, social. Also grants *fuel* to the player's economy.
- **Loop 2 — Run**: opt-in, played at the player's own pace (a run advances by *polls*, not days), drawing from a *practice bank* of past daily polls. Gates, builds, and strip-on-fail happen at session speed.

A key enabling finding: the gate/pipeline/coverage engine (`pipelineEvaluator.service.ts`, `progress.service.ts`, `window.queries.ts`) is already **poll-count-based, not date-based**. Session runs need a new poll-supply and answer path *alongside* the untouched daily poll — not a rewrite of the core.

## Decision

**Represent a session run as a discriminated `runsTable` via a new `mode` column (`"calendar" | "session"`, default `"calendar"`), rather than a separate `session_runs` table.**

Rationale:

- The overwhelming majority of run logic — gate evaluation, coverage, storage, pipeline slots — is already loop-agnostic. A `mode` column reuses `getActiveRunByUserId`, `incrementRunProgress`, `pipelineEvaluator`, etc. unchanged.
- A separate table would duplicate ~15 columns and force every query in `run.queries.ts` to be written twice.
- The cost — every future runs query must be mode-aware where behavior diverges — is smaller than that duplication, and is localized to the few date-coupled paths (poll supply, answer gating, the daily shop/deck ritual).

Existing runs default to `"calendar"`, preserving current behavior with no backfill.

## Consequences

- **Positive**: the validated prototype logic ports into the `runs` domain largely intact; the daily poll path is untouched in Phase A; the change is a single additive, defaulted column (safe migration).
- **Negative**: `mode` becomes an implicit filter contract — queries that must diverge by cadence have to remember to branch on it. Mitigated by keeping divergence confined to the poll-supply/answer-gating layer.

## Resolved since acceptance

**2026-07-12 — Phase C unblocked:**

- **`polls_responses` uniqueness** `(poll_id, user_id, answer_date)`: **Resolved.** The one-answer-per-day rule applies to **daily/calendar responses only** (partial constraint `WHERE run_id IS NULL`). Session responses instead enforce **one answer per poll per run** (`(run_id, poll_id)`), so a run can freely replay past daily polls — including ones answered today — without tripping the daily guarantee. The practice bank is well-stocked for this (~475 real polls today vs. ~25 polls per run), so replay variety is ample.
- **Daily poll ↔ runs coupling**: **Resolved — decouple.** The daily poll becomes "record answer + grant fuel + update leaderboard" and no longer touches `runsTable`. Runs are opt-in session things.
- **In-flight run migration at cutover**: **Resolved.** Existing calendar runs are **let to finish** (read-only / no new gate mechanics changes); **no new calendar runs are created** after the switch. No wipe, no forced conversion.

**Cadence, seed model, and session-window size** — resolved by [ADR-009](009-session-run-cadence-daily-seeded-shared-run.md): a run is a daily-seeded, *shared*, self-contained climb (same polls for everyone that day), self-paced, gate = 5 polls, summit at `VICTORY_GATE` gates (live-tuned constant in `rules.model.ts`), death waits for the next day's seed.

**2026-07-17 — persistence shape (refines "persist to runsTable"):**

- **Engine state lives in a 1:1 `run_states` satellite table**, not a JSON column on `runs`. This does not reopen this ADR's decision — `runs` stays the single identity table all FKs point at; `run_states` is an extension row (like `run_shop_offerings`). Chosen because `runs` already carries four legacy JSON columns (mode confusion), and every action dispatch rewrites state — a narrow row isolates the hot path and gives `SELECT … FOR UPDATE` a clean target. The blob is `RunSnapshot` = `RunState` minus `polls`; a few columns (`engine_status`, `gates_cleared`, `coverage`, `polls_answered`) are denormalized for queries.
- **The daily shared seed is persisted** (`daily_run_seeds` + `daily_run_polls`, one row per position), not recomputed: mid-day poll-pool changes must never fork ADR-009's shared climb. `runs.seed_date` records the start date. *(The one-run-per-player-per-seed unique was dropped 2026-07-18 — same-day restart, see ADR-011 amendment.)*
- **Per-answer `polls_responses` rows are deferred** (slice 2). The partial-constraint plan above needs a local `mode` column on `polls_responses` — Postgres partial-index predicates cannot join to `runs.mode`.
- **End-of-run economy bridge (decided; abandon rate amended 2026-07-18, DVTD-li9i):** leftover run storage (KB) credits `users.archived_storage` (bytes) the moment the run ends, atomically in the ending transaction:

  | Run ends by | Credit to meta storage |
  |---|---|
  | Victory | 100% of leftovers |
  | Death | 100% of leftovers |
  | Abandon | `ABANDON_STORAGE_CREDIT_RATE` (see `rules.model.ts`) of leftovers |

  Death pays full rate on purpose — losing the build is the punishment; every run feeds meta-progression. Abandoning takes the haircut so it can't be a free cash-out. Run-*start* fuel cost stays open (ADR-009).

## Still open (deferred to their phases)

- **Fuel currency shape** (leaning: it *is* storage, the run currency from ADR-006) and **leaderboard shape/volume** — see ADR-009's open list.
