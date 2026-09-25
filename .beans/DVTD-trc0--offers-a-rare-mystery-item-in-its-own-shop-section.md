---
# DVTD-trc0
title: A rare mystery offer in its own shop section
status: todo
type: feature
priority: critical
created_at: 2026-09-05T14:52:24Z
updated_at: 2026-09-25T11:00:14Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-clgs
---

**What:** A hidden item that turns up in the shop rarely, in a section of its own, and can be bought.

**Why:** The shop has no lucky moment.

## Done when
- [ ] Decided: what buying it actually gives you, and whether that changes an existing decision
- [ ] It cannot be fished for by rebuilding the shelf
- [ ] The price and the room it needs are shown; only the name is hidden
- [ ] What is inside leans toward configs the player has never seen
- [ ] Specs cover the rate, and that a rebuild cannot conjure one

## Notes

A `????` item that turns up in the shop **rarely**, in its **own section**, and can be bought. The rare appearance is the point: it is the shop's lucky moment.

## Decided

- It appears rarely, not every shop. Getting one is luck.
- It lives in its own section, not as a fixed slot inside the five offers.

## Decision 1: what buying it does

This is the open half, and it collides with a decision made on 2026-09-03.

**ADR-051 decision 1 ends: "KB never buys a config (unchanged)."** ADR-050 decision 4 says the same from the other side ("achievement only, no currency: `archived_storage` stays the cosmetics wallet"), and ADR-050 explicitly **rejected DVTD-9d7o**, the archived-storage random pull, which cost wiki §6.1 its "fund config unlocks" line. A rare purchasable unlock is close to the shape that was rejected. It can still ship, but the granting version amends ADR-051 rather than quietly contradicting it.

| Reading | What it sells | ADR cost |
| --- | --- | --- |
| **Run-only mystery** | the config for this run, identity hidden until bought, plus a Dex Reveal | none, both ADRs stand |
| **Reveal now, grant still earned** | the same, and the Dex marks it met, but carrying it in still comes from its objective | none |
| **Grant on purchase** | the config permanently joins the granted pool | amends ADR-051 D1 and ADR-050 D4 |

My pick: **run-only mystery plus the Dex reveal**. The luck lives in the *appearance*, not in the *ownership*, which is where the fun actually is: the jackpot is that it showed up at all. Unlocks stay deterministic and earnable, and nothing needs rewriting.

## The shelf is already whole

Worth stating before anyone designs against a lock that does not exist. **ADR-050 decision 2: "Grant gates the hand, never the shelf."** Every config is already buyable in every shop at every gate, unlocked or not. What a grant actually buys is a place in the **starting hand** pool. So a `????` is not opening a closed door in the shop; it is selling either a mystery or a permanent hand slot.

## Rarity

`upgradeOfferFor` in `draft.model.ts` is already exactly this pattern and should be copied rather than reinvented:

```
const nextRandom = randomFrom(seed ^ UPGRADE_OFFER_SEED);
if (nextRandom() * UPGRADE_OFFER_ONE_IN >= 1) return undefined;
```

Its own salt, its own one-in rate, and the rate is a playtest dial.

**The hole to close:** `draftSeed(gatesCleared, rebuildsUsed, extensionsBought)` includes `rebuildsUsed`, and `rebuildCost` starts at 4 KB (4/8/16/32…). If the `????` rolls off the draft seed, a player rebuilds until it appears and "rare" becomes "16 KB". Two ways out: salt the `????` roll off a seed that excludes `rebuildsUsed` so a rebuild cannot conjure one, or accept rebuild-fishing as intended play and price the thing knowing that is how it will be obtained. My pick: exclude `rebuildsUsed`. A jackpot you can shop for is not a jackpot.

## Price and what it shows

A hidden item cannot quote its size, and size is price (ADR-047: 32 KB a slot). Three ways: flat price regardless of what is inside, price by the size it turns out to be, or **show the slot mark and hide only the name**. My pick is the third: the player knows what it costs and what room it needs, and only the effect is a surprise. That also keeps the buy decision honest, since an unknown price on an unknown size is a coin flip, not a gamble.

## What is inside

Uniform draw from configs not currently held, or biased toward configs the player has never seen. My pick: biased toward the unseen. A `????` that hands over a config already met three times this week is a dud, and the bias is what makes the Configdex fill in.

## Open decisions

- Decision 1 above: run-only, reveal-only, or grant (and the ADR amendment if grant)
- The one-in rate, and whether it climbs with depth
- Whether more than one `????` can appear in a section
- Whether the section is visible-and-empty on ordinary visits, or absent entirely. Absent is louder when it appears; visible-and-empty teaches that the thing exists

## Todo

- `mysteryOfferFor(seed, …)` beside `upgradeOfferFor`, seeded so a rebuild cannot fish for it, with specs on the rate and on rebuild-immunity
- `ShopScreen.ui.tsx`: a third `<Section>` alongside `Build` and `Offers`, with the hidden-name row (slot mark shown, name redacted) and a story
- `ShopView.component.tsx`: map the offer, the price, and the buy handler
- Dex reveal on purchase, if decision 1 keeps it
- Wiki: the shop section gains the `????`, and §6 keeps its "KB never buys a config" line intact or gets amended, per decision 1

## Two of these decisions are now shared precedent (DVTD-r2k9, ADR-110)

The registry-services bean hit the same two questions and took the same answers,
so they are settled jointly rather than twice:

- **"Whether the section is visible-and-empty on ordinary visits, or absent
  entirely"** — absent. ADR-110 Decision 5: a panel renders only when it holds
  something, no "nothing today" furniture. Apply it to the `????` section too.
- **The seeding hole** — ADR-110 Decision 4 adopts this bean's finding verbatim:
  roll off a seed that excludes `rebuildsUsed`, because `rebuildCost` starts at
  4 KB and a jackpot you can shop for is not a jackpot. Services go further and
  pick their eligible gate *once at run start*, which is worth copying: it is
  rebuild-proof by construction and keeps the shop derived state (ADR-029 D5).

Decision 1 of this bean (run-only / reveal-only / grant) is untouched. ADR-110
Decision 7 restates that nothing it introduces buys a config, so ADR-050 D4 and
ADR-051 D1 are still intact and this bean's "my pick: run-only mystery plus the
Dex reveal" still needs no amendment.

Note the shop's right column is now spoken for by four things: Registry,
Registry controls, this `????` section, and Registry services. Worth deciding the
order before two of them land.

2026-09-25 (ADR-115): the render-only-when-occupied rule now lives in ADR-115 D9. ADR-110 D4 (roll the appearance off the run seed) died with licences, so the exclude-the-rebuild-count rule is this bean's own again.
