---
# DVTD-j46o
title: 'Run UI polish: category swatches in answer review, prismatic upgrade ring, bench affordances'
status: completed
type: task
created_at: 2026-08-04T16:12:13Z
updated_at: 2026-08-04T16:12:13Z
---

Batch of run-UI polish from live playtesting feedback.

## Summary of Changes
- AnswerResults: each reporter row is themed by its poll's category (categoryTheme on the details element) with a small Swatch in the StatusLine leading slot; expanded choices indent pl-23 so the glyph column starts exactly under the question, and all answer/explanation text dropped to size xs.
- ShopScreen: the Upgrade button lost its "% cov" price — the requirement lives in the hover tooltip, which now names the category in its own Kanto color (themed span). When the coverage requirement is met, the enabled Upgrade button wears the static legendary-ring (prismatic Kanto gradient).
- ConfiguringScreen: bench chips stay buttons when the pipeline is full — disabled (dimmed, cursor-not-allowed) instead of silently rendering as inert spans with a default cursor.
- Swatch got a hardcoded data-testid="swatch"; AnswerResults rows carry data-testid="answer-row" (spec queries via testid instead of querySelectorAll).
- Boy-scout spec repairs: ShopScreen spec's stale /buy/ /sell/ /upgrade/ queries updated to Install/Deinstall/Upgrade; ConfiguringScreen spec's stale "Available configs" heading updated to "Starter configs".
- CHANGELOG Unreleased updated (new bullets + stale buy/upgrade phrasing fixed).

Verified end-to-end on /proto-run: swatch colors per category, tooltip category coloring (JavaScript in saffron), prismatic ring appears once coverage >= 5%, full-pipeline chips dim with not-allowed cursor. 1017 tests pass, lint + tsc clean.
