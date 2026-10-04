# ADR-008: Reward screen is a multi-buy shop; slots are earned by coverage

## Status

Accepted (2026-07, playtest DVTD-8eij / bug DVTD-k13o). Supersedes ADR-006
Decision 7 and amends its Decisions 1 and 10.

**Live:** Decisions 1 and 3. **Dead:** Decision 2's coverage-gated slot ladder.
[ADR-074](074-weight-is-what-the-build-costs-to-run.md) owns width: it is not
gated and not bought, it is billed. ADR-046, which owned it in between, is
superseded.

## Context

ADR-006 Decision 7 said a cleared gate grants **exactly one** reward. The
prototype never enforced it: the `rewarding` status accepted every reward action
repeatedly until `finish-reward`, so after one clear you could add a slot, draft
a config, and add another slot in the same round.

Two things became clear:

1. **"Pick exactly one" is the wrong model.** The interesting constraint in a
   Balatro-style shop is the *currency*, not an artificial one-item cap. Storage
   is already the run currency, and the bug report was really a complaint that
   storage could buy every reward at once.
2. **`add-slot` was free**, so a free-spend shop would let a player spam it to
   the cap in a single round. Width needed a scarcity that was not storage.

## Decision

### 1. The reward screen is a multi-buy shop, bounded by storage

Clearing a non-final gate opens the shop. The player takes **as many actions as
storage affords**, in any order, then climbs on. There is no per-gate reward
limit; storage is the only limiter.

This made the existing multi-action reducer behaviour the *intended* design
rather than an unenforced bug.

### 2. Slots are gated by total coverage, not bought with storage

Dead. Width was free of storage and gated on total run coverage, on the
principle that breadth earns width and that coverage is a gate rather than a
currency. The axis has since been deleted twice over: ADR-041 restored it,
ADR-044 removed it for closing a width-buys-score-buys-width loop, and ADR-046
settled on slots bought outright on a priced ladder. See
[rejected.md](rejected.md) for why score may not buy width.

### 3. Drafting a config costs storage

Drafting spends storage, which is the shop's primary sink. This was in the
prototype but undocumented in ADR-006's economy section; with multi-buy it is
what bounds the round. The price was a rarity ramp then and is `32 KB × slots`
now (ADR-047), so a config's size is its price.

## Consequences

- Storage became a resource you actively spend down each shop, and the reward
  screen got real decisions.
- The shop UI must always show *why* a locked action is locked, or a greyed
  button reads as a bug. This outlived the coverage ladder: it is why a gated
  press names its requirement (ADR-053) and a masked plan rung carries its
  caption (ADR-046).
