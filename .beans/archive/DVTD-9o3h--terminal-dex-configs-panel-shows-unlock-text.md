---
# DVTD-9o3h
title: Terminal Dex Configs panel shows unlock text
status: completed
type: task
priority: normal
created_at: 2026-09-07T12:21:16Z
updated_at: 2026-09-07T12:28:24Z
blocking:
    - DVTD-e15y
---

The terminal-theme Configs panel (src/ui/terminal-theme/screens/ConfigsPanel.ui.tsx) models configs on the seen/unseen axis only. The unlock axis lives in the modern-theme ConfigdexPanel: provenance ("Earned: answered 525 polls" / "Starter config") for granted configs and the two objective paths for locked ones.

Carry that text into the terminal panel, then drop the old variant from the Storybook sidebar. ConfigdexPanel.ui stays: it is the only thing rendering the live /dex Configs tab, and the terminal panel runs on installs/best/firstSeenGate figures that have no table behind them.

- [x] DexConfig carries an unlock state: unlocked (with provenance) or locked (thematic + fallback captions)
- [x] Unseen entries render their unlock text; seen entries show provenance in the detail block
- [x] Story data derives the unlock state from CONFIG_UNLOCKS, self-consistent against one account's progress
- [x] Delete ConfigdexPanel.stories.tsx
- [x] lint, typecheck, tests

## Summary of Changes

`ConfigsPanel.ui.tsx`: `DexConfig` gained `unlock: UnlockedState | LockedState`, with `SeenConfig` narrowed to the unlocked state (seen implies unlocked). `UnlockPathCaption` comes in type-only, which `ui-stays-presentational` allows. New `PathLine` and `UnseenRow`; `Group` splits into a chip row for dealt configs and a row list for undealt ones, so `Entry` narrowed to `SeenConfig` and lost its redaction branch. `Detail` closes with the provenance line.

`ConfigsPanel.stories.tsx`: unlock state derives from `CONFIG_UNLOCKS` via `provenanceOf`/`thematicCaptionFor`/`fallbackCaptionFor`, against one account at 412 answered polls. `viaFallback` marks the four configs whose thematic objective this account never met, so both provenance flavours show. `rb` and `prefetch` are earned-but-never-dealt because their fallbacks (275/300) sit under 412; modelling them as locked would contradict the page's own numbers.

`ConfigsPanel.spec.tsx`: new, 5 tests over both provenance cases, both unlock paths, the redaction count, and the unseen view.

Deleted `ConfigdexPanel.stories.tsx`. `ConfigdexPanel.ui.tsx` stays: it is the only panel that can render live /dex, and it is now knowingly the one Tier-1 file without a Story until DVTD-e15y lands.

Verified: `npm run lint` clean (963 modules), `tsc` 0 errors both with and without the stories exclusion, 3806 tests with 3 failures pre-existing at HEAD in `modern-theme/screens/RewardScreen.spec.tsx` (confirmed in a HEAD worktree).
