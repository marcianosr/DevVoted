---
# DVTD-g5lp
title: Pipeline Tags (sticker system)
status: in-progress
type: epic
priority: normal
created_at: 2026-07-11T15:49:20Z
updated_at: 2026-07-11T17:50:36Z
parent: DVTD-7dqm
blocked_by:
    - DVTD-kg2e
---

Stickerino-inspired customization layer for pipelines. Replaces pipeline variants AND occurrence-booster configs with unlockable "tags/stickers" placed into a fixed number of slots per pipeline.

## Core model (agreed so far)
- **Tags** = the power + personality (what a pipeline does).
- **Slots** = the constraint. Base 3 per pipeline. Every tag is a real trade-off.
- **Configs** = infrastructure — they expand slot capacity (5 max, then a config-bought 6th), no longer give power directly.
- **More power = more risk**: want more tags? free a slot, buy capacity, or add another pipeline (= another check that can fail at the gate).
- **Failure model (strip-on-fail)**: failing a check rips a sticker off instead of instantly ending the run. Strip a pipeline bare -> run ends. Collection is the health bar. Fixes the "one unlucky gate deletes a month of play" problem in a daily-paced game.

## Naming
Player-facing vocab = CI metaphor (pipeline / checks / gate / build breaks). "Slot" is internal only.

## Phases
1. **Tag families** — define what a tag is *allowed to do* (the kinds, not the list). IN PROGRESS.
2. Paper-play one run to test slot-choice + strip-on-fail feel.
3. Prototype the version that survives the paper test.

## Design decisions still open
- Which families ship in the first playable set.
- Are tags all passive/always-on, or can some fire/self-consume (esp. defense).
- Whether the occurrence-boost actually works given the shared/deterministic daily poll (carry-over concern from cadence review).

## Todos
- [x] Phase 1: define tag families + starter tag set
- [x] Phase 2: paper-play one run (findings recorded)
- [ ] Phase 3: prototype

## Phase 1 decisions (locked)

### Configs retired, three-system split
- Passive power -> **tags**. Active/one-shot -> **consumables** (revives the 08-07 scripts backlog: JSON.stringify, git reset --hard, Hotfix...).
- Configs no longer exist as passive run-global stat-sticks (they were a blurry second tag system).
- **Shop + storage kept.** Storage buys what goes *in* the build; play earns the build *space* (slots). Money cannot buy slots.

### Three systems, one job each
| | Bought w/ storage | Passive | Eats a slot | Persists across runs |
|---|---|---|---|---|
| Tag | Yes (via packs) | Yes | Yes | Unlock persists; placement per-run |
| Consumable | Yes (direct) | No (fired) | No (held ~2) | No (spent in-run) |
| Slot capacity | No (earned by play) | - | - | Yes |

### Acquisition = mystery packs (Pokemon-booster style)
- Tags bought as **packs**, gambling overflow storage on rarity.
- **No dud packs** - every pack gives real cards; the bet is quality/rarity, never whether you get anything. (RNG-on-RNG in a month-long run is brutal; a floor prevents feel-bad.)
- **The pack IS the Pokedex**: first pull permanently unlocks a tag into the collection (merges discover + acquire into one action).
- **Random pull, chosen placement**: a pack gives a small hand (~3); player chooses which to slot. Never force a tag onto a pipeline.
- **Consumables bought directly** (deliberate tools), NOT packed.

### Tag families (5; structural three build the loop)
- **Focus** (specialist; category occurrence+coverage) - structural, backbone. [watch: relies on occurrence, unconfirmed vs shared daily poll]
- **Defense** (survivor; soften/shield) - structural.
- **Risk** (gambler; harder check, bigger payout) - structural.
- Amplify (multipliers) - power.
- Economy (storage/discounts) - power.
- Paper-test set = Focus + Defense + Risk only.

### All tags are passive. Full stop.
Active/one-shot behavior lives in consumables (incl. "survive a fail" = Hotfix consumable). No tag bench for now (buy->place immediately).

## Open questions
- Packs: only source (tiered cheap/premium) vs gamble-layer-on-top? (leaning tiered-only-source)
- Does Focus occurrence-boost actually work given shared/deterministic daily poll? (must confirm before build)
- Next in Phase 1: name the tags per family.

## Phase 1 complete — starter tag set (paper-test)

Both open forks resolved: **no dud packs** (every pack pays real tags), **tiered-only-source** (cheap pack always affordable + premium pack for overflow bets).

Dev/CI-themed, same voice as existing configs. Starter set = enough per family to make slot choices bite; NOT the full catalog.

### Focus (specialist) — common
- `[react]`/`[python]`/`[git]`/`[sql]` etc: this pipeline cares about that category; +coverage (+occurrence IF daily-poll model allows — provisional). Coverage half must stand alone.
- `[fullstack]` (rare): two linked categories at once.
- `[monorepo]` (legendary): all categories count, each gives less.

### Defense (survivor) — uncommon (passive only; one-shot save = Hotfix consumable)
- `Linter`: this check demands one tier less, always on.
- `Cache`: wrong answer here does not reset streak.
- `Read-only` (rare): this check can never get harder (immune to gate scaling & Risk creep).

### Risk (gambler) — rare
- `push --force`: harder check, double storage.
- `Deploy on Friday`: no safety net, big coverage payout.
- `O(n^2)` (legendary): reward grows each gate, demand grows too.

### Power families (taste, not in paper test)
- Amplify: `Copilot` (x2 coverage this pipeline), `O(1)` (flat coverage lump).
- Economy: `IndexedDB` (+storage per correct here), `CDN` (packs cost less).

### Emergent design note
Risk + Defense contest the SAME check (e.g. `push --force` + `Linter` = high-reward-but-survivable hybrid). Tension across 3 slots is the core puzzle.

---
Phase 1 DONE. Next: Phase 2 paper-play one run (Focus + Defense + Risk, 3 slots, strip-on-fail).

## Phase 2 — paper-play findings + decisions

Paper-played a ~3-gate run (Focus+Defense+Risk, 3 slots, strip-on-fail w/ bare-grace).

### Proven, keep
- 3 slots + **pulls must exceed slots** -> real cut decision every pack.
- Risk+Defense on one check (`push --force`+`Linter`) is fun & legible.
- Strip-on-fail + bare-grace: bad weeks cost a sticker, not the month. Loss felt, not fatal. **Best part of the design.**
- Post-gate fork (4th slot vs 2nd pipeline) -> natural consolidate-vs-expand psychology.

### Decisions locked
- **Which sticker peels on fail = PLAYER CHOICE** (turns the fail moment into a decision).
- **Dupe pulls auto-convert to dust** currency (feeds pack-buying).
- **Risk tags only pay when the check is genuinely threatening** (no free money on easy early gates).
- **Bench (buy-now-place-later): PARKED** until paper-tests keep demanding it.
- **Coverage-as-slot-unlocker: PARKED** (noted as strong — makes coverage meaningful).

### HARD DEPENDENCY (new)
- **rarity-based coverage bonus** (docs/brainstorm/23-03-2026-rarity-based.md) is NOT optional. Strip-on-fail + Focus both make your payoff hostage to whether the shared daily poll shows your category. Without the rarity fix, you lose stickers to dice not skill. Ship together.

### OPEN — the big one (#4 escalated to cadence)
- "Brittle early + quick retry" is a fast-roguelike instinct, but a run is currently MONTH-LONG (1 poll/day) so there is NO quick retry. Decision #4 is secretly a CADENCE decision:
  - (a) move to session-based run mode (many polls per sitting -> short runs -> brittle+retry works), OR
  - (b) runs stay month-long -> early brittleness needs a cushion.
  Cannot have brittle + quick-retry + one-poll-a-day. **This choice outranks the whole Tags system.**

## CADENCE RESOLVED -> two-loop model (DVTD-kg2e)

The big open #4 is answered: session-based runs via the two-loop model. Consequences for this epic:
- Strip-on-fail brittleness needs NO cushion (runs are a ~15-min sitting, retry instantly).
- Coverage-as-slot-unlocker UN-PARKED — great fit (in-run growth curve as coverage climbs).
- Fuel (packs/storage/dust) sourced from the daily poll + run rewards.
- Run polls = practice bank (past dailies), repeatable.
- Category bounty (rarity coverage) lives on daily + spices the run bank.
- **This epic is BLOCKED BY DVTD-kg2e** — Tags run at session speed, which is what makes them work.

Related existing beans: DVTD-nvqu (consumable 'snippet' prototype — aligns with our configs->consumables decision), DVTD-dfqy (reward daily players more — feeds the fuel model).

## UPDATE: consumables deferred (not dead)
Snippets/consumables were an earlier effort; deprioritized. Dropping them simplifies the economy to one line: storage/dust -> buy packs -> pull tags -> slot them. Shop = pack vendor. Cost: no in-the-moment/tactical agency (tags are all build-time decisions). Bring consumables back ONLY if playtests show runs feel too passive. Model is now TWO systems: Tags (passive) + Slots (earned). Configs still retired.
