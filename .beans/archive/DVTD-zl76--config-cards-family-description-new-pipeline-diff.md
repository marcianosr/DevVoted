---
# DVTD-zl76
title: Config cards (family + description), 'new' pipeline diff on draft, upgrade storage cost
status: completed
type: feature
priority: normal
created_at: 2026-07-12T16:14:29Z
updated_at: 2026-07-12T16:54:19Z
parent: DVTD-5jpw
---

Reward/draft screen polish: show each config as a card with its family tag + short description; when a config is drafted it appears as a 'new' item on the pipeline preview; upgrading a config costs storage (climbing per level).

## Summary of Changes

- New `ConfigCard.ui.tsx`: shows family tag + level-aware description + optional action button with storage cost + disabled state. Story + spec added.
- `Pipeline.ui`: optional `newConfigIds` renders a viridian 'new' badge on freshly-drafted slots.
- Domain: `SessionState.draftedThisGate` tracks ids drafted on the open reward screen (reset when the screen opens and on finish); surfaced as `SessionView.newConfigIds`.
- `upgradeCost(level) = 60 * level` in config.model (climbs: 60/120/180). `upgrade` reducer now charges storage and refuses when unaffordable.
- RewardScreen renders the pipeline diff, uses ConfigCard for draft + upgrade lists (cost shown, disabled when broke or full).
- Tests: reducer upgrade-cost + diff-flag reset; upgradeCost unit test; ConfigCard specs. 109 pass, tsc + lint clean.

## Follow-up: unified config token + tooltip

Chose 'one chip + hover tooltip' representation. Changes:
- New `src/ui/Tooltip.component.tsx` (CSS-only hover/focus reveal) + story + spec.
- `ConfigChip` is now the single config token everywhere: interactive `<button>` when `onClick` given (pointer + hover-brightness + disabled greying), static `<span>` otherwise. Family + description moved into the hover tooltip (dropped the native `title`).
- Deleted module `ConfigRow.*` and `ConfigCard.*` (the `src/ui/economy` + `src/domains/economy` ConfigCards are the old app's, untouched).
- ConfiguringScreen bench, RewardScreen draft/upgrade, StripScreen, Pipeline all render ConfigChip consistently. Upgrade cost shown in the chip action (→ Ln · NKB), disabled when unaffordable.
- 225 tests pass, tsc + lint clean.
