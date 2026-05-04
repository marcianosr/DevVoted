# ADR 003: Domain Restructure — Business-Oriented DDD Boundaries

**Status:** Accepted  
**Deciders:** Marciano  
**Date:** 2026-05-04  
**Supersedes:** Partially supersedes ADR-002 (domain architecture) — retains the three-tier api/handler/query pattern, revises domain ownership

---

## Context and Problem Statement

The existing domain structure (ADR-002) was organized by technical layers within feature areas. Over time this caused:

- Run-scoped operations (answer recording, poll tracking, window evaluation) living in the `polls/` domain because they touched poll tables — despite being called exclusively by run-processing code
- `configs/` tightly coupled to `economy/` even though configs are game mechanics that will also be acquirable via unlockables (not just the shop)
- `polls/api/queries.ts` growing to 1022 lines as a god-object serving five unrelated concerns
- Community stats (social, ephemeral, daily-scoped) mixed with poll CRUD
- Domain names like "responses" and "content" reflecting technical categories rather than business concepts

The root cause: domains were split by *what tables they touch* rather than *what business concept they own*.

---

## Decision

Restructure domains to reflect the game's business domain language (see `CONTEXT.md`).

### Target Structure

```
domains/
  polls/
    daily/        ← daily poll selection + community stats
    (flat)        ← poll CRUD, fetch operations
  runs/           ← game sessions, turn processing, CI pipeline, coverage, answer recording
  score/          ← scoring rules + ScoreBlock component
  configs/        ← game modifier definitions + config effects engine
  economy/
    shop/         ← config acquisition channel
    storage/      ← capacity management
  leaderboards/   ← season-scoped rankings
  seasons/        ← season lifecycle
  users/          ← player profiles
  shared/         ← queryKeys, category constants
```

### Key Ownership Changes

#### polls/ — owns poll questions only
- Poll CRUD and fetch operations remain here (flat, no sub-domain)
- `polls/daily/` owns daily poll selection mechanics and community stats
- **Removed:** answer recording, run-scoped tracking, window evaluation

#### runs/ — owns the game session and everything scoped to a run
Absorbs from `polls/api/queries.ts`:
- `createPollResponse` — recording a player's answer
- `hasUserAnsweredPoll`, `getUserSelectedOptions`
- `trackPollView`, `trackPollAnswer`, `getPollHistory`
- `getPollsSeenInRun`, `getAnsweredPollsCountInRun`
- `getWindowResults`, `getRunPollHistory`
- `WindowResult`, `RunPollHistory` types

Absorbs `processPollAnswer.service.ts` — the Turn processing orchestrator — renamed to reflect business language (a "turn" is one poll answer within a run).

#### configs/ — game mechanic, not economy
Configs are game modifiers. The shop is one acquisition channel; unlockables will be another. Binding configs to `economy/` would be wrong once unlockables exist. `configs/` remains a top-level domain; `economy/shop/` depends on it, not the other way around.

#### polls/api/queries.ts — split into focused modules
The 1022-line god-object splits into:
- `poll.queries.ts` — poll CRUD + fetch
- `dailyPoll.queries.ts` — daily selection, weight snapshot
- `communityStats.queries.ts` — community stats + random answer hint
- (response/tracking queries move to `runs/`)

---

## Consequences

### Positive
- Domain names match the game's language (Poll, Run, Turn, Config, Shop, Score)
- `runs/` owns all run-scoped state — one place to reason about a run's lifecycle
- `configs/` can absorb unlockables without touching `economy/`
- `polls/api/queries.ts` broken into modules with single concerns
- Community stats co-located with the daily poll context it describes

### Negative
- Migration effort: callers of moved functions need import updates
- `runs/api/queries.ts` grows — will need monitoring to avoid becoming a new god-object

### Open Questions
- **Turn naming:** Resolved — `processPollAnswer.service.ts` → `runs/services/turn.service.ts`.
- **Leaderboards / Seasons relationship:** leaderboard rankings are season-scoped. Whether `leaderboards/` belongs under `seasons/` or as a peer domain is unresolved. Retain as peers until there's a concrete reason to nest.

---

## Alternatives Considered

### Keep domains split by table ownership
Rejected: table proximity is an implementation detail. `getWindowResults` queries poll tables but answers a question about run state. Ownership follows the *question being answered*, not the *tables touched*.

### Merge polls/daily/ into runs/
Rejected: daily poll selection (weighted seeded pick, midnight snapshot) is a poll-content concern. The daily poll exists independently of whether any run is active. `runs/` owns what happens during a run; `polls/daily/` owns which poll appears that day.

### Sub-domain folders throughout (polls/content/, polls/responses/)
Rejected: "content" and "responses" are technical names, not business concepts. Sub-domain folders are warranted only when the sub-domain has a distinct business identity. `daily/` qualifies; "content" does not.

---

## References

- `CONTEXT.md` — domain language glossary
- ADR-002 — original domain architecture (three-tier pattern retained)
- `src/domains/polls/api/queries.ts` — primary file being split
