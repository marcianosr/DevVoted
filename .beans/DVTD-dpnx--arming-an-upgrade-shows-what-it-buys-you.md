---
# DVTD-dpnx
title: Arming an upgrade shows what it buys you
status: completed
type: feature
priority: high
created_at: 2026-09-03T09:45:30Z
updated_at: 2026-09-03T13:18:30Z
parent: DVTD-cb52
---

Arming an upgrade tells you the price and the requirement, never the payoff. `ShopView.component.tsx:206` fills the projection with one entry:

```ts
changes: [{ from: `v${level}`, to: `v${level + 1}` }]
```

so the armed row reads "v1 → v2" plus a `64 KB` price tag, and the button hint is `name · upgrade · price`. `upgradeShortfalls` covers what you still need. Nothing on the screen says what the config will do differently, which makes the upgrade the only purchase in the shop bought blind.

**The kit already has the slot.** `ShopScreen`'s `ArmedTrailing` maps every entry of `row.upgrade.changes` to a dashed projected `Change`, so this is Tier-2 work: compute real deltas and put them in the array. No new component unless decision 2 says otherwise.

## Where the numbers come from

`isUpgradable` names the five axes a level can move, and each has an accessor in `config.model.ts` already:

| axis | accessor | what a level does |
| --- | --- | --- |
| `focusCategory` | `focusMultiplierOf` | `1 + 0.25 × level`, so ×1.25 → ×1.5 |
| `storageOnClear` | `storageOnClearOf` | the KB figure × level |
| `storageInterestPct` | `interestPctOf` | the percentage × level |
| `autoUpgradeOneIn` | `autoUpgradeOneInOf` | 1 in N shrinks by one per level |
| `peeksCommunitySplit` | `showsSampleSize` | at level 2 only, and it is a behaviour, not a number |

So the whole preview is `levelUp(config)` diffed against `config` through those accessors. `describeConfig` already writes the sentence from live values, which means `describeConfig(levelUp(config))` gives the after-text for free and needs no new copy table.

Both halves of `minifiedMultiplier` and `minifiedAmount` sit inside those accessors, so a minified config previews its own smaller gain without special-casing.

## Decisions needed

1. **When it shows.** On arm only (where the projection already lives), or also in the button hint before arming. My pick: arm only. The hint is a one-line `title` and the deltas are the reason to arm in the first place.
2. **Number, sentence, or both.** The `Change` chips are compact and fit the rail; `describeConfig` is a full sentence and needs a line of its own. My pick: chips for the axes that move a number, and fall back to a worded chip for the sample-size case.
3. **The behaviour axis.** `peeksCommunitySplit` gains sample size at level 2 and gains nothing at 3, 4, 5. A "v3 → v4" arm on that config would show a price and no benefit, which is worse than showing nothing. My pick: say "no change" plainly, and check whether that config should be capped at `maxLevel: 2` instead. Flag it either way.

## Todo

- [ ] `upgradePreview(config)` in `src/modules/run/config/domain/` returning the moved axes as `{ label, from, to }`, with specs per axis
- [ ] `ShopView.component.tsx`: feed `changes` from it instead of the version step, keeping the version step first
- [ ] `ShopView.spec.tsx`: one case per axis, plus the no-change case from decision 3
- [ ] Sample-size axis worded per decision 2
- [ ] Story coverage: `ShopScreen.stories.tsx` armed variant carries a real multi-axis projection
- [ ] Check the maxed row still reads right once the projection is longer
- [ ] CHANGELOG entry
- [ ] Verify: `npm run lint`, `npm run build`, stories tsconfig, `npm test`

## Summary of Changes

Shipped as part of DVTD-tupk / ADR-053.

- `upgradePreview(config)` in `src/modules/run/config/domain/config.model.ts` diffs `levelUp(config)` against the config through the five level accessors and returns one `{ from, to }` per axis that actually moves; axes that do not move are filtered out, so a peek at L3+ produces no chip rather than a no-op one.
- Decision 1 (arm-only vs button hint): **both, split by job.** The chips and the v-next sentence appear on arm; the button hint carries the price and, when gated, the requirement (that half is the DVTD-tupk fix for a disabled press giving no reason).
- Decision 2: chips per numeric axis, worded chip (`split only → with sample size`) for `peeksCommunitySplit`.
- Decision 3: no cap change needed. Telemetry already sets `maxLevel: 2` in the roster, and the filter drops the no-change case for anything else.
- The armed row's note is now `describeConfig(levelUp(config))`. Previously it was `upgradeShortfalls(...).join(" ")`, which is empty exactly when the upgrade is affordable, so the row's detail rendered as an empty string and the config's description vanished at the moment of purchase.
- 6 specs in `config.model.spec.ts`, 2 in `ShopView.spec.tsx`.
