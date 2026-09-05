---
# DVTD-5ljh
title: 'Version rarity: weight which version the shelf offers, and show the rates'
status: todo
type: feature
priority: critical
created_at: 2026-07-13T08:23:53Z
updated_at: 2026-09-04T18:44:10Z
parent: DVTD-u35m
---

Rarity moved rather than died. It is no longer a property of a config (ADR-047
deleted grades, DVTD-nfnx keyed hue to slot size). It is a property of a
**version**: v1 common, v2 rare, v3 very rare, on up the rung ladder.

## What the shelf does today

- `UPGRADE_OFFER_ONE_IN = 8` (`shop/domain/draft.model.ts:96`): one flat roll
  decides whether the shelf carries an upgrade at all.
- If it fires, `upgradeOfferFor` picks a uniformly random member of
  `equipped.filter(isUpgradable)` and offers `levelUp(picked)`, always exactly
  one rung above what you hold.
- So no version is rarer than another by design. A v5 offer is rare only
  because four prior upgrades had to land first.
- Cost already climbs with the rung: `upgradeStorageCost(level) = 32 * (level + 1)`
  KB, and focus upgrades additionally demand `level * 5` coverage
  (`upgradeCoverageRequired`). Price is doing part of rarity's job already, so
  the bean has to say what rarity adds on top.
- `Version.ui` is the display: a five-rung zinc ramp, one more corner milled off
  per rung, deliberately monochrome because hue means slot size in this theme.

## Decide

1. **Offer or jump?** Weighting the offer means a v3 upgrade reaches the shelf
   less often than a v2. Weighting the jump means an offer can leap v1 to v3.
   Different games; pick one.
2. **Absolute number, or rungs remaining?** Two configs cap at `maxLevel: 2`
   (`configRoster.model.ts:156`, `:292`), so v2 is their ceiling. Keying "very
   rare" to the literal number 3 prices those two out of their own top rung.
3. **The free bump.** `autoUpgradeAfterCorrect` (Overclock) upgrades a random
   config for free and never touches the shelf (`autoUpgrade.model.ts:56`). A
   weighted shelf a config can route around needs a stated rule.
4. **Where the rates read.** No `RarityLegend` exists in terminal-theme; the old
   one survives only in the dead `proto-session-slice.tsx` route. `Version.ui` is
   the natural host, but the label must not become a hue, and tooltips are
   invisible on touch (DVTD-aiyp), so any rate needs a visible form too.
5. **Naming.** "common / rare / very rare" are the words ADR-047 removed.
   Either bring them back deliberately, scoped to versions, or use the
   version-native word. Do not end up with two vocabularies.

## Todos

- [ ] ADR: rarity is a version property; offer-weighted or jump-weighted; how it
      composes with the cost ladder and with the free auto-upgrade
- [ ] Weighted roll in `draft.model.ts`, seeded off `draftSeed` so the shelf stays
      shared and recomputable
- [ ] Rates surface on the version badge, visible and not tooltip-only
- [ ] Spec: distribution across many seeds, `maxLevel: 2` configs still reach their
      cap, free auto-upgrade path asserted either way
