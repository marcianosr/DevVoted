---
# DVTD-efjk
title: Build space scales with the build, not the shop
status: completed
type: feature
priority: high
created_at: 2026-09-22T11:27:33Z
updated_at: 2026-09-22T12:25:04Z
---

Replaces the build-space rung picker with a rung derived from the build's weight
(ADR-098, superseding ADR-082 D1-D5).

Rungs have no perks, no prepay discount and no commitment term, so "hold the
smallest rung that fits" is always dominant and the picker is arithmetic the
player performs by hand. Deriving it makes build space a consequence of building,
which is what it always was.

The rule:
    space  = smallest rung whose weight >= billableSlotsOf(build)
    upkeep = that rung's kb, charged at every clear, as today

BUILD_SPACE_RUNGS and its prices are UNCHANGED (4/free 6/16 8/32 12/64 16/128
24/256 32/512). Only the act of picking goes away.

Decisions taken with Marciano:
- Unpayable bill -> the player picks what comes off, via the existing peel
  (awaiting-strip + peelSlotsRemaining + strip), resuming to the shop not a redo.
- Crossing a threshold -> arms the install press; second press commits.
- The BuildSpace panel -> folded into the Build panel and deleted.
- BUILD_SPACE_FROM_GATE -> deleted; the rung is physics, not a shop offer.

## Todo

### Domain
- [x] rules.model: add rungIndexFitting / spaceFitting; delete BUILD_SPACE_FROM_GATE
- [x] build.model: delete Build.slots; add spaceForBuild / upkeepForBuild; re-point capacity predicates at the top rung
- [x] run.model: add RunState.peelOwedFor; drop slots from the seeded build
- [x] answer.model: settleUpkeep reads the derived space; shortfall interposes awaiting-strip
- [x] strip.model: resumeClimb branches on peelOwedFor
- [x] shopAction/runAction/run.validation: delete set-build-space end to end

### Application
- [x] runView.viewmodel: BuildSpaceView loses rungs/offered/pickable, gains the next threshold
- [x] shopScreen.viewmodel: delete buildSpacePropsFor + buildSpaceLockOf; add installScaleFor
- [x] newRunScreen.viewmodel: rewrite NEW_RUN_BUILD_NOTE

### UI
- [x] Delete BuildSpace.ui/.stories/.spec; move upkeepLabelOf to Build.ui
- [x] Build.ui: BuildWeight gains the bill + next threshold; buildHeadOf badges it; roomLineOf takes the threshold clause
- [x] ConfigChip.ui: ChipInstall gains scale + armed; consequence renders in the existing popup panel slot
- [x] WeightTrack.ui: preview prop, two-line caption
- [x] ShopScreen.ui: drop the buildSpace prop
- [x] ShopView/RunShop/proto-run/configRun.harness: drop onSetBuildSpace and the overSpace refusal
- [x] RunGate.component: verdict must read the outcome, not the status

### Docs
- [x] ADR-098
- [x] wiki.md sections 3, 5.1, 5.2, glossary, dials table
- [x] CHANGELOG.md

### Verify
- [x] npm test / npm run lint / npm run build
- [x] Verified in Storybook: resting Install vs armed saffron Confirm + consequence panel
- [x] Spec drives the shortfall path (unreachable by playing)

## Summary of Changes

ADR-098 written; ADR-082 D1/D2/D3/D5 superseded, D4 restated for a derived rung.

**Domain.** `Build.slots` deleted — the rung is `spaceFitting(billableSlotsOf(build))`,
derived in `build.model.ts` (`spaceForBuild`, `upkeepForBuild`, `rungAfterBuild`).
`rules.model.ts` gained `rungIndexFitting` / `spaceFitting` / `upkeepFitting` /
`rungAfterFitting` beside the existing downward-resolving lookups; the ladder and its
prices are byte-for-byte unchanged and the doubling invariant still passes.
`setBuildSpace`, `canSetBuildSpace`, `canPickBuildSpace`, `buildSpaceRungOf`, the
`set-build-space` action, its reducer branch, its SHOP_WRITES entry, its zod schema and
`BUILD_SPACE_FROM_GATE` are all gone.

**The shortfall.** `settleUpkeep` pays for the widest affordable rung and records it as
`spaceDroppedTo`, which `spaceCapOf` / `overflowWeightOf` / `roomToCapOf` (run.model)
turn into a cap the shop door enforces. Measured AFTER subscriptions settle, because a
lapse sheds weight too. `finishReward` already cleared the field, so the lock lasts
exactly the one shop visit.

**UI.** `BuildSpace.ui/.stories/.spec` deleted; the Build panel header carries the bill
(`5 configs · 7 of 8 weight · 1 free before the bill becomes 64 KB · ↻ 32 KB a gate`).
New `upkeep.ts` (shared by Build.ui and WeightTrack.ui, which would otherwise cycle),
new `InstallScale.ui` + story, `WeightTrack` gained `next` / `preview` / `perGateKb`,
`ChipInstall` gained `scale` / `armed`, `Button` gained a `commit` tone (saffron —
commits to a cost, does not destroy). An install that crosses a rung renames its press
to **Confirm · 32 KB** in saffron and opens the consequence panel; a second press
commits. Arming state lives in `ShopView.component` beside `openInfo`.

**Verification.** 3982 passing. The 8 failures are all `versionOddsFor`, a pre-existing
`TODO(Marciano)` stub on this branch (ADR-097) that returns `[]` — untouched by this
work. Lint clean, `lint:arch` clean (788 modules, no new edge), `npm run build` clean.
Story sweep with a scratch tsconfig: 16 errors, all pre-existing, none TS2304.
Confirm/Install contrast checked in Storybook.

## Deferred

- `DVTD-qkiq` (is the doubling ladder right?) matters more now: the thresholds are the
  only thing pricing a build, so their spacing is the whole difficulty dial.
- The uncommitted DVTD-2j1h locked-ladder work on `BuildSpace.ui` was discarded with the
  component it decorated.
