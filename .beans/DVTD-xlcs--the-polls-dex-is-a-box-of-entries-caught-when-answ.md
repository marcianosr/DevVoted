---
# DVTD-xlcs
title: The polls Dex is a box of entries, caught when answered right
status: completed
type: feature
priority: normal
created_at: 2026-10-04T12:51:04Z
updated_at: 2026-10-04T13:17:13Z
---

**What:** The polls Dex lists what you have seen beside its entry, with a strip of categories on top and a numbered box of every poll marked unseen, seen or caught.

**Why:** A long list read like a log, not a collection; a Pokédex box shows at a glance what you have caught and what is left.

## Done when
- [x] A poll answered right at least once reads as caught
- [x] A poll dealt but never answered right reads as seen
- [x] Each category in the strip shows how much of it is seen
- [x] Picking a row or a tile opens its entry

## Notes
Plan §2. entryStateOf in polldex.model; DexPollBox.ui; Segmented meter. Amends ADR-151 for polls.

## Summary of Changes

entryStateOf in polldex.model; dexPollsFor returns rows (seen only), grid (all in filter) and seen-counting filters with meters; Segmented gained a strip look; DexPolls.ui rebuilt to the mock. ADR-187.
