---
# DVTD-35ya
title: The wiki folds its spoilers
status: completed
type: feature
priority: normal
created_at: 2026-10-08T13:49:03Z
updated_at: 2026-10-08T13:52:42Z
parent: DVTD-erjz
---

**What:** The wiki sections that list every gate, every swatch, every config and the whole shop sit behind a fold marked spoiler, closed until the reader opens it.

**Why:** The login screen now sends strangers to the wiki, and a new player should be able to read how a run works without seeing every gate ahead and every config before meeting it.

## Done when
- [x] The all-gates table, both swatch tracks, the config roster and the shop table open only on a press
- [x] Each fold states what it hides and wears a spoiler badge
- [x] The rest of every article reads as before

## Notes
- Asked by Marciano 2026-10-08 while reviewing the login pitch: a spoiler tag for all swatches and gates, and for configs and services.
- Section-level: a section carries an optional spoiler note; the wiki screen renders such a section as a kit Fold, closed by default, with the note as its summary and a spoiler badge. No new block kind, so the wiki sync script is untouched.
- Under the launch epic because beans forbids a feature under the in-progress wiki feature.

## Summary of Changes

- WikiSection gains an optional spoiler note; a spoiler() helper beside section(). Five sections carry one: how-to-play Every swatch (the track moved out of A day is a gate into its own folded section), gates Every gate, build-and-configs Every config, storage-and-shop The shop, progression Swatches.
- WikiScreen renders a spoiler section as a kit Fold, closed by default, with the note as summary and a saffron spoiler badge; plain sections render as before via a shared Blocks component.
- Specs: the fold is closed with its note and badge, a plain section has no fold, and the viewmodel marks exactly those five sections.
- Verified: tsc 0, wiki and kit specs green, prettier clean, lint and docs:check green. Not committed.
