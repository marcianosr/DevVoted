---
# DVTD-sjh2
title: 'Config: renovate always offers an installed config''s next version'
status: todo
type: feature
created_at: 2026-09-16T18:22:47Z
updated_at: 2026-09-16T18:22:47Z
parent: DVTD-72d9
---

One registry slot always offers an installed config's next version when one
exists. It still costs KB, and it still bypasses the coverage gate the shop
enforces, exactly like a rolled upgrade.

## This is mostly already built

upgradeOfferFor in shop/domain/draft.model.ts already does the whole thing, at
UPGRADE_OFFER_ONE_IN = 8:

- it filters equipped to isUpgradable and returns undefined when none qualify
  ("when available" comes free)
- it replaces the LAST of the five offers, which is literally "one slot"
- draft() routes the result to draftUpgrade, which checks affordability ONLY -
  upgradeCoverageRequired has exactly one call site, in shopAction.upgrade, and
  the rolled path never reaches it
- it prices at draftCostIn (full slot price), not upgradeStorageCost

So renovate is: skip the probability branch when the config is held. The rest of
the pipeline already behaves.

## Decisions

- Axis alwaysOffersUpgrade?: boolean, read inside upgradeOfferFor.
- skipReasonFor reuses the existing { kind: "inShop" } - no new skip kind.
- Not upgradable: the effect is binary.
- 2 slots. It is shop economy like yarn.lock (1), but a guaranteed upgrade lane
  compounds harder than a lock does.

## Why this axis, next to its two neighbours

- Dependabot (8 slots) upgrades a random installed config FREE every 5 correct
  in a row, and also ignores the coverage gate. It is free but conditional, and
  it picks for you.
- renovate is paid but certain, and the pick is yours from the registry.

Stating that split here so it is not rediscovered mid-build. If the two ever feel
redundant, Dependabot is the one with the stronger identity (it keys off the
streak); renovate is the one to re-cut.

Watch DVTD-pv5q (shop sometimes stocks a newer version of a config) - it is the
same code path and may be the same bug or the same fix.

## Todo

- [ ] Config.alwaysOffersUpgrade axis
- [ ] upgradeOfferFor branch + seeding note (the roll must stay reload-stable)
- [ ] renovate roster entry + CONFIG_UNLOCKS entry
- [ ] skipReasonFor -> inShop
- [ ] Specs: guaranteed when held, absent when nothing is upgradable, still
      priced at draftCostIn, still past the coverage gate
- [ ] Story page, wiki 4.3 row, CHANGELOG
