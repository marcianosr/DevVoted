---
# DVTD-tupk
title: 'Playtest batch: shop transparency + poll-panel legibility'
status: completed
type: feature
priority: normal
created_at: 2026-09-03T12:48:41Z
updated_at: 2026-09-03T13:21:40Z
---

Playtest feedback batch 2026-09-03 on the terminal-theme run screens (/proto-run). Plan: ~/.claude-work/plans/i-think-deal-5-zazzy-koala.md

Locked decisions: offer upgrades are owned-config-only (~1-in-8 seeded); A/B Test switch scores the current poll (immediate); mini cap bar on every balance readout.

## Todos

### A. Poll screen
- [x] A1 header "2" becomes "2 running" + green dot
- [x] A2 ".length" named as the source of "this gate holds N correct answers"
- [x] A3 A/B Test switches mid-poll, immediate effect
- [x] A4 build rows fold open to read descriptions, folded at start
- [x] A5 name the offline config (424 Failed Dependency)
- [x] A6 category chip uses the gate theme colour, not lavender

### B. Shop
- [x] B1 upgrade preview chips + level-aware descriptions
- [x] B2 disabled Upgrade explains itself (the .java coverage gate)
- [x] B3 version chips on offers + rare owned-config upgrade offers
- [x] B4 buy/cash slot lines side by side
- [x] B5 mini cap bar on every balance readout
- [x] B6 KB to MB formatting everywhere

### C/D
- [x] C gate clear shows the balance you came from
- [x] D storage plan hover explanations

### Docs
- [x] ADR-053 (offer upgrades + A/B mid-poll)
- [x] wiki + CHANGELOG
- [x] complete DVTD-dpnx (DVTD-fnuc left open on purpose: it carries its own viridian-to-celadon tone sweep, not a half job for this batch)

## Summary of Changes

All 14 playtest items shipped; ADR-053 records the two rule changes (owned-config upgrade offers, A/B arms switch mid-poll and score the current poll).

**Poll screen**: Section header reads "● N running" and the Legend drops its duplicate `on` entry; the answer-count fact credits `.length` via a new `correctCountSource` on RunView; `switch-arm` accepted while `answering`; `RunningRow` is a `<details>` fold (caret trailing so dot-first alignment survives) carrying `describeConfig(config)` and the arm-swap press; the offline figure shortened to "offline" so the config name stops truncating, with the audit banner naming the casualty; category chip uses the new `Badge` `theme` tone. Same treatment applied to RevealScreen, which shares the sidebar.

**Shop**: `upgradePreview` chips + v-next sentence on arm; `reason` on the upgrade press so a disabled one names its requirement; `describeConfig` everywhere a row described itself; version chips on offers; `rollDraft` swaps one offer for `levelUp(pick)` ~1 in 8 (owned + upgradable only, never a locked slot, skipped under WTFPL); `draftUpgrade` in shopAction swaps the installed config at shelf price with no coverage gate; slot lines gridded side by side.

**Storage**: `kbLabel`/`signedKbLabel` moved to `~/shared/lib/storage` and the seven Tier-2 copies deleted (the "1024 KB" vs "1 MB" bug); `gauge` on Header + RunHeader and `gauge`/`from` on LedgerRow; `storageBeforeClearKb` recorded on RunState (not derived — the cap clamps); Tooltip now wraps (`w-max max-w-64`) and covers every storage-plan section.

**Verification**: lint clean (oxlint + depcruise, 900 modules), build exit 0, 2640 tests pass. 8 failures are outside this work: 3 pre-existing in `modern-theme/RewardScreen.spec.tsx`, and 5 in `hand.model.spec.ts` from the working tree's `HAND_SIZE = 1000` playtest hack.

**Left open**: DVTD-fnuc (version badges) carries its own tone sweep and was not half-done here. `UPGRADE_OFFER_ONE_IN` is a flat 1-in-8 to tune.
