---
# DVTD-38e9
title: Dex Configs becomes a card grid
status: completed
type: feature
priority: normal
created_at: 2026-09-15T15:23:32Z
updated_at: 2026-09-15T15:36:12Z
---

The Dex Registry's Configs tab renders the roster as a flat row list: weight block, name,
a collapsed `v5` badge hiding the whole ladder in a tooltip, a truncated effect, and the
provenance sentence right-aligned. Locked configs read as a `???` silhouette with both
unlock paths as plain text.

Replace it with a card grid, following `DexSwatches` (the only card-shaped Dex panel).

## Decisions

- **Version chips read a rung, they do not report progress.** A config's level is bought
  with storage inside a run and dies with it; `user_config_unlocks` has no level column.
  Rather than invent that persistence (blocked bean DVTD-i2jz / DVTD-fv8x), every rung is
  a pressable Badge and pressing one swaps the card's effect line to that rung's prose and
  price. Kanto's pressable badge is already blue and ringed, so it lands close to the mock
  without lying about what the colours mean.
- **Provenance becomes a short tag** ("starter" / "earned") with the full sentence in a
  Tooltip, `align="end"` so a right-aligned tag opens inward.
- **Sorting stays byWeight.** The mock is granted-first, but heaviest-first is a documented
  decision and the tab header reads "by weight".
- Per-rung prose comes from `givesOf({ ...config, level })`, which is level-aware for
  exactly the upgradable set. `figureLabel` yields a bare "x1.5" and reads badly as a
  card's only sentence.
- The mock's "close" badge is dropped.

## Two things the mock shows that the data cannot back

- **Most configs have no ladder.** `isUpgradable` needs one of focusCategory,
  storageOnClear, storageInterestPct, peeksCommunitySplit, reordersGatePolls or
  autoUpgradeAfterCorrect. 16 qualify, 22 do not. Code Coverage, IndexedDB and Cache are
  all in the second group and show no chip row.
- **Ladders are five rungs, not three.** DEFAULT_MAX_LEVEL is 5. The mock's v1/v2/v3 came
  from a test fixture, not the roster.

## Todo

- [x] DexConfigs.ui.tsx: grid of cards, chip ladder, Meter on the fallback path
- [x] DexUnlockPath keeps raw count/target instead of a joined string
- [x] DexConfigRow granted variant forwards `starter`
- [x] versionsOf builds prose via givesOf
- [x] Dex.component.tsx holds the selected rung (ADR-010: no hooks in .ui)
- [x] Rewrite DexConfigs.spec.tsx; widen dexRegistry.factory.ts
- [x] Update dexScreen.viewmodel.spec.ts
- [x] Docs: wiki 6.4 + CHANGELOG
- [x] Verify: npm test, npm run build, npm run lint

## Summary of Changes

**`src/ui/kanto-theme/DexConfigs.ui.tsx`** rewritten as a card grid, following `DexSwatches`
(`Panel.Body > grid > card`), the only other card-shaped Dex panel. `Panel.Rows`/`Panel.Row`
are gone from this file, and so are `VersionLadder`, `versionBadgeOf` and `versionsHintOf`:
the flat chip row replaces the collapsed `v5` badge and its tooltip. New exports:
`unlockLabelOf` (now `unlock · text`), `alternativeLabelOf`, `progressLabelOf`,
`provenanceTagOf`, `rungHintOf`.

**Contract changes.** `DexUnlockPath.progress` went from a joined `"43/225"` to
`{ count, target }`, which `Meter` needs and `UnlockPathCaption` already carried.
`DexVersionRung.effect` went from a bare figure to prose. The granted row forwards
`starter`, a boolean `ConfigdexEntry` has always had and the viewmodel dropped.
`DexConfigsProps` split into `DexConfigsData` (what the presenter derives) plus the
wiring pair `selected`/`onVersion`, so `dexConfigsFor` can keep returning data only.

**Per-rung prose** comes from `givesOf({ ...config, level })`, which is level-aware for
exactly the `isUpgradable` set; `figureLabel` stays as the fallback. This was the reason
not to need any new domain field.

**Selection lives in Tier 2.** ADR-010 forbids hooks in a `.ui.tsx`, so `Dex.component.tsx`
holds one `useState<Record<string, number>>` and passes `selected`/`onVersion` down, the
way `Tabs` and `ConfigChip` are already controlled.

**The footer note absorbed the rule** the deleted tooltip used to carry ("a version ladder
is bought with storage inside a run and lost when the run ends"), so deleting the tooltip
did not delete the only place that said it.

## Deviations from the mock, and why

- **The mock colours the ladder as owned/next/locked progress. It does not.** Nothing
  persists a best-ever version; a level is bought in-run and dies with the run. Rather than
  invent that persistence (DVTD-i2jz, blocked on DVTD-fv8x), a chip is a pressable thing to
  read. Kanto's pressable badge is already blue and ringed, so the look survives.
- **No "maxed" label**, which only means something if the ladder reports ownership.
- **No "close" badge**, dropped at the user's request.
- **Code Coverage, IndexedDB and Cache show no chips.** They are not `isUpgradable`, so
  `versionsOf` returns undefined. 16 of the roster have ladders, 22 do not.
- **Ladders are five rungs, not three.** `DEFAULT_MAX_LEVEL` is 5; the mock's v1/v2/v3 came
  from `dexRegistry.factory.ts`, not the roster.
- **Sorting stays `byWeight`.** The mock is granted-first, but heaviest-first is a documented
  decision and the tab header reads "by weight". Left alone; easy to reverse if wanted.
- **The alternative path's bar carries no visible text**, per the mock. It names itself in an
  `sr-only` span so a screen reader still gets "or · Answer 225 polls".

## Verification

`npm test` 4476 passed, 6 skipped, 2 todo; 2 failing in
`src/modules/run/gate/domain/gate.model.spec.ts` ("the floor rule"), pre-existing on this
branch and unrelated: that spec and `gate.model.ts` have zero diff against HEAD, and nothing
here is reachable from them. `npm run build` passes. `npm run lint` clean, depcruise reports
no violations across 992 modules. DexConfigs.spec 16/16, dexScreen.viewmodel.spec 30/30.

Not done: nobody has looked at this in a browser yet.

## Follow-up: the configs tab is pallet, not viridian

First look at the real screen showed the problem the fixtures could not: `DEX_TABS` themed
the tab viridian, and `[data-screen-theme="viridian"]` is one of the few tab colours that
sets `--theme-ground-chroma` (0.18). A card grid is almost entirely badges, and every
ambient `badge-theme` badge plus every `Figures` gain badge is viridian too, so the whole
tab was green-on-green and the weight blocks, counts and figures all disappeared.

`pallet` sets `--theme-color` and no ground chroma at all, so the ground stays neutral,
ambient badges read light, and a viridian gain badge now pops green against them instead
of vanishing into them. One line in `DEX_TABS`, plus the story fixture and a spec pinning
`dexThemeOf("configs") === "pallet"` so it does not get quietly reverted.

`npm test` 4477 passed (the new theme spec), same 2 pre-existing `gate.model.spec.ts`
failures. Build and lint clean.
