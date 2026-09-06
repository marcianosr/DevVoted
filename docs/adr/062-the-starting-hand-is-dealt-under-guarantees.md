# ADR-062: The starting hand is dealt under guarantees

## Status

Accepted (2026-09-06, Marciano, DVTD-b6gx). Answers
[ADR-052](052-the-run-opens-on-a-dealt-hand.md) Decision 6, which deferred the
deal's safeguards until the pool stopped being curated. Amends
[ADR-050](050-config-exposure-is-reveal-grant-stage.md) Decision 2: Grant still
gates the hand and never the shelf, but the hand now reserves nothing for a
config the opening slots cannot hold. Does not touch ADR-050's uniform draw.

## Context

`STARTER_POOL` held five configs against a `HAND_SIZE` of five, so the deal was
the whole pool reshuffled and carried no variance at all. Its useful properties,
distinct focus categories and a passive majority, were properties of a
hand-written list rather than of the draw, and DVTD-p9ah replaces that list with
the account's granted pool. Two things break at that moment: a uniform draw from
29 configs can deal five category bets, or five cards no three of which fit in
four slots, or `agentsMd` at 8 slots which cannot be installed at all; and a run
is 13 gates at one gate per day, so a hand is dealt about twice a month and a
weak opening costs two weeks rather than one more attempt.

## Decision 1: the pool is ADR-051's free eight

`STARTER_POOL` becomes `js, ts, css, eslint, unitTests, codeCoverage, indexedDb,
coldStart`, so the stand-in matches what signup will actually grant. `gitRebase`
leaves it: it was never in the free set and has no objective row, and the shop
still sells it from gate 1. This is the last edit that list should need before
DVTD-p9ah swaps it for the account's pool.

The immediate effect is variance where there was none: 56 possible hands instead
of one.

## Decision 2: three rules shape the draw

Numbers live in `hand.model.ts`; the rules are the decision.

| Rule | Constant | Why |
| --- | --- | --- |
| No config larger than the slot budget is dealt | caller passes `BASE_SLOTS` | A card you cannot install is not a choice |
| The smallest three dealt configs fit the budget together | `PAIRABLE_PICKS` 3 | Keeps a three-config build reachable, so the one-config floor is not also the ceiling |
| One or two focus configs, count varying by seed | `FOCUS_BAND` 1..2 | Reproduces the passive majority curation used to give for free |

Larger-than, not as-large-as: `intellisense` at exactly 4 slots stays dealable,
because spending the whole opening on one config is a legal opening.

The rules are ordered when they conflict. Repairing for pairability never evicts
the hand's last focus config, and never swaps in a focus config that would breach
the band, so the older focus guarantee (ADR-052 Decision 1) still holds on every
seed.

## Decision 3: what was considered and left out

- **A coverage-earner rule.** `touchesCoverage` is already true for anything with
  a `focusCategory`, so the focus band implies it. One axis, not two.
- **Dedupe by effect.** Focus categories are unique per config today, 11 configs
  across 11 categories, so the band covers the real redundancy. Revisit when two
  configs ship the same effect field.
- **A can-trigger-today check.** ADR-052 Decision 6 anticipated one, but it is
  ill-defined for a 13-day run: only gate 0's five polls are known when the hand
  is dealt, while a focus config pays across all 13 gates.
- **Rarity weighting.** These rules constrain shape, never the probability of
  power. ADR-050's uniform draw and its absence of a scarcity mechanism stand.

## Consequences

- `startingHand(pool, seed, slotBudget)` takes the budget as a third argument,
  matching `recommendedPicks(hand, maxSlots)`. The domain does not reach into
  `rules.model` for it; `run.service.ts` and `proto-run.tsx` pass `BASE_SLOTS`.
- `recommendedPicks` is unchanged and now always finds its focus and coverage
  picks, because the deal guarantees one exists.
- `agentsMd` and `volkswagenCi` at 8 slots are never dealt at `BASE_SLOTS` 4.
  Grant does nothing for a config larger than the opening budget: the shop is its
  only route. ADR-057 recorded this as an accident; here it is a rule.
- The free eight satisfy all three guarantees by accident, being all 1 or 2 slots,
  so the spec proves them against the full `CONFIG_LIST` over 200 seeds instead.
  That sweep is what covers the pool DVTD-p9ah will introduce.
- The new-grant guarantee, where a freshly granted config is dealt in until it has
  been installed once, is decided but not built: it needs the ledger DVTD-clgs
  creates. It folds into DVTD-p9ah reading `user_config_unlocks.first_installed_at`
  ([ADR-064](064-a-grant-is-recorded-with-its-provenance.md), which replaced the
  `users.unplayed_config_ids` column first planned here and settled the deal
  order: the seat is dealt first and the focus band counts it). Without it, a
  config unlocked at a pool of 29 appears in about 17% of hands, roughly a
  three-month wait at two runs a month.
- Five roster configs still have no objective row: `gitRebase`, `abTest`,
  `yarnLock`, `cache`, `garbageCollection`. ADR-051 Decision 5 requires one per
  config, so they are unreachable through Grant until the table gains them.
  Resolved 2026-09-06: the ADR-051 amendment added rows for all five plus
  `planningPoker`, which this list missed.
- ADR-049's start-screen archive slots would raise the budget above `BASE_SLOTS`,
  but the deal is fixed at run birth and those slots are proto-run only. If they
  ship to production, the eligibility filter is the thing to revisit.
