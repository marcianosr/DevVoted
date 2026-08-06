# ADR-008: Reward screen is a multi-buy shop; slots are earned by coverage

## Status

Accepted. **Supersedes ADR-006 Decision 7** ("pick exactly one" reward) and **amends ADR-006 Decisions 1 and 10**. Found and decided during playtest DVTD-8eij / bug DVTD-k13o.

## Context

ADR-006 Decision 7 said a cleared gate grants **exactly one** reward (draft / add-slot / upgrade, plus rebuild and skip). The prototype never enforced this: the `rewarding` status accepted every reward action repeatedly until `finish-reward`. Playtesting exposed the gap — after one gate clear you could add a slot, draft a config, and add another slot in the same round.

Two things became clear:

1. **"Pick exactly one" is the wrong model.** The interesting constraint in a Balatro-style shop is the *currency*, not an artificial one-item cap. Storage is already the run currency (ADR-006 Decision 10). Letting the player spend it freely in the reward screen makes storage matter instead of neutering it — which is precisely the complaint the bug raised ("storage can currently buy every reward").
2. **`add-slot` was free**, so a free-spend shop would let a player spam it to the cap in a single round. It needs its own scarcity that isn't storage.

## Decision

### 1. The reward screen is a multi-buy shop, bounded by storage

Clearing a non-final gate opens the shop. The player may take **as many actions as storage affords** — draft configs, upgrade configs, add slots — in any order, then climb on. There is no per-gate reward limit; **storage is the only limiter** for the paid actions.

This is the existing reducer behaviour (multi-action `rewarding` phase), now the *intended* design rather than an unenforced bug.

### 2. Slots are gated by total coverage, not bought with storage

`add-slot` is free of storage but gated on **total run coverage**. Each successive slot requires a higher coverage threshold, so a widening cannot cascade within one round.

Coverage is a **gate, not a currency** — it is *not* consumed on purchase, mirroring how Focus-config upgrades gate on category coverage (ADR-006 Decision 5). Breadth earns width. The hard cap is `MAX_SLOTS`.

The threshold ladder and cap are **live-tuned in `pipeline.model.ts`** (`SLOT_COVERAGE_GATE` / `coverageToAddSlot` / `canAddSlot`) — that file is the source of truth, not this ADR, since the numbers change with playtesting. The shop surfaces the requirement inline when a slot is locked ("Reach 45% total coverage to widen — you have 32%").

> ⚠ Extended by [ADR-018](018-gate-slot-coupling-and-slot-swatches.md): width now also gates *depth* — gate N requires slot N, so the ladder is mandatory rather than optional. Each unlock is also a permanent, account-wide **swatch**. Nothing here is reversed: slots stay free, coverage stays a gate and not a currency.

### 3. Drafting a config costs storage by rarity (documented sink)

Drafting spends storage on a **rarity ramp** (`DRAFT_COST` in `config.model.ts`). This was already in the prototype but undocumented in ADR-006's economy section. With multi-buy it is clearly motivated: it is the shop's primary storage sink and gives rarity an economic weight (ADR-006 Decision 9 left rarity cosmetic-only; this is the first place it bites).

## Amendments to ADR-006

- **Decision 1** — the pipeline grows well past 5 (cap `MAX_SLOTS`, currently 12 and live-tuned). The "3 → 5" text was stale.
- **Decision 7** — superseded by this ADR's Decision 1. No "pick exactly one".
- **Decision 10** — the sink list gains **draft-config cost (rarity ramp)** alongside draft-rebuild (Fibonacci) and on-demand lint (40KB). Slot width is a **coverage** sink, not a storage one.

## Consequences

- **Positive**: storage becomes a resource you actively spend down each shop, and the two-axis economy (storage buys power, coverage buys width) gives the reward screen real decisions. Balance numbers now describe the game as played.
- **Negative**: the coverage ladder is untuned against real polls; `coverageForAnswer` currently yields a ~1%/correct baseline even with no coverage config, so the ladder's reachability moves with any change to that baseline. Tune live.
- The shop UI must always show *why* a locked action is locked (insufficient storage vs unmet coverage), or a greyed button reads as a bug.
