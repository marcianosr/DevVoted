# ADR-050: Config exposure is Reveal / Grant / Stage

## Status

Accepted (2026-08-31, Marciano, DVTD-2try). Records the framework decided in
DVTD-2try (2026-08-26) and settles its open half: which config unlocks when.
Rejects the archived-storage random pull (DVTD-9d7o), closing wiki §6.2's
"two systems, unreconciled" note. Builds on ADR-047 (size is the power and price
mark) and ADR-026 (starter stacks).

Partially superseded by ADR-051 (2026-09-03): decision 3 (the depth ladder) is
deleted and decision 4's six-only scope is generalised to individual dual-path
objectives for all 21 non-free configs. Decisions 1, 2 and 5 stand. ADR-051's
objective roster (`configUnlock.model.ts`) replaces the `unlocksAtGate`/
`unlocksBy` fields this ADR anticipated.

## Context

Rarity tiers did four jobs at once: scarcity, power signal, chase, and onboarding
pacing. ADR-047 settled power and price (size), and nothing decided how the rest
reach the player: all 30 configs are available from run one, the only shipped
pacing is per-run staging of shop tools, and first runs overwhelm. DVTD-2try picked
the framework but left the assignment open, which blocked implementation.

## Decision 1: three verbs, one job each

| Verb | What it does | Scope | Balance impact |
| --- | --- | --- | --- |
| **Reveal** | you learn it exists | account | none |
| **Grant** | you own it, you bring it into a run | account | high |
| **Stage** | when it appears inside a run | run | pacing only |

Grant is only for what you carry in. Stage stays per-run, always. Reveal is free
and everything can have it. Configs take no Stage: the shelf is never filtered.

## Decision 2: Grant gates the hand, never the shelf

The starting hand draws 6 from the account's granted pool (at least one focus
config guaranteed, `hand.model.ts`). The shop keeps offering the entire roster at
every gate, and "met" (Reveal) means seen on a shelf, bought or not.

Why the shelf stays whole: the draft seed is already depth in disguise (it hashes
only run counters), so filtering it would re-express the depth ladder with no dial;
a struggling run is never made worse by a thin shelf; and the full shelf is what
fills the Configdex in, run one included. Pillar 2 favours a shop that shows
everything it may ever sell.

## Decision 3: the depth ladder

Depth is the account's deepest-ever gate, derived from `users.owned_swatch_ids`.
No new storage.

| Trigger | Granted |
| --- | --- |
| free at signup | js, ts, css, eslint, unitTests, codeCoverage, indexedDb, coldStart |
| gate 1 | html, jsx, and the Gamble stack |
| gate 2 | stylelint, .length |
| gate 3 | mooresLaw, telemetry |
| gate 4 | prefetch, intellisense |
| gate 5 | git, java, vue, and the Category spread stack |
| gate 6 | deprecated |
| gate 7 | python, ruby, package.json |

Starter stacks ride the same rungs: Safe start is free (the first-run
recommendation), the other two arrive exactly when every config they contain is
granted.

## Decision 4: six challenge grants

The standouts are earned by doing the thing the config is about (pillar 1: the
challenge teaches the mechanic before handing over the amplifier). Achievement
only, no currency: `archived_storage` stays the cosmetics wallet.

| Config | Challenge | New tracking |
| --- | --- | --- |
| Overclock | perfect window at gate 3 or deeper | none (streak) |
| AGENTS.md | clear a gate with every slot filled | none |
| Dependabot | clear a gate holding two configs at level 2 | none |
| Volkswagen CI | clear Marsh's Mirror audit without a miss | none |
| WTFPL | sell 3 configs in a single shop | a per-shop sell counter |
| Freemium | reach gate 4 holding under 16 KB | none |

Nine free, fifteen on the depth ladder, six on challenges: all 30.

## Decision 5: the Configdex names every requirement

Three states, each carrying its requirement:

- **Never met**: a `???` silhouette; its tooltip names the requirement, never the
  config ("Releases when you clear gate 4", or the challenge sentence).
- **Met, not granted**: named chip, dimmed, same requirement tooltip.
- **Granted**: the tooltip reads as provenance ("Earned: cleared Marsh's Mirror
  audit without a miss").

`ConfigChip` already takes a `tooltip`; the shop's Upgrade press set the
requirement-in-tooltip precedent. Tooltip-first is not tooltip-only: modern-theme
tooltips are invisible on touch (DVTD-aiyp), so a silhouette row also carries its
requirement as a visible caption.

## Consequences

- `agentsMd` leaves the shipped `STARTER_POOL` (hand.model.ts) when this is built:
  legendaries are late grants, and the current pool predates this decision.
- Depth grants need no migration; challenge grants add one column,
  `users.unlocked_config_ids`, written with the same idempotence guard as
  `awardGateSwatch` (run.repository.ts).
- The only new in-run tracking is WTFPL's sell counter; every other predicate reads
  fields `RunState` already has.
- proto-run stays fully unlocked (client-only harness, no account to read).
- Scarcity deliberately has no mechanism: the weighted draft (DVTD-30k6, DVTD-5ljh)
  stays parked, and the draw stays uniform.
- Implementation is deferred until the DVTD-811d rename settles; the work list
  lives in DVTD-2try. Wiki §6.1 loses "fund config unlocks" from the
  archived-storage spending list along with §6.2's pull.
