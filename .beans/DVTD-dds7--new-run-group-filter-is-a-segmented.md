---
# DVTD-dds7
title: New run group filter is a Segmented
status: completed
type: task
created_at: 2026-09-29T10:47:48Z
updated_at: 2026-09-29T10:47:48Z
---

**What:** The new run screen filters its dealt hand with the kit's one-of-N filter, led by All.

**Why:** The old help row was pressed toggles with a prompt and a hide press, unlike every other filter in the kit.

## Done when

- [x] The filter leads with All, counting the whole deal
- [x] Picking All restores every group
- [x] The prompt and hide press are gone

## Notes

RegistryHelp.ui deleted; NewRunScreen takes `filter` drawn with `Segmented look="loose"`; ADR-127 D4 reworded.

## Summary of Changes

newRunHelpFor became newRunFilterFor; StartView lost its helpHidden state; specs, stories, factory, ADR-127 and CHANGELOG updated.
