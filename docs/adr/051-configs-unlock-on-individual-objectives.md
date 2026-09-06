# ADR-051: Configs unlock on individual objectives

## Status

Accepted (2026-09-03, Marciano, DVTD-2try). Supersedes ADR-050's decision 3 (the
depth ladder) and the six-only scope of its decision 4; ADR-050's decisions 1, 2
and 5 stand, including "Grant gates the hand, never the shelf". The tables below
are the design of record until `configUnlock.model.ts` exists; from then on the
code file is the source of truth.

Amended 2026-09-06 (DVTD-0sjo): six configs that shipped without rows
(yarn.lock, Planning Poker, A/B Test, Garbage Collection, Cache, git rebase -i)
joined the decision 3 table and five metrics joined decision 4's set. The ledger
shape in the consequences is superseded by
[ADR-064](064-a-grant-is-recorded-with-its-provenance.md).

## Context

The depth ladder hands over configs in per-gate batches, which reads as receiving
Config Bundle #4 rather than earning anything. Melee's unlock model (a thematic
shortcut OR a participation fallback per character) and Kirby Air Ride's checklist
presentation replace it: every non-free config is earned individually, and the
Configdex is the board that fills in.

## Decision 1: two paths per config, first met grants

Each of the 27 non-free configs carries one thematic objective and one
participation fallback (lifetime polls answered). Whichever is met first grants
the config. Every objective tracks automatically from play; nothing is activated,
so the Configdex can show all 21 without becoming a pre-run decision screen.
Pinning one objective is a presentation nicety, deferred.

The result: players who just play unlock everything through the fallbacks,
completionists unlock sooner by chasing objectives, and the objectives teach
mechanics a player might otherwise ignore. KB never buys a config (unchanged).

## Decision 2: the free starter set stays

js, ts, css, eslint, unit-tests, code-coverage, indexed-db, cold-start (by
`config.id`). Granted at signup, shown as granted in the Dex with no objective
rows. `agentsMd` still leaves `STARTER_POOL`.

Amended 2026-09-04: eight, not nine. `coverage-gain` was deleted from the roster
— it sold AGENTS.md's ×2 coverage for a quarter of the price, so AGENTS.md was
unbuyable. Whether an eighth-plus-one takes the free slot is open.

## Decision 3: the objective table

Every number is a playtest placeholder; the structure is the decision. Ordered by
intended earliness.

| Config | Thematic objective | Metric | Fallback (polls answered) |
| --- | --- | --- | --- |
| .html | Answer 10 HTML polls correctly | category-correct:html · 10 | 25 |
| .jsx | Answer 10 React polls correctly | category-correct:react · 10 | 50 |
| Stylelint | Answer 10 CSS polls correctly | category-correct:css · 10 | 75 |
| Telemetry | Peek the community split 5 times | community-peeks · 5 | 100 |
| .length | Close 3 perfect windows | perfect-windows · 3 | 125 |
| .git | Answer 10 Git polls correctly | category-correct:git · 10 | 150 |
| package.json | Answer 10 General Frontend polls correctly | category-correct:general-frontend · 10 | 175 |
| .vue | Answer 10 Vue polls correctly | category-correct:vue · 10 | 200 |
| .java | Answer 10 Java polls correctly | category-correct:java · 10 | 225 |
| .py | Answer 10 Python polls correctly | category-correct:python · 10 | 250 |
| .rb | Answer 10 Ruby polls correctly | category-correct:ruby · 10 | 275 |
| Prefetch | Clear 5 audited gates | audited-gates-cleared · 5 | 300 |
| Intellisense | Answer 75 polls correctly | polls-correct · 75 | 325 |
| Moore's Law | Clear 15 gates | gates-cleared · 15 | 350 |
| Deprecated | Sell 10 configs | configs-sold · 10 | 375 |
| Overclock | Perfect window at gate 3 or deeper | perfect-window-deep | 400 |
| Dependabot | Clear a gate holding two configs at level 2 | double-v2-clear | 425 |
| WTFPL | Sell 3 configs in a single shop | sold-three-one-shop | 450 |
| Volkswagen CI | Clear Marsh's Mirror audit without a miss | mirror-clear-no-miss | 475 |
| Freemium | Reach gate 4 holding under 16 KB | lean-gate-four | 500 |
| AGENTS.md | Clear a gate with every slot filled | full-build-clear | 525 |
| yarn.lock | Lock 5 shop offers | offers-locked · 5 | 550 |
| Planning Poker | Land 3 exact estimates | exact-estimates · 3 | 575 |
| A/B Test | Switch arms 3 times | arms-switched · 3 | 600 |
| Garbage Collection | Sell 20 configs | configs-sold · 20 | 625 |
| Cache | Land 15 cached hits | cache-hits · 15 | 650 |
| git rebase -i | Reorder 3 gates' polls | gates-reordered · 3 | 675 |

The six ADR-050 challenges survive verbatim as their configs' thematic path.
Telemetry's objective is earnable before the grant because the shop shelf is
never filtered: buy it mid-run, use it, carry it in from then on. That loop
(use the thing to earn carrying it in) is the Melee trick, and it is available
to any future objective.

The 2026-09-06 rows lean on that loop deliberately: locking, estimating,
switching arms, caching hits and reordering are all shelf-buyable behaviours, so
each objective is earnable before its grant. Garbage Collection is the
exception: its mechanic fires only on a peel, and rewarding peels rewards
failure (decision 5), so it reuses configs-sold at a higher target than
Deprecated.

## Decision 4: the closed metric set

Every objective maps to this set; no config gets one-off tracking. Cumulative
lifetime counters: polls-answered, polls-correct, category-correct:{code},
gates-cleared, audited-gates-cleared, rebuilds, perfect-windows, configs-sold,
community-peeks, offers-locked, exact-estimates, arms-switched, cache-hits,
gates-reordered. One-shot in-run predicates, stored as target-1 counters on the
same ledger: perfect-window-deep, full-build-clear, double-v2-clear,
mirror-clear-no-miss, sold-three-one-shop, lean-gate-four.

rebuilds is unused by the current table; it stays in the set for the roster
expansion (DVTD-72d9), whose shop-themed configs want it. community-peeks is the
one metric beyond what DVTD-2try inventoried: the peek is already a run action,
so it costs one counter row, no new state. The five 2026-09-06 metrics follow
the same rule: locking, estimating, arm-switching and reordering are existing
run actions, and a cached hit is computed during answer settlement, so each is
visible at the seam and costs only its counter row. gates-reordered counts once
per gate whose order was committed, never per drag.

## Decision 5: authoring rules

- The thematic objective teaches the config's own mechanic (pillar 1) and names
  real behaviour, never vibe.
- Aim for roughly 60% incidental (met by playing), 30% experimental (unusual
  builds, shop behaviour, audit interactions), 10% long-term cumulative.
- Never depend on random daily poll availability without the fallback covering
  it: "Answer 10 Java polls correctly" passes because the fallback ticks on
  every poll; a conjunction of rare daily conditions fails review.
- Objectives are account-level pull, never an in-run demand (pillar 3: friction
  belongs to the gate). Any objective that would reward throwing a run fails
  authoring review; rewarding play (perfect windows) or use of a mechanic
  (peeks, sells) passes.
- Fallbacks count session polls in v1; calendar mode joins later.
- Every new roster config ships with an objective row in the same change.

## Decision 6: counting rules

Answers in abandoned runs count: the fallback is a lifetime guarantee, and
punishing abandonment would fight it. Mirror-correct answers count toward
category-correct (ADR-038: they still prove knowledge); the ledger counts at the
engine seam, which grades mirror-aware, so no derived-count bug is possible.

## Decision 7: presentation and stacks

ADR-050's three Configdex states stand, extended: a locked row shows both paths
as visible caption lines with live progress ("Rebuild the shop 10 times · 6/10",
"Answer 125 polls · 43/125"); one-shot paths show a checkbox without a count.
Visible captions, not tooltip-only (DVTD-aiyp). Shelf-Reveal still names a met
row; completing either path flips the row to name, effect and provenance.

Starter stacks lose their gate rungs: a stack arrives when every config it
contains is granted. Safe start is all-free and stays the first-run
recommendation.

## Consequences

- Objective definitions live in a parallel `configUnlock.model.ts` roster keyed
  by `config.id`, not on `Config`: unlock metadata is account-scope and must not
  serialize into every `RunSnapshot`. This replaces ADR-050's anticipated
  `unlocksAtGate`/`unlocksBy` fields.
- Progress needs a ledger: `user_objective_progress (user_id, metric, count)`
  plus the `user_config_unlocks` table
  ([ADR-064](064-a-grant-is-recorded-with-its-provenance.md), which replaced
  the `users.unlocked_config_ids text[]` this ADR first anticipated), both
  written in the `applyActionToRun` transaction (the `awardGateSwatch`
  idempotence pattern). ADR-050's "only new tracking is WTFPL's sell counter"
  no longer holds.
- The only new `RunState` field is `soldThisShop`; every other predicate reads
  what the seam already sees.
- No grandfathering and no historical backfill: the game is pre-release, nobody
  has anything yet. The migration seeds the free set.
- proto-run stays fully unlocked; the shop shelf stays whole; scarcity still has
  no mechanism.
- Implementation is split across follow-up beans listed in DVTD-2try.
