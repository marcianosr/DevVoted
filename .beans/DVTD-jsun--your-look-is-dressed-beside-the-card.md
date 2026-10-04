---
# DVTD-jsun
title: The profile card is the preview and the save bar floats
status: completed
type: feature
priority: normal
created_at: 2026-10-04T12:51:03Z
updated_at: 2026-10-04T13:17:13Z
---

**What:** The hero at the top of your page previews an unsaved look, and a floating bar on every tab saves or discards it.

**Why:** Every pick changed a card that had scrolled out of sight, and a draft could only be saved, never discarded.

## Done when
- [x] The hero rings and says preview while the look is unsaved
- [x] Swatch, titles and border are picked in one panel, swatch first
- [x] An unsaved look can be discarded in one press
- [x] The save bar floats on every tab only while the look is unsaved

## Notes
Plan: ~/.claude-work/plans/i-want-to-redesign-happy-seahorse.md §1. useLookDraft gains discard. Amends ADR-142/144.

## Summary of Changes

First built as a dressing room (sticky card beside pickers), then rebuilt to Marciano's mock: hero preview ring + label (previewLabelFor), LookSaveBar fixed at the bottom via ProfileScreen footer, Appearance one panel, own-hero trophies removed, edit-profile press removed. ADR-186.
