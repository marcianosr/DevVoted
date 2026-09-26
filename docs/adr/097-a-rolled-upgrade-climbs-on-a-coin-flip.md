# ADR-097: A rolled upgrade climbs on a coin flip

## Status

Accepted, 2026-09-22 (Marciano, DVTD-5ljh). Amends
[ADR-053](053-upgrades-appear-on-the-shelf-and-arms-switch-mid-poll.md) decision 4:
a rolled upgrade is no longer exactly one rung above the version held. Closes the loop
[ADR-047](047-a-configs-size-is-a-number.md) left open in its Context ("the weights
have never been rolled against"): a weight is rolled now, and it sits on a version,
not on a config. Grades stay deleted. The climb and its odds live in `draft.model.ts`.

## Context

ADR-047 deleted grades because `bit / crumb / nibble / byte` named six things and only
the slot count did any work; the drop weights among them had never been rolled. What
rarity was *for* did not go away. The registry's one owned-config offer (ADR-053) is the
one place a run finds something it did not pay full price for, and every such find was
identical: one rung up, one shop in eight. A v5 was rare only because four prior offers
had to land first, and the price ladder (`upgradeStorageCost`, 32 KB × the level bought)
was already doing the work of making high rungs expensive. Rarity had to add something
price does not.

The kanto shop screen also turned out to sell that offer through the wrong press.
`upgradeChipFor` fed the offered, already-levelled config into `upgradesFor`, which read
its level as the one *held*, so a v2 offer showed a `↑ v3 · 96 KB` press; and the press
dispatched the shop's own `upgrade` action, coverage gate and press price included. The
bypass ADR-053 decided was unreachable from the screen. A multi-rung offer would have
made that misread worse (a v3 offer reading `↑ v4`), so the wiring is fixed here.

## Decision

1. **The offer climbs.** `upgradeOfferFor` still fires one shop in eight and still picks
   uniformly among the build's upgradable configs; those two draws are unchanged. It then
   starts one rung above the version held and, for each further rung, flips a coin
   (`CLIMB_ONE_IN`, 2): heads climbs, tails stops, and the ladder's cap (`maxLevelOf`)
   stops it too. From v1 on a five-rung ladder the offer is v2 half the time, v3 a
   quarter, v4 an eighth, v5 an eighth. The climb draws from the same split stream
   *after* the two existing draws, so every seed keeps the config it offered before and
   only some gain rungs.
2. **The climb is keyed to rungs above the one held, and the cap simply ends it.** A
   `maxLevel: 2` config (Telemetry, git rebase -i, Dependabot) is always offered its v2;
   a v4 is always offered its v5. Nothing is priced out of its own top rung, which is
   what keying "very rare" to the literal number 3 would have done. The cap keeps the
   flips it cannot take, so the top two rungs of a long ladder share one figure: that is
   the price of a rule that fits in one sentence.
3. **A jump costs the registry price, flat.** A v3 costs exactly what a v2 costs
   (`draftCostIn`, no coverage requirement), as ADR-053 priced the one-rung offer.
   Rarity is what guards the bypass now; a two-rung find is a jackpot, and the odds say so.
4. **The odds read on screen as `1 in N rolls`, never as a tier.** No word returns for a
   rung. On the registry, the rolled offer's row states the odds its rung landed on
   (`1 in 4 rolls`) beside the version pennant, at rest, as plain text: a "1 in N" is not
   an ADR-066 figure and must not wear a badge that reads as coverage, and the kit's
   hints are aria-labels nobody can see. The Dex states no odds since
   [ADR-108](108-the-dex-reads-configs-as-chip-rows.md) decision 4. `Rarity` stays a
   retired term in CONTEXT.md.
5. **Dependabot is not a roll.** `autoUpgradeOnAnswer` still levels one random installed
   config by exactly one rung, free, on a clean streak. Rarity is what the registry
   *finds*; Dependabot *earns* the next rung. Its spec already pins "levels exactly one
   config by one when it fires".
6. **The registry's upgrade offer sells through `draft`.** `upgradeChipFor` takes the
   offer, the level held and the install deal; `registryUpgradesFor` marks the held rung,
   the rungs the roll leapt and the one it landed on, prices only the landed rung at the
   registry price, and totals no press ladder. `ShopView` routes the press to `onDraft`;
   the `upgrade` action belongs to the Build panel alone.
7. **The pennant states the version held, on the registry as everywhere else.**
   Amended 2026-09-24 (Marciano, DVTD-c2ha). This ADR originally had the registry row
   wear the version *on offer*, on the reasoning that the row is an advertisement for a
   rung. In play it reads as the opposite: a pennant means "this is what you have" on
   the Build panel, so a v2 offer showing `v2` beside a press reading `↑ v2` reads as
   being sold a version you already own. One glyph cannot carry two meanings across two
   surfaces. The press states the target, the pennant states the holding, and decision 6
   is untouched — the registry still sells the climb, and still waives the coverage gate
   the Build press enforces.

## Numbers

| Rule | Value |
| --- | --- |
| Upgrade offer frequency | ~1 shop in 8 (`UPGRADE_OFFER_ONE_IN`, unchanged) |
| Each further rung | 1 in 2 (`CLIMB_ONE_IN`) |
| Odds from v1, cap 5 | v2 ½ · v3 ¼ · v4 ⅛ · v5 ⅛ (`versionOddsFor`) |
| Jump price | the registry price, whatever the rung (`draftCostIn`) |
| Dependabot | one rung, always |

## Consequences

- `draftSeed` includes `rebuildsUsed`, so a Rebuild re-rolls the climb along with the
  offer. Fishing for a jump is bounded by the doubling rebuild ladder (4 → 512 KB): a
  two-rung find saves one press price and one coverage gate, and three rebuilds already
  cost 28 KB against a 1-in-32 chance per shop. Left as is. DVTD-trc0 chose to drop
  `rebuildsUsed` from its own roll; this ADR does not.
- A renovate config that always offers an installed config's next version (DVTD-sjh2)
  would guarantee the *offer*; the climb would still roll. Say so when it is built.
- DVTD-pv5q's premium price and depth ceiling for a versioned offer are superseded by
  ADR-053 and this ADR together; the bean is scrapped.
- The domain still says `level` and the kit still says `version` (ADR-060 flagged this).
  CONTEXT.md now records the pair rather than reconciling it.
- `ShopOffer` carries `heldLevel`, so a presenter can state a jump without re-deriving
  the build.
