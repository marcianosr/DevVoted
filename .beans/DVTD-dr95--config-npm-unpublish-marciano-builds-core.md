---
# DVTD-dr95
title: 'Config: npm unpublish (Marciano builds core)'
status: todo
type: feature
priority: normal
created_at: 2026-08-26T19:28:46Z
updated_at: 2026-09-05T09:10:33Z
parent: DVTD-72d9
---

Legendary thwart config: name a config you own; it is sold out in everyone's shop tomorrow (left-pad memorial). Claude scaffolds (roster entry, state field, spec skeletons, TODO-marked reducer action + draft-roll filter); Marciano implements the core logic as a learning exercise.

- [x] Scaffold: roster entry + RunState field + signatures + it.todo specs
- [ ] Core: unpublish reducer action (Marciano)
- [ ] Core: draft roll exclusion (Marciano)
- [ ] Decide: does the unpublish last one day or until run death; can it be re-published

## Scaffold pointers

- Core action: `unpublish` in src/modules/run/run/domain/shopAction.model.ts (guards for publisher + owned target are in; the TODO block lists the four decisions)
- Pool filter: `rollDraft` in src/modules/run/shop/domain/draft.model.ts (thread `state.unpublishedConfigIds` through `shopDraft` in run.model.ts)
- State: `unpublishedConfigIds` on RunState (initialized in createRun)
- Specs waiting: 3 it.todo in shopAction.model.spec.ts, 2 in draft.model.spec.ts
- Roster entry `npm-unpublish` ships already (legendary, 256KB) — drafting it currently does nothing until the core lands

## Variant asked for 2026-08-29: ban it for everyone *currently in a run*

Marciano asked for the live version: not "sold out tomorrow", but "gone from the shelf of every run in progress". Same verb, materially different mechanic, so it is a decision on this bean rather than a second config.

**Mechanically reachable.** `rollDraft` runs at shop entry from `draftSeed(gatesCleared, rebuildsUsed, extensionsBought)`, and the rolled shelf is persisted on the run as `draftOptions`. So a live ban filters shelves that have not been rolled yet and leaves standing shelves alone. That reads fine in fiction: the package was unpublished while you were mid-install.

**What it costs, and why the tomorrow-scoped version was chosen first:**

- **Different storage.** Tomorrow's ban is a per-run field (`unpublishedConfigIds`, already scaffolded). A live cross-player ban is global state: a `daily_unpublished_configs` row (config id, date, by whom) read on every shelf roll by every user. The scaffold does not cover that.
- **It breaks the same-run-for-everyone promise.** Runs persist across days (ADR-011) and the shelf is seed-deterministic precisely so two players at the same gate see the same offers. A live ban makes your shelf depend on what time you played, which is the one asymmetry the shared seed exists to prevent. Tomorrow-scoped keeps it: everyone tomorrow sees the same thing.
- **The timing play is the whole game.** Buy Intellisense, then unpublish it so nobody else can. That is a genuinely good legendary move and also the game's first mechanic that takes something from a stranger mid-climb, in a game whose social layer is meant to be the water cooler.
- **Never touch an installed config.** Whatever the horizon, the ban may only reach shelves. Peeling a paid config out of a live pipeline is a different and much worse mechanic.
- **Needs a global floor.** With enough legendaries in play a day could be stripped of usable offers. Cap bans per day across all players, or exempt the starter stacks.

**Recommendation:** ship the tomorrow-scoped version already scaffolded, and treat "live" as a follow-up that needs the global table plus the fairness call above. If live is what you actually want, decide it before the core logic lands, because the storage location changes (RunState field versus a shared table) and that is the part being hand-written.

- [ ] Decide: tomorrow-scoped (scaffolded) or live for runs in progress (needs a shared table and a fairness ruling)

## Correction 2026-09-05

This bean states the scaffold ships ("Roster entry `npm-unpublish` ships already, legendary,
256KB") and marks it `[x]`. It does not. `grep -rn "unpublish" src/` returns zero hits: no
roster entry, no `unpublishedConfigIds` on RunState, no action in shopAction.model.ts. Found
while planning DVTD-ltqb, which considered riding this bean's plumbing. Nothing here is built.
