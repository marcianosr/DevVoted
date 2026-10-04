---
# DVTD-qsst
title: A new run config is installed with a press, not ticked
status: completed
type: feature
priority: normal
created_at: 2026-10-04T17:10:16Z
updated_at: 2026-10-04T17:13:32Z
---

**What:** Each config on the new run screen carries an Install press in its head, reading Installed once picked, visible while the card is folded.

**Why:** A bare checkbox did not say what picking a config does, so the screen was hard to understand.

## Done when
- [x] A folded config card shows Install
- [x] A picked config reads Installed
- [x] A config that does not fit refuses the press

## Summary of Changes

The hand already used ConfigChip install (Install / Installed, disabled when it does not fit) but kept it in the inert fold. ConfigChip gained an opt-in installWhenFolded that seats the press in the folded head; handCardFor turns it on. The build note reads Install configs up to N weight units. The shop is untouched.
