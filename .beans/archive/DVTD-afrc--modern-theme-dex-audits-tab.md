---
# DVTD-afrc
title: 'Modern-theme Dex: Audits tab'
status: completed
type: task
priority: normal
created_at: 2026-08-23T18:17:51Z
updated_at: 2026-08-23T18:22:30Z
---

Audits panel for the modern-theme Dex (image #111), Storybook only.

Three tiers per DVTD-gkln's sibling decision: faced (bright + celadon 'faced'), unlocked (dim, named + described), unseen (??? row, nothing else). Gates tab stays open - it is route planning; the Audits tab withholds the rule, not the name.

- [x] Glyph.ui.tsx: 11 audit paths
- [x] screens/AuditsPanel.ui.tsx + spec + stories
- [x] Wire the Audits tab into DexScreen.stories
- [x] Verify: tsc, stories typecheck, lint, tests, CSS build

## Summary of Changes

Audits tab for the modern-theme Dex, Storybook only.

- **`Glyph.ui.tsx`**: `GlyphName` grew from 4 to 15 with one 14x14 stroke path per audit (`overrun`, `outage`, `readonly`, `freeze`, `mirror`, `timeout`, `flake`, `leak`, `rolling`, `breaking`, `strip`). Named for the audit, not the shape, matching how the four shop glyphs are named for what pressing them does. Story is a labelled sheet so they can be eyeballed side by side.
- **`screens/AuditsPanel.ui.tsx`**: blurb, then one row per audit on a `grid-cols-[1.25rem_1fr]` so the rule always starts under the name whatever the icon is. Three tiers: faced (full strength, saffron glyph, celadon `faced`), unlocked (`opacity-50`, still named and described), unseen (`???` for both lines, `Mark variant="blank"` in the icon slot).
- **The redaction lives in the type**, not in the rendering: `DexAudit` is a discriminated union whose `unseen` arm has no `name`, `glyph`, `gates` or `rule` to hand over. A caller physically cannot pass a name for an unseen audit and rely on the panel to hide it, so nothing leaks into the markup. Same shape `SwatchTrackItem` uses for the colour you have not earned.
- **`auditsSeen(faced, unlocked)`** in the stories derives all 11 rows from two counts, so no story can show a rule for an audit it also calls unseen.
- Wired into `DexScreen.stories` as a third `Audits` story; the tab count is `2/11` per the mock.

Copy for the six rows the mock draws is Marciano's verbatim; the other five are rewritten from `audit.model.ts` descriptions in the same voice.

The Gates tab is deliberately left naming every audit on every locked gate: the ladder is route-planning information, and the Audits tab withholds the rule rather than the name.

**Verification:** tsc 0; stories typecheck 0 in modern-theme; lint clean (746 modules, 2859 deps); 2093 passing / 7 failed, all 7 the known pre-existing reds (5 RewardScreen copy edits, 2 skin/Crumb). CSS hash `app-PGh6ROmn` to `app-CkHSNHvp`, so Storybook needs a restart.

## Deferred
An audits counter, if this is ever wired, must dedupe on `name` not `id`: Timeout emits `timeout-3/4/5` and Strip emits `strip-1/2`, so counting ids gives 14 rather than 11. There is also no account-level record of which audits a player has faced.
