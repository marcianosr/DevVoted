---
# DVTD-5ljh
title: 'Version rarity: weight which version the shelf offers, and show the rates'
status: completed
type: feature
priority: critical
created_at: 2026-07-13T08:23:53Z
updated_at: 2026-09-22T18:43:52Z
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

- [x] ADR-097: rarity is a version property; offer-weighted or jump-weighted; how it
      composes with the cost ladder and with the free auto-upgrade
- [x] Weighted roll (coin-flip climb) in `draft.model.ts`, seeded off `draftSeed` so the shelf stays
      shared and recomputable
- [x] Rates surface beside the version pennant (registry row `detail`) and on every Dex rung, visible and not tooltip-only
- [x] Spec: distribution across many seeds, `maxLevel: 2` configs still reach their
      cap, free auto-upgrade path asserted either way

## Decisions taken (2026-09-22, ADR-097)

1. Jump-weighted, coin-flip climb: one rung up, then 1 in 2 per further rung until the ladder ends. The cap keeps the flips it cannot take (v4 and v5 both ⅛ from v1); a `maxLevel: 2` config is always offered its v2. This dissolves "absolute vs rungs remaining".
2. A jump costs the registry price, flat. Rarity guards the bypass.
3. Odds only, `1 in N rolls`; no tier words, `Rarity` stays retired.
4. Dependabot (not Overclock — the bean had that wrong) stays one rung, uniform, free.

Corrections: the five-rung zinc-ramp `Version.ui` this bean describes was deleted in `eddae5f5`; the live kanto `Version` is a notched pennant spec-locked to `v3`, so the odds sit beside it in `ConfigChip.detail`. "Shelf" is retired; the list is the Registry.

Found and fixed en route: the kanto registry's upgrade offer fed the *offered* config to `upgradesFor` (so a v2 offer showed `↑ v3 · 96 KB`) and dispatched the coverage-gated `upgrade` action instead of `draft`. ADR-053's bypass was unreachable from the screen.

- [x] `versionOddsFor` body — landed 2026-09-22, all 8 specs green

## Summary of Changes

`versionOddsFor` (`src/modules/run/shop/domain/draft.model.ts:123`) now derives the
distribution `climbFrom` deals, closing the last open item on this bean.

One entry per rung from `held + 1` to `maxLevel`. Each rung costs one coin flip per step
above the one held — except the last, which costs one fewer, because the cap keeps the
flips it cannot take. That single off-by-one is the whole rule: it is why a two-rung
ladder's v2 is a certainty (zero flips) and why v4 and v5 tie at 1/8 on a five-rung
ladder rather than summing to 0.9375.

Derived, not enumerated, so `sums to one however tall the ladder` holds for maxLevel 2,
3, 5 and 8 from one expression.

### Verification

- `npm test`: **226 files, 4076 passed, 0 failed** (6 skipped, 2 todo). The 8 specs this
  bean was waiting on are green: 5 in `draft.model.spec.ts`, plus `dexScreen.viewmodel`,
  `shopScreen.viewmodel` and `Registry.spec.tsx`.
- `npx tsc --noEmit`: clean.
- `npm run lint`: 0 violations, depcruise 0 across 818 modules.

Note for the record: the red baseline run reported 217 test files, the green one 226 — the
red run had silently dropped 9 files (the known stray-vitest symptom), so the green run is
a superset, not a different suite.
