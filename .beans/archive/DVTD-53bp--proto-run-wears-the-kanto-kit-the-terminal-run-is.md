---
# DVTD-53bp
title: proto-run wears the kanto kit; the Terminal Run is deleted
status: completed
type: feature
priority: high
created_at: 2026-09-12T20:58:07Z
updated_at: 2026-09-13T07:30:57Z
---

Rewire /proto-run from the terminal-theme screen set onto the kanto kit, and delete the terminal run screens it leaves behind. Plan: ~/.claude-work/plans/i-want-to-start-abundant-journal.md

The kanto kit is finished (7 screens, ~50 parts) but wired to nothing. The playable rig still wears the theme it is meant to replace.

## Decisions

1. **Reskin first.** runReducer keeps the current economy (gate-multiplied percent points, boolean gate pass). A band bridge derives kanto's five bands from engine outcomes. ADR-073/074/076 land later, behind the same adapters.
2. **Pick submits, the pin reveals.** Single-answer polls answer on pick; multiple toggle and submit from a footer. Feedback is the CoverageBar pin (ADR-077), then Next. RevealScreen dies.
3. **Drop unparity'd affordances.** Lint, peek, buy-back, rebase, estimate stay in the reducer but unreachable from the rig. Dev-rig panel stays.
4. **One pass.** All screens wired and the terminal run deleted in a single change.

## Todo

- [x] Kit: PollScreen footer? prop (submit + next moods) + stories/spec
- [x] Kit: ShopScreen footer? prop (exit to prep) + story/spec
- [x] Kit: kantoGateWon() frame + Won story + spec (tail.ending on a non-danger theme)
- [x] Gate A: lint + test (250 files / 4633 tests)
- [x] Band bridge: gate/application/gateBand.viewmodel.ts + spec (20 specs)
- [x] Lift presenters out of src/test into module presentation/application
- [x] Adapter: StartView -> NewRunScreen
- [x] Adapter: PollView + PollAnsweredView -> PollScreen
- [x] Adapter: GateOutcomeView (new) -> GateOutcomeScreen (replaces Reward/Removal/GameOver)
- [x] Adapter: PrepView -> PrepScreen
- [x] Adapter: ReviewView -> ReviewScreen
- [x] Adapter: ShopView -> ShopScreen
- [x] Route rewrite incl. simulateCommunityScreen
- [x] Gate B: lint + test + build (248 files / 4416 tests)
- [x] Deletion sweep (adapters, terminal screens, orphaned atoms, by grep fixpoint)
- [x] Gate C: lint + test + build + fixpoint grep (240 files / 4158 tests)
- [x] Docs: ADR-063 line 66, ADR-076 lines 95-106
- [x] Beans: scrap DVTD-tduu + DVTD-4awc, update DVTD-6crx

## Notes

Band bridge normalizes held/demand and pins the demand mid-bar: CoverageBar is a 0-100 scale but engine demands reach 375. Clamps are load-bearing because gatePassed = !isBare(build) && coverageGained >= demand, so ratio >= 1 does NOT imply a clear.

BandOutcome.pays reads the engine's flat modifiers.gateReward, so every band advertises one figure. Accepted for the reskin.

## Summary of Changes

/proto-run now renders the kanto kit end to end, and the terminal run screen set is deleted.

### Adapters (src/modules/run/**/presentation/)
- `build/StartView` -> NewRunScreen (8 specs)
- `run/PollView` + `PollAnsweredView` -> PollScreen, two moods in one file (10 specs)
- `gate/GateOutcomeView` **new** -> GateOutcomeScreen, replaces RewardView + RemovalView + GameOverView (8 specs)
- `run/PrepView` -> PrepScreen (7), `run/ReviewView` -> ReviewScreen (5), `shop/ShopView` -> ShopScreen (7)
- RevealView deleted with no successor: the answered mood is PollAnsweredView with bar.pin

### Presenters lifted out of src/test
gateOutcome / gateReview / swatchTrack / gateBand (gate/application), prepScreen / pollScreen (run/application), configChip (config/application), shopScreen (shop/application). Frames carry settled numbers so one presenter serves both the ladder fixtures and the engine. The factories re-export them because depcruise forbids ui/*.spec.tsx importing module values.

### Band bridge
gateBand.viewmodel.ts normalises held/demand onto the 0-100 bar (demand pinned mid-bar, perfect at 2x). Required because CoverageBar clamps at 100 while COVERAGE_DEMANDS reaches 375. Clamps are load-bearing: gatePassed = !isBare(build) && held >= demand, so ratio >= 1 does NOT imply a clear.

### Kit changes
PollScreen.footer? and ShopScreen.footer? (both optional ScreenFooterProps), kantoGateWon() frame + Won story. AuditView.id narrowed from string to AuditId.

### Deleted
9 terminal run screens + stories/specs, 18 terminal atoms (grep-to-fixpoint sweep), 4 dead adapters + specs, ConfigsInAction.stories, Standouts/RunCommunity/Voter. Survivors: /run/community (CommunityScreen, ClimbTrack), the storybook Dex/Home cluster, format.ts, sizes.ts.

### Verification
- Gate A: 250 files / 4633 tests
- Gate B (both kits live): 248 / 4416, lint clean, build exit 0
- Gate C (after sweep): **240 files / 4158 tests passed**, depcruise 0 violations across 946 modules (was 1007), build exit 0
- No browser check, per standing preference.

### Deferred
- Community screen is a route-local simulation; the climb map is still a placeholder (DVTD-4km2), the conversation has no domain model (DVTD-2iqx).
- BandOutcome.pays reads the engine's flat modifiers.gateReward, so every band advertises one figure. Goes when ADR-073 lands.
- CoverageBandId is still declared twice (coverageRatio.model + CoverageBar.ui).
