---
# DVTD-sy0k
title: 'Terminal-theme Dex: family colours, versions, config detail'
status: completed
type: task
priority: normal
created_at: 2026-09-01T16:15:03Z
updated_at: 2026-09-01T16:40:05Z
---

Rebuild the terminal-theme Dex screen to match the new mock.

Adds over the current DexScreen:
- a family legend (focus/amplify/defense/economy/risk) under the tabs
- a family-coloured dot on every config chip, dim when unseen
- a version reading on each chip (v4/5), redacted with the name when unseen
- one width-scaled slot bar per group instead of N repeated bars
- a config detail block: family bar + name, first-seen/install figures,
  the effect sentence, and a v1..vN ownership ladder

- [x] FamilyDot.ui.tsx + story
- [x] Slots.ui.tsx: solid single bar, family optional
- [x] DexChip.ui.tsx: family dot, version, selected, redaction owned by the chip
- [x] VersionTrack.ui.tsx + story
- [x] Figures.ui.tsx: a multiplier below 1 reads cinnabar
- [x] DexScreen.ui.tsx rebuilt (shell + five panels)
- [x] DexScreen.stories.tsx with selection state
- [x] lint + typecheck + tests

## Summary of Changes

Scope grew mid-session from the Configs tab to all five Dex tabs, plus a round of shop feedback.

**New in src/ui/terminal-theme/**: FamilyDot, VersionFigure, VersionTrack, Redacted, format.ts (+ stories).

**Widened**: Slots (solid single bar, optional family), DexChip (family dot, version reading, selected, owns its own redaction via a union), Tabs (pill variant for the sub-view switchers), Swatch (card size, finish), Figures (a multiplier under 1 reads cinnabar), families.ts (FAMILY_SOLID, FAMILY_ORDER, risk/amplify colours swapped).

**New panels in screens/**: ConfigsPanel (by slot / most installed / unseen + detail block), PollsPanel, AuditsPanel, GatesPanel, SwatchesPanel. DexScreen is now a shell.

Story data is derived from the real roster (CONFIG_LIST, ALL_SWATCHES, CATEGORY_CODES, coverageDemandFor) rather than the mock placeholders, so every count agrees with the domain: 22/30 configs, 118/423 polls, 7/15 audits, 8/13 gates and swatches.

**Shop feedback**: slot marks moved beside the config name on five screens, Section meta to xs, cursor-not-allowed on dimmed rows, a rule above Storage plan, Row gaps tightened (gap-y-0.5, py-1), and the shop remove action relabelled Sell so its hint reads "Sell for 16 KB".
