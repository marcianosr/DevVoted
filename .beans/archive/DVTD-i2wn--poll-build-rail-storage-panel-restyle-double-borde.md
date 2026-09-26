---
# DVTD-i2wn
title: 'Poll build rail: storage-panel restyle (double border, corner dots, dimmed skips)'
status: completed
type: task
priority: normal
created_at: 2026-08-31T11:08:42Z
updated_at: 2026-08-31T11:34:26Z
---

Restyle BuildTrack.ui to the storage-panel mock: outer panel border + inner rail border (double border), header tally 'N of M slots · K running', skipped configs dimmed (opacity + cursor-not-allowed) at full height, per-config corner dot (vermillion when running, gray when skipped, cinnabar offline). Add vermillion tone to Dot.ui.

- [x] Dot.ui: vermillion tone
- [x] BuildTrack.ui: panel + inner border, tally, dimmed skips, corner dots
- [x] Specs updated/added
- [x] CHANGELOG entry
- [x] lint + typecheck + tests

## Summary of Changes

- BuildTrack.ui.tsx: outer bordered panel + inner bordered rail (double border), header tally "N of M slots · K running" (running count retired when settled), skipped cells get opacity-40 + cursor-not-allowed at unchanged full height, corner Dot per config (vermillion=online, muted=skipped, cinnabar=offline). Kept title "Build" — "storage" already names the KB balance on the same screen.
- Dot.ui.tsx: added vermillion tone (fill + ring); EveryStatus story extended.
- BuildTrack.spec.tsx: 6 new tests (tally, settled tally, double border, dimmed skip, dot tones); 30 pass.
- CHANGELOG: player-facing entry under Unreleased.
- Verified: lint ✔ (0 violations), build/typecheck ✔, tests 2621 passed / 3 pre-existing RewardScreen.spec failures unrelated to this change (stale copy expectations vs c421b3cb).

## Iteration (same day)

Marciano's live pass: running dot vermillion → saffron (yellow), outer panel border removed (rail border is the only frame now), header tally echoes the saffron dot after "x running" (hidden when settled). Dot.ui vermillion tone reverted — saffron already existed, nothing else used it. Specs: 31 pass; lint ✔; build/typecheck ✔.
