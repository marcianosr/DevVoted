---
# DVTD-annw
title: Pre-selected unlocked configs at run start, with shop tie-in
status: draft
type: feature
priority: normal
created_at: 2026-05-30T13:01:31Z
updated_at: 2026-05-30T13:07:16Z
parent: DVTD-lwvx
blocked_by:
    - DVTD-16
---

Before a run starts, surface a curated subset of the player's **unlocked** configs as a pre-selection. The same unlocked pool also seeds (or biases) what shows up in the in-run shop, so the player's collection has a visible effect on every run — not only on what they *can* do, but on what the game proactively *offers* them.

## Why this matters

- Today, configs are picked manually each run — players default to favourites and forget about long-tail unlocks they own.
- The Discovery/Unlock system ([[DVTD-16]]) generates a growing collection over time, but that collection has no in-run presence beyond "they're in a dropdown somewhere".
- A pre-selection step makes unlocks **feel earned** every time you start a run, not just on the day you unlocked them.
- Tying it to the shop converts collection-size into a meaningful axis of player power, the same way deck size influences draft offers in roguelike deckbuilders.

## Sketch of the flow

1. **Run start screen** shows ~3–5 pre-selected configs drawn from the player's unlocked pool.
   - Selection logic TBD: random, weighted by rarity, weighted by recency-of-unlock, or themed by chosen category.
   - Player can lock, swap, or reroll picks (cost? free? open question).
2. **In-run shop** offers a mix of:
   - Always-available baseline configs (low rarity, everyone gets these).
   - Configs from the player's unlocked pool that *weren't* picked at run start — so the pre-selection is a hint, not a hard exclusion.
   - Optional: 1 wildcard slot for a config the player does NOT own yet (discovery hook).

## Design questions

- Is the pre-selection rerollable, and if so at what cost?
- How does this interact with run config presets, if presets stay as a concept?
- Should pre-selection be skippable for players who want to hand-pick (power-user toggle)?
- Does rarity affect *appearance frequency* in the shop, or only the strength of the effect?
- Does this replace the current config picker, or sit alongside it as a "quick start" mode?

## Related

- Sibling of [[DVTD-16]] — relies on the unlock state that system tracks.
- Conceptually adjacent to the deck-building sketch (2026-05-30 chat): the pre-selection is essentially a small auto-drafted "deck" of configs seeded from the collection.
- Touches the shop surface used by [[DVTD-1]] reward cards — worth checking whether config-shop and reward-card-shop should share UI or stay separate.


## Why blocked

Blocked by [[DVTD-16]] — the unlocked pool this bean curates from doesn't meaningfully exist until the Discovery/Unlock system is in place. Until then, "pre-selection from your collection" is pre-selection from ~3 items, which is just a config screen with extra steps.

Revisit after DVTD-16 ships. At that point also re-evaluate against the deck-building sketch (2026-05-30 chat) — if deck building is built, this bean is largely redundant and should be scrapped. The genuinely load-bearing half of this bean (shop offers biased by the player's unlocked pool, Balatro-style) is worth pulling out as its own smaller bean once a config-shop exists.
