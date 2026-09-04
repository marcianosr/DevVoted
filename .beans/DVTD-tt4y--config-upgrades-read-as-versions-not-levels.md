---
# DVTD-tt4y
title: Config upgrades read as versions, not levels
status: completed
type: task
priority: normal
created_at: 2026-08-20T11:09:50Z
updated_at: 2026-09-03T15:25:39Z
parent: DVTD-d0fw
---

`L2` is the last RPG word in an otherwise all-dev vocabulary (KB/MB storage, coverage %, gates as CI, configs as tooling). Dev tools express "more of this" as a version bump, and the shop button already says Upgrade, which in dev means exactly one thing: bump a dependency. So this is a rename that makes an existing label more literal, not a new word.

The code already half-agrees: `autoUpgrade.model.ts` names its result `bumped` and its comment talks about an auto-merge landing without review, while `config.model.ts` still exports `levelUp`. This finishes the word that already won in the newer file.

## Decision

| Today | After |
| --- | --- |
| `L2` badge | `v2` badge |
| `level` field | `version` |
| `maxLevel` | `maxVersion` |
| `levelUp()` | `bump()` |
| `maxLevelOf` | `maxVersionOf` |
| `SAMPLE_SIZE_LEVEL` | `SAMPLE_SIZE_VERSION` |
| `upgradeCoverageRequired(currentLevel)` | `(currentVersion)` |
| `upgradeStorageCost(currentLevel)` | `(currentVersion)` |
| `focusCoverageMultiplier(level)` | `(version)` |
| `"highest-level"` audit strategy | `"highest-version"` |

No mechanic moves. Cap stays 5, Telemetry stays 2, `32 KB × the version bought`, `1 + 0.25 × version`, the ADR-039 coverage gate, `isUpgradable`, the Upgrade button label.

## Why now

`src/domains/runs/utils/levelCalculations.ts` uses "level" for a completely different thing: career coverage divided by 100, rendered as `[L2]` in `componentRegistry.tsx`. Two unrelated concepts share one word and one badge format today. Renaming config levels to versions frees "level" for the coverage concept instead of forcing a rename there.

## Scope

- [ ] `config/domain/config.model.ts` (field, `maxLevel`, `levelUp`, `maxLevelOf`, `DEFAULT_MAX_LEVEL`, `SAMPLE_SIZE_LEVEL`, the three upgrade-math fns, `describeConfig`, `givesOf`)
- [ ] `config/domain/effect.model.ts`
- [ ] `config/domain/configRoster.model.ts` (two `maxLevel: 2` entries plus Telemetry / Moore's Law / Dependabot comments)
- [ ] `config/domain/autoUpgrade.model.ts` (import + `levelUp` call; `bumped` already correct)
- [ ] `config/presentation/ConfigChip.ui.tsx:136` `L{level}` to `v{version}`, badge key
- [ ] `pipeline/domain/pipeline.model.ts`
- [ ] `gate/domain/audit.model.ts` (`highest-level` union member, `highestLevel` fn, Deprecated copy)
- [ ] `gate/domain/gateReward.model.ts`, `gate/domain/configRole.model.ts`
- [ ] `run/domain/run.model.ts` (upgrade reducer, Dependabot log line at :640, upgrade log line at :1038)
- [ ] `run/domain/runSnapshot.model.ts` (rehydrate keeps the earned version)
- [ ] `shop/presentation/ShopScreen.ui.tsx` (`nextLevel`, hover preview string)
- [ ] `community/domain/pollSplit.model.ts` + its service (Telemetry version 2 comments)
- [ ] Specs and stories: `config.model.spec`, `effect.model.spec`, `autoUpgrade.model.spec`, `pipeline.model.spec`, `run.model.spec`, `audit.model.spec`, `gateReward.model.spec`, `configRole.model.spec`, `runSnapshot.model.spec`, `ConfigChip.spec/.stories`, `ConfigActions.stories`, `RewardScreen.spec/.stories`, `RoleList.stories`, `ShopScreen.spec`, `AnsweringScreen.spec`, `PollCard.stories`, `pollSplit.model.spec`, `pollSplit.service.spec`
- [ ] Test names too: "caps focus configs at level 5" reads as "at v5"
- [ ] wiki 4.4 Upgrades, the Dependabot roster row ("bumps one random config a version for free"), and the two summary tables at wiki 789 / 811
- [ ] CHANGELOG entry (player-visible: the chip badge changes)

## Out of scope

Legacy `src/domains/`: `runs/prototype/sessionSlice.ts`, `runs/prototype/sessionRun.ts`, `routes/proto-session-slice.tsx`, `runs/utils/levelCalculations.ts`, `presentation/componentRegistry.tsx`. Those keep `level`. The prototype route is a separate surface and `levelCalculations` is the other concept described above. Migrate per CLAUDE.md when that slice is next touched.

## Open

Whether behaviour-changing bumps should read as major and payout-only bumps as minor (`v1.2` vs `v2.0`), which would mark Telemetry's calibration bump as different in kind from Unit Tests buying payout. Deferred: only one config would use it today, and it widens the corner badge to a wrapping string. Revisit if the roster grows more of them.

## Player-facing copy done ahead of the rename (2026-08-25)

Playtest feedback landed on the shop's Upgrade affordance, so the four
display strings on the modern-theme surfaces were flipped without waiting
for the field rename:

| File | Was | Now |
| --- | --- | --- |
| `shop/presentation/ShopView.component.tsx` | `level {n}` row summary | `v{n}` |
| same, `upgradeHint` | `L{n}: …` preview | `v{n}: …` |
| `run/presentation/PollView.component.tsx` | `level {n}` rail note | `v{n}` |
| `run/presentation/PrepView.component.tsx` | `level {n}` row summary | `v{n}` |
| `ui/modern-theme/screens/ShopScreen.stories.tsx` | `Common · level 1` fixture | `Common · v1` |

Pinned by a new `ShopView.spec.tsx` case; no spec asserted the copy before,
which is how the RPG word survived the vocabulary decision.

Everything in the Scope list above still stands — the `level` field,
`levelUp`, `maxLevel`, the `highest-level` audit strategy, the legacy
`ConfigChip` badge, wiki and CHANGELOG are all untouched.

Noticed while doing it: `level` is only ever set by `levelUp`, so a config
that has never been bumped has no version to state and the summary is
absent rather than reading `v1`. Consistent with ConfigChip's `level > 1`
guard, but worth a deliberate decision when the rename lands — a roster
that stamped `version: 1` would make every row state its version.
