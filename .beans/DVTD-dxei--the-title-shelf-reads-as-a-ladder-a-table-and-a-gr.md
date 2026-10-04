---
# DVTD-dxei
title: The title shelf reads as a ladder, a table and a grid
status: completed
type: feature
priority: normal
created_at: 2026-09-29T09:18:43Z
updated_at: 2026-09-29T09:27:46Z
---

**What:** The titles tab shows three worn slots, a poll-count ladder, a category table of answered and correct titles, and a grid of special titles, with an all, earned or closest filter.

**Why:** A flat list of forty-odd rows hid which titles are near and what is already worn.

## Done when

- [x] The three worn slots lead the tab and each can be taken off in place
- [x] Poll-count rungs sit on a ladder that names the next threshold and how far off it is
- [x] Each category shows its answered and correct title side by side with progress
- [x] A special title keeps its name hidden until earned but states how to earn it
- [x] The closest filter lists the five unearned titles nearest to done

## Notes

Built from a user-supplied mock. Ladder is log-scaled (rungs crowd at the top on a linear scale). Earned rungs are worn from a chip row under the ladder.

## Summary of Changes

getTitleState now returns every objective count. New titleShelf.viewmodel builds slots, a log-scaled ladder, a category table (8 shown, rest behind a toggle), special cards and the closest list. Group other is renamed special and unearned special titles are redacted with their condition stated. TitleShelf.ui rewritten, story and spec added. ADR-143, wiki 6.6 and CHANGELOG updated. The earned filter keeps a category row whole when either of its titles is earned.
