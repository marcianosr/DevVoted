---
# DVTD-7hvj
title: A worn title and an archive figure both wear a badge
status: completed
type: task
priority: normal
created_at: 2026-09-28T12:02:52Z
updated_at: 2026-09-28T12:11:55Z
---

**What:** The account menu and the Dex heading state the archive figure and the worn titles as plain text; both become badges.

**Why:** Every figure in the kit wears a badge, and a worn title is a mark, not prose. The two surfaces that state them read as flat text today.

## Done when

- [x] The Dex heading states the archive figure in a badge
- [x] The account menu states the archive figure in a badge
- [x] The account menu wears every equipped title as a badge, not only the first
- [x] One component draws worn titles for both the card and the menu

## Summary of Changes

`WornTitles.ui.tsx` is new: a row of `Badge`s, one per worn title, with a dashed empty slot when none is worn. `ProfileCard` lost its own copy of that row; `AppNav` gained it, and its `NavViewer` now takes `titles` rather than a single `title`, fed by `wornTitleNames`.

The archive figure goes through `Figures` on both surfaces. `Figures` did not parse a bare-byte figure, so `0 B archived` stayed flat while `256 KB archived` would have badged: its unit pattern is now `[KMG]?B\\b|%`, which also picks up `GB`, and the word boundary keeps it off a word that merely starts with B.
