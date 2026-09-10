# ADR-050: Config exposure is Reveal / Grant / Stage

## Status

Accepted 2026-08-31 (Marciano, DVTD-2try). Rejects the archived-storage random
pull (DVTD-9d7o), closing the wiki's "two systems, unreconciled" note.

**Live:** Decisions 1, 2 and 5 — the three verbs, Grant gating the hand, and the
Configdex naming every requirement.

**Dead:** Decision 3's depth ladder and Decision 4's six challenge grants, both
generalised by [ADR-051](051-configs-unlock-on-individual-objectives.md) into
individual dual-path objectives for every non-free config.
[ADR-064](064-a-grant-is-recorded-with-its-provenance.md) owns the ledger.

## Context

Rarity tiers did four jobs at once: scarcity, power signal, chase, and onboarding
pacing. ADR-047 settled power and price, and nothing decided how the rest reach
the player: every config was available from run one, and first runs overwhelm.
DVTD-2try picked the framework but left the assignment open, which blocked
implementation.

## Decision 1: three verbs, one job each

| Verb | What it does | Scope | Balance impact |
| --- | --- | --- | --- |
| **Reveal** | you learn it exists | account | none |
| **Grant** | you own it, you bring it into a run | account | high |
| **Stage** | when it appears inside a run | run | pacing only |

Grant is only for what you carry in. Stage stays per-run, always. Reveal is free
and everything can have it. **Configs take no Stage: the shelf is never
filtered.**

The vocabulary has held: ADR-046's plan-rung reveal took the Reveal verb rather
than inventing a fourth.

## Decision 2: Grant gates the hand, never the shelf

The starting hand draws from the account's granted pool. The shop keeps offering
the entire roster at every gate, and "met" means seen on a shelf, bought or not.

Why the shelf stays whole:

- the draft seed is already depth in disguise, since it hashes only run counters,
  so filtering it would re-express the depth ladder with no dial;
- a struggling run is never made worse by a thin shelf;
- the full shelf is what fills the Configdex in, run one included. ADR-042
  pillar 2 favours a shop that shows everything it may ever sell.

Amended by [ADR-052](052-the-run-opens-on-a-dealt-hand.md) (the hand is five) and
[ADR-062](062-the-starting-hand-is-dealt-under-guarantees.md): the hand is
filtered to what the opening slots can hold, so **Grant does nothing for a config
larger than `BASE_SLOTS`** and the shop is its only route.

## Decision 3–4: the depth ladder and the six challenge grants

Dead. The depth ladder keyed grants to the account's deepest-ever gate, and six
configs were earned by doing the thing the config is about — the principle being
that the challenge teaches the mechanic before handing over the amplifier
(ADR-042 pillar 1). **That principle survives**; ADR-051 gave every non-free
config an objective rather than six of them, each with a polls-answered fallback
so no config is gated behind a single skill.

Achievement only, no currency: `archived_storage` stays the cosmetics wallet, and
buying unlocks was rejected outright.

## Decision 5: the Configdex names every requirement

Three states, each carrying its requirement:

- **Never met:** a `???` silhouette whose tooltip names the requirement, never
  the config.
- **Met, not granted:** named chip, dimmed, same requirement tooltip.
- **Granted:** the tooltip reads as provenance.

**Tooltip-first is not tooltip-only.** Tooltips are invisible on touch, so a
silhouette row also carries its requirement as a visible caption. ADR-046 and
ADR-051 both restate this rule, which is a sign it should have been a pillar.

## Consequences

- Legendaries are late grants, so the largest configs leave the starting pool.
- The only new in-run tracking was a per-shop sell counter; every other predicate
  reads fields `RunState` already has.
- proto-run stays fully unlocked, being a client-only harness with no account to
  read.
- **Scarcity deliberately has no mechanism.** The weighted draft stays parked and
  the draw stays uniform, a position ADR-062 reaffirmed when it added the hand's
  guarantees: they constrain shape, never the probability of power.
