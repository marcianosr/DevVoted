---
# DVTD-137y
title: The panel's fold-all press is a mark, not a word
status: completed
type: task
priority: normal
created_at: 2026-09-26T14:14:57Z
updated_at: 2026-09-26T14:32:06Z
---

**What:** The panel header's "expand all" / "collapse all" press draws a two-way chevron mark instead of its words.

**Why:** A word-wide press crowds a header that already carries the panel's meta, and the per-card chevrons already say what folding looks like.

## Done when

- [x] The press in a panel header is a square glyph button carrying a two-way chevron
- [x] The press still states the move it makes to anyone reading its name rather than its shape
- [x] The kit has one icon for the two-way fold, listed on the icon sheet

## Notes

Mirrors the per-card fold in ConfigChip, which is already a glyph button.

## Summary of Changes

The panel fold is a square mark carrying two chevrons, one up and one down. It
keeps the words as its accessible name, so it still states the move it is about
to make and every existing query for it holds.

- New kit icon `fold`, drawn rather than typed for the same reason the card
  chevron is, and listed on the icon sheet story.
- One test-helper fix fell out of it: a spec matching a whole sentence by text
  content found two elements once the press beside the sentence had no words of
  its own. It now takes the innermost match.
