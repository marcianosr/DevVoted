---
# DVTD-5ytu
title: 'Two parallel reskin folders: skin/ and modern-theme/'
status: todo
type: task
priority: high
created_at: 2026-08-22T08:50:58Z
updated_at: 2026-08-22T08:50:58Z
---

`src/ui/skin/` (23 .ui.tsx, Storybook group Skin/*) and `src/ui/modern-theme/` (19 .ui.tsx, group Modern/*) are two independent reskins of the same surfaces, built in parallel sessions on 2026-08-21/22. DVTD-vg2q's summary states `skin/` was reference only.

Both cover Row, Entry, Choice, Code, Coverage, Dot, GateHeader, Mark, Swatch, Trail, tones and a poll screen. Marciano is reviewing Modern/* in Storybook; feedback from 2026-08-22 (chip borders, title underline, rail width, config folds) was applied to modern-theme.

Decide which survives and delete the other, before a third surface gets built twice. Nothing is wired into a route yet, so the cost is only the folder.

- [ ] Pick the surviving folder
- [ ] Port anything the loser has that the winner lacks (skin has Definitions/dl, Popover, SwatchTrack, Streak, Tabs, Stake; modern-theme has Legend, Meter, Delta, Question, Text, rarity)
- [ ] Delete the other folder and its stories
- [ ] Note the decision in an ADR if the theme is going to ship
