---
# DVTD-sue5
title: Take a config out of circulation, for yourself or for everyone
status: draft
type: feature
created_at: 2026-08-24T16:48:45Z
updated_at: 2026-08-24T16:48:45Z
parent: DVTD-z2r2
---

A way to take a config out of circulation: for yourself, or for another player.
Two very different mechanics under one word; both are open.

## What exists today

- Nothing removes a config from the *pool*. Sell and drop return it to circulation, a
  missed gate peels one out of the pipeline (ADR-037), and Rebuild rerolls the shelf for
  an escalating price (4, 8, 16, 32 ...). All four are shelf or build operations; the pool
  itself is always the whole roster.
- `rollDraft` draws from `CONFIG_LIST`, seeded by `draftSeed(gatesCleared, rebuildsUsed,
  extensionsBought)`. There is no player or day component in that seed, so two players at
  the same gate with the same rebuild count are looking at the same offers. Config shelves
  are effectively shared, the same way polls are.
- The unlock beans (DVTD-2try, DVTD-yl13) build the pool up. This is the inverse verb, so
  it belongs in the same conversation: DVTD-yl13's Verbs/Content/Vanity split would carry it.

## Banish for yourself

The buildable half. Open questions:

- **Horizon.** Rest of this run, rest of today, or permanent on the account. Rebuild
  already solves "not this shelf", so permanence is the only thing this verb adds. Pick
  the longest horizon you are willing to defend, or it duplicates Rebuild.
- **It thins the pool, which is power.** Removing junk raises the average quality of every
  future roll. In deckbuilders that is one of the strongest effects in the game, so a free
  or unlimited banish is an auto-use, not a decision. Needs a price, a per-run cap, or both.
- **Reversibility.** If it is permanent, can it be undone, and does the config show as
  banished somewhere rather than silently missing? A permanently invisible config is a
  support burden ("why do I never see Copilot").
- **WTFPL makes it strange.** With the whole catalogue on the shelf, banishing one config
  is nearly pointless; against a five-offer shelf it removes 20% of what you can be shown.
  Same verb, wildly different value.
- **What problem it fixes.** If the real complaint is "the shop keeps offering me junk",
  check first whether that is a roster-balance problem. A banish verb that mostly gets used
  on three known-weak configs is a balance report in disguise.

## Banish for another player

The half that needs a decision before any design.

- The only precedent is **Feature Request** (the proposed 4th shop control): one player
  biases *tomorrow's shared roll for everyone*, capped at 2 of 5 offers, one per player per
  day, already-rolled days frozen. That channel is non-targeted and symmetric, which is why
  it is defensible.
- A **targeted** banish is not the same thing. It needs a victim picker, which means live
  visibility of another player's run, and the standing line is that social data is
  deterministic and ghosts are completed runs, never live. It would also be the game's first
  adversarial mechanic, in a game whose social layer is the water-cooler moment.
- So the version that fits is "banish a config from tomorrow's shared shelf for everybody,
  including me", riding Feature Request's channel and guardrails. Targeted griefing is a
  different game, and if that is genuinely wanted it deserves its own decision, not an
  implementation detail of this one.

## Naming

"Banish" is deckbuilder vocabulary, not developer vocabulary, and this roster names things
after real tooling. Two real words already mean exactly this: **yank** (a published version
pulled from selection without being deleted) and **deprecate** (npm's own verb, softer, still
installable if you insist). Both beat banish on the literal-naming rule.

## Todo

- [ ] Decide whether the personal and the shared version are one feature or two beans
- [ ] For the personal one: horizon, price, cap, reversibility
- [ ] Rule explicitly on targeted-vs-shared, and record the reason either way
- [ ] Check the banish-worthy list first; if it is short, fix balance instead
- [ ] Pick the word (yank / deprecate / banish)
