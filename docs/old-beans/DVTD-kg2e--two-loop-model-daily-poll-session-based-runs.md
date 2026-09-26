---
# DVTD-kg2e
title: 'Two-loop model: daily poll + session-based runs'
status: todo
type: epic
priority: high
created_at: 2026-07-11T17:41:37Z
updated_at: 2026-07-11T19:38:49Z
parent: DVTD-7dqm
---

Foundational restructure resolving the core tension: DevVoted is a once-per-day game wearing a roguelike's clothes. Splits the fused daily-poll/run object into two loops so both can breathe.

## The model (confirmed)
Connective rule: the loops join through **fuel** — the daily poll MAKES it, runs SPEND it. Runs are never hard-gated; the daily just makes the roguelike richer. Daily is a complete game by itself; runs are opt-in depth.

### Loop 1 — Daily Poll (the heartbeat, untouched)
- One shared fresh poll per day. 1-minute. Leaderboard + "who got it first" social layer. This is the identity + accessibility + retention hook.
- Produces: streak, social rank, and FUEL (storage, dust, a premium pack, today's bounty).

### Loop 2 — Run (opt-in roguelike, session-speed)
- Played in a sitting (~15 min): open packs -> slot tags -> build pipelines -> answer practice-bank polls -> gates -> strip-on-fail -> die -> retry instantly.
- Draws from the **practice bank** = past daily polls (repeatable; re-seeing tests retention, not "content burn").
- Produces: Pokedex tag unlocks + archived storage (meta), carries into future runs.

### Poll lifecycle (solves content burn)
New poll -> premieres as a Daily (fresh, shared, its one social moment) -> retires into the run practice bank (repeatable roguelike fuel forever). Every authored poll does double duty.

## Playstyles enabled
Daily-only (Priya), roguelike grinder (Sam), collector (Wei) — plus in-run build styles (specialist/gambler/survivor/economist via Tags).

## Why this over the alternative
Month-long runs + brittleness cushion = sanding corners off a genre that can't breathe at 1 poll/day. Two-loop lets the roguelike actually fire (momentum, cheap retry) while protecting the daily's social/accessibility virtues.

## Scope (honest)
Biggest change in the design conversation. Touches: how polls are served (daily vs practice bank), how runs progress (session-speed, not 1/day), the fuel economy plumbing. Bigger than the Tags epic.

## Todos
- [ ] Spec Loop 1/Loop 2 boundary + fuel economy
- [ ] Poll lifecycle: daily -> practice bank (schema/flag)
- [ ] Session-based run progression (replace 1-poll-per-day gating)
- [ ] Category bounty (rarity-based coverage) on daily + run bank

## Playtest insight (2026-07-11): Loop 1 could BE a Daily Challenge run
While playing the slice, idea surfaced: instead of Loop 1 = one trivia question, make it a DAILY CHALLENGE run — everyone gets the SAME shared seed/polls, plays ~1 gate/day (5 polls), compares on a leaderboard (cf. Balatro daily / Slay-the-Spire daily climb).

This UPGRADES the two-loop model:
- Loop 1 = shared daily-challenge run (ritual + social + roguelike teeth, one attempt/day, shared polls).
- Loop 2 = free session run (random/personal polls, cheap retry, grind/experiment) — as prototyped.

Tradeoff to feel: a daily-challenge run's build arc spans DAYS, so strip-on-fail across days stings more than a 15-min sitting — but a ~4-day run (20 polls / 5) is far better than the original month. Genuine fork; being tested via the slice's run-length toggle (5 = one-gate-a-day feel, 20 = full sitting).

Confirmed in slice: all players get identical polls today (fixed pool) — 'shared' is the intended direction for the daily-challenge model.

## Variable play-frequency model (2026-07-11)
Key principle: a run advances by POLLS, not calendar days (engine is poll-count-based). So frequency is the player's dial, not a design rule. A run is a resumable queue — pauses on leave, resumes on return.
- 1 poll/day minimalist: served fully by Loop 1 (daily poll), need never touch a run.
- 2-4/day dabbler: daily + chips at a self-paced run (gate ~2 days).
- 1 gate (5)/day committed: daily + a gate a day (~5-day climb).
- Binger: daily + whole climb in a sitting.
Caveat: self-paced runs mean a slow player's climb spans real days -> strip-on-fail stings more, but it's their chosen pace and only ~25 polls; loss-averse can stick to Loop 1.

Two run flavors surface (decide later):
- **Free run**: self-paced, personal polls, any frequency (what the slice prototypes).
- **Daily Challenge**: fixed one-gate/day, shared seed, leaderboard — deliberately NOT self-paced (fixed cadence = fair shared contest). This is the 'same polls for everyone' competitive idea.

## Production build plan (from blueprint, 2026-07-11)
KEY: gate/pipeline/coverage engine is already POLL-COUNT-based (not date) — session runs need a new poll-supply + answer path ALONGSIDE the untouched daily poll, not a core rewrite.

Phases:
- A. Scaffolding behind a flag: add runs.mode ('calendar'|'session'), port validated prototype logic (sessionSlice/sessionRun) into the runs domain. Zero daily-poll impact. ADR required.
- B. Practice bank: query deriving repeatable polls from past daily_polls (no new table).
- C+. Session-run answer path, fuel economy, shop/gate parity — need gap decisions first.

Decisions before Phase C:
- Gap #1 (session-run storage): runs.mode column (RECOMMENDED, reuses gate/coverage code) vs separate table.
- Gap #3 (polls_responses unique (poll,user,date)): collides on same-day re-answer. RECOMMENDED: scope constraint to daily rows only; session answers keyed by run (preserves daily anti-double-submit).
- Gap #6 (does daily poll still touch runs): RECOMMENDED decouple — daily = record + grant fuel + leaderboard; runs separate.
Other gaps: fuel currency shape (#4), in-flight run migration (#5), leaderboard volume (#7), session window size (#8).

## Phase A started (2026-07-11)
DONE (data layer):
- ADR-005 (docs/adr/005-session-runs.md): two-loop rationale + mode-column decision + open gaps.
- runs.mode column ('calendar'|'session', default 'calendar', no backfill).
- Migration drizzle/0058_common_lady_ursula.sql (safe additive ALTER TABLE ADD COLUMN).
- NOT applied (db:push is user's call — mutates real DB).
- All uncommitted on branch proto/session-slice (prototype coexists); commit+split to feat/session-runs when asked.

NEXT (Phase A continued): port validated prototype logic (sessionSlice/sessionRun) into src/domains/runs as mode-aware session-run services, adapting mock polls/tags -> real Poll/Run types.

## Port PAUSED (2026-07-11, user)
Production logic port paused — staying in prototype + design finetune where iteration is cheap. Phase A data layer (ADR-005, runs.mode, migration 0058) is written but INERT (defaulted column, migration NOT applied). Resume port when design is settled.
