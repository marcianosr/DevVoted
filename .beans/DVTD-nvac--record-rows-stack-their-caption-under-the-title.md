---
# DVTD-nvac
title: Record rows stack their caption under the title
status: completed
type: task
priority: normal
created_at: 2026-10-08T12:03:18Z
updated_at: 2026-10-08T12:08:25Z
---

**What:** On the community board, a turnout or record row's small caption sits under its title instead of beside it, and the most-audits record says its count spans the whole run.

**Why:** Beside the title the caption read as part of it, and "in one run" under a heading called Today's records read as a contradiction.

## Done when

- [x] Every turnout and record row draws its caption on its own line under the title
- [x] The most-audits row says "across the whole run"

## Summary of Changes

`ROW_LABEL` in `CommunityScreen.ui.tsx` is a column; `RECORD_ROWS["most-audits"].caption` and the story fixture reworded; wiki §7 names the scope; CHANGELOG Unreleased.

- Same session: record titles start with a capital (Biggest build, Lightest build, Comeback, Most audits, Most installed, Most expensive build).

- Same session: **answered today** is a plain subtitle (no badge, no colour on the band); **Most installed** draws the config as a compact `ConfigChip` — the top-config record carries `configSlots` so the chip has its weight.
