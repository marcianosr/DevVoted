---
# DVTD-bs7d
title: 'Terminal theme feedback: xs descriptions, caret, prep list polish, themed CTA'
status: completed
type: task
priority: normal
created_at: 2026-09-01T08:27:59Z
updated_at: 2026-09-01T08:30:45Z
---

Design feedback round on the terminal-theme screens: Row detail text to text-xs everywhere the Build list appears; Section caret glyph looks off when expanded; Prep list items from Required down start with a capital; swatch label sits next to the pending swatch; primary CTA wears the current gate swatch accent (border + bg); remove 'poll 2 of 5' trail label on the poll screen.

## Summary of Changes

- Row.ui: detail text now size=caption (text-xs) — hits every Build list (prep, poll, new run, shop) plus all other Row descriptions, per feedback.
- Section.ui: caret glyph swapped ⌄→› with rotate-90 when open; rotation keeps it centered so the expanded state no longer floats low.
- PrepScreen.ui: list items from Required down capitalized (Coverage, Gate cleared, Swatch, Gate missed); coverage hint text-xs; swatch label moved out of the detail column into trailing, right next to the pending swatch.
- PrepScreen.stories: 'answer all 5 polls' → 'Answer all 5 polls'.
- Button.ui: primary variant now wears the gate swatch accent — border-theme-soft + bg-theme-soft, hover bg-theme-strong (new border-theme-soft utility in app.css, 0.5 alpha, matching the faint/soft/strong ladder). Unthemed panels fall back to the root cerulean.
- Trail.ui: label optional; PollScreen story no longer passes 'poll 2 of 5'.

Verified: lint + depcruise clean, tsc clean, story typecheck 0 terminal-theme errors (24 pre-existing elsewhere), vitest 2622 passed / 3 pre-existing modern-theme RewardScreen failures. Not committed.
