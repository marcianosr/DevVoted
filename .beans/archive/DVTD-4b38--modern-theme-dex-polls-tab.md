---
# DVTD-4b38
title: 'Modern-theme Dex: Polls tab'
status: completed
type: task
priority: normal
created_at: 2026-08-23T18:26:02Z
updated_at: 2026-08-23T18:29:30Z
---

Polls panel for the modern-theme Dex (image #112), Storybook only.

- [x] Filter.ui.tsx: pill group + matching select (new primitive)
- [x] screens/PollsPanel.ui.tsx + spec + stories
- [x] Wire the Polls tab into DexScreen.stories
- [x] Verify: tsc, stories typecheck, lint, tests, CSS build

Real <table>, not a grid: this panel has column headers, unlike Gates/Audits. Unseen polls hide behind a 'show as ???' toggle in the footer rather than listing 395 rows.

## Summary of Changes

Polls tab for the modern-theme Dex, Storybook only.

- **`Filter.ui.tsx`** NEW: `Filter` (pill group, `role="group"` + `aria-pressed`, counts rendered as `label · count`) and `FilterSelect` (a native `<select>` in matching pill dress). `aria-pressed` rather than radio semantics, because correct radios would owe the reader arrow-key navigation and these are exclusive buttons, not a radio group. The select stays native so the platform supplies the popup, the keyboard and the mobile wheel.
- **`screens/PollsPanel.ui.tsx`**: filter bar, a real `<table>`, and a footer band that offers to reveal what it is withholding.
- **A real `<table>`, unlike Gates and Audits.** This panel has column headers and aligned data, so `<th scope="col">` lets a reader hear "Category: typescript" per cell; the other two are lists of mixed content with no header row. `table-fixed` because `truncate` on the question cell needs a resolved column width.
- **Same redaction as the Audits tab**: `DexPoll` is a discriminated union whose unseen arm has no `question`, `category`, `timesSeen` or `accuracy`. The dex number stays, since that is the row's address, not its content.
- Accuracy uses the game's own thresholds (>=70 / >=40, from `polldexColumns.ui.tsx`) in this kit's tones; a poll served but never answered dashes rather than reading 0%.
- `unmet` is one object (count + shown + onToggle), so a count can never arrive without the control that reveals what it counts.

**Fixed a latent bug in the two earlier panels too:** `GatesPanel.stories` and `AuditsPanel.stories` export `gatesClearedTo` / `auditsSeen` as helpers, and Storybook reads every named export as a story, so both would have rendered as broken entries. All three story files now carry `excludeStories`.

**Verification:** tsc 0; stories typecheck 0 in modern-theme; lint clean (752 modules, 2881 deps); 2106 passing / 7 failed, all 7 the known pre-existing reds (5 RewardScreen copy edits, 2 skin/Crumb). CSS hash `app-CkHSNHvp` to `app-BpCMWjC2`, so Storybook needs a restart.

## Deferred
The live Polldex sorts by column (TanStack Table). This panel does not: the mock draws no sort affordance, and `useReactTable` is a hook, which ADR-010 keeps out of a `.ui`. If the reskin ever replaces the live screen, sort has to come back as `sort` + `onSort` props with the state in Tier 2.
