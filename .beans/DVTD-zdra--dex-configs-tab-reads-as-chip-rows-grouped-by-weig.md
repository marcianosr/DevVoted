---
# DVTD-zdra
title: Dex Configs tab reads as chip rows grouped by weight
status: completed
type: feature
priority: normal
created_at: 2026-09-24T14:09:51Z
updated_at: 2026-09-24T16:01:28Z
---

**What:** Replace the Dex Configs card grid with rows of inline chips grouped under "N weight · held of total" headings, each chip carrying weight, name, version dots, the effect figure and an (i) that opens a two-line hint; a locked config is a dashed chip showing only its weight and its unlock paths behind the (i).

**Why:** The card grid spends a card per config on information the player reads once; a chip row shows the whole roster at a glance and the checklist filling in.

## Done when

- [x] The tab shows one row of chips per weight, heaviest first, granted before locked
- [x] A granted chip reads weight, name, ladder dots (v1 filled), the effect figure and an (i) that opens "starter · v1 of 5" and the effect sentence
- [x] A locked chip is dashed, shows only its weight, and its (i) opens both unlock paths with progress
- [x] The met state exists as a Story variant and nothing else, until a reveal ledger exists
- [x] ADR-108 records the decisions; ADR-050 D5, ADR-051 D7 and ADR-097 D4 point at it; wiki 6.4 and the changelog are updated
- [x] Tests, build and lint pass

## Notes

Mock: rows of chips, tooltip above the chip on hover/press, footer stating the reveal rule.

Decisions with Marciano (2026-09-24): two states now (granted, locked), the met chip is story-only; unlock paths behind the (i) since the kanto popover opens on press; dots read the ladder from a fresh install (v1 filled), non-upgradable configs show none; dashed edge on a locked chip read as an empty checklist socket; the DVTD-38e9 rung reader (price and roll odds per rung) is dropped, what v2 buys stays in the shop's Upgrades panel.

Deviations from the mock: "in your deck" becomes the existing starter/earned tags; word badges like "peek" are not built (in-poll vocabulary); redaction is the kit's ??? not blocks.

Files: src/ui/kanto-theme/DexConfigChip.ui.tsx (new), VersionPips.ui.tsx (new), DexConfigs.ui.tsx (rewrite), dexScreen.viewmodel.ts, Dex.component.tsx, dexRegistry.factory.ts, docs/adr/108, docs/wiki.md 6.4, CHANGELOG.md.

## Summary of Changes

New kanto primitives: DexConfigChip.ui.tsx (three states: granted, met, locked; one popover slot opening above the chip; exports unlockLabelOf, alternativeLabelOf, progressLabelOf, provenanceTagOf, leadLineOf, infoLabelOf) and VersionPips.ui.tsx (role img, "v1 of 5"). DexConfigs.ui.tsx renders DexWeightGroup[] as headed chip rows inside DexPanel. dexScreen.viewmodel.ts groups the roster by weight (heaviest first, granted before locked within a weight), builds each chip from givesOf, figureLabel, isUpgradable and maxLevelOf, and lost versionsOf with its odds and price imports. Dex.component.tsx holds openInfo instead of a version selection. ConfigChip.ui.tsx exports CHIP, EDGE, NAME, SKIPPED_CHIP and SKIPPED_NAME so the Dex chip shares its geometry by import. dexRegistry.factory.ts ships dexConfigGroups (a 2-weight and a 1-weight group covering every state). The DexScreen story's Configs tab pins one hint at a time.

Docs: ADR-108 written; ADR-050 D5, ADR-051 D7 and ADR-097 D4 collapsed to pointers; README row; the app.css dashed comment names the Dex reading; wiki 6.4 rewritten; CHANGELOG Changed entry. Follow-up bean DVTD-s5vo carries the reveal ledger that feeds the met state.

## Verification

DexConfigChip.spec 19/19, VersionPips.spec 5/5, DexConfigs.spec 8/8, dexScreen.viewmodel.spec and ConfigChip.spec green (155 across the five files). All three story files render under jsdom via the throwaway composeStories spec. npm run lint clean (the oxlint warnings are pre-existing elsewhere; depcruise 0 violations; docs:check in sync). npm run lint:dead reports only the pre-existing nitro note. vite build passes.

Two failures in the working tree are not from this change: tsc flags src/ui/kanto-theme/ShopScreen.spec.tsx line 162 (a shop change dirty since 12:33 today, alongside an untracked registryControl.model.ts), and runHistory.service.spec fails because a dirty runHistory.service.ts now returns deepestGate. Both belong to another session's in-flight work and were left untouched.

## Follow-up: the dots became the version tag

Marciano asked to swap the ladder dots for the kit's existing version pennant. Checking first turned up the reason the number mattered: no roster config carries a level, and chipFor passes `version: config.level`, so in the run a v1 config wears no tag at all. A Dex chip reading v1 on all 16 upgradable configs would have been identical everywhere and contrary to that habit.

He chose the ceiling. The chip now wears `Version version={maxVersion}` — v5 for most, v2 for Telemetry, git rebase -i and Dependabot, nothing for the 22 with no ladder. The rung an install gives you is named in the hint's lead line ("starter · v1 of 5"), which is now built from a FIRST_VERSION constant in the chip rather than passed in.

VersionPips.ui.tsx and its spec and stories are deleted; the `ladder: { held, max }` prop collapsed to `maxVersion?: number`, and `ladderOf` became `maxVersionOf`. The tab's footer note, ADR-108 decision 4, wiki 6.4 and the changelog entry all say tag rather than dots.

One test needed a real fixture rather than an empty ledger: Telemetry is earned, not free, so `configdex([], [])` leaves it locked and its 2-rung ceiling unreadable. The spec now grants it via a telemetry unlock row.

Verified again: DexConfigChip.spec 20/20, DexConfigs.spec 8/8, dexScreen.viewmodel.spec 41/41, ConfigChip and Version green. Both story files render under jsdom (13 stories). Lint clean, depcruise 0 violations across 716 modules, docs:check in sync, lint:dead reports only the pre-existing nitro note.
