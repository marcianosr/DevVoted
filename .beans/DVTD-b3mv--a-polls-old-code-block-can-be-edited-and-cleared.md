---
# DVTD-b3mv
title: A poll's old code block can be edited and cleared
status: completed
type: bug
priority: normal
created_at: 2026-10-09T11:53:17Z
updated_at: 2026-10-09T11:56:33Z
---

**What:** The edit page shows a poll's old separate code block, when it has one, so an admin can edit or clear it, and that block is highlighted as JavaScript.

**Why:** A poll that carries its code in the question and in the old block shows the code twice, the second one coloured wrong, and the form offered no way to remove it.

## Done when
- [x] Editing a poll that has an old code block shows it in an editable field
- [x] Clearing that field and saving removes the block from the poll
- [x] A poll without an old block shows no extra field, and a new poll never gets one
- [x] The old block reads highlighted as JavaScript on the poll screen and in the preview

## Notes
Amends ADR-137 decision 3: the code_block column stays legacy, the form shows it only when the loaded poll has one. highlight.js auto-detect picked css for a JS array-of-arrays snippet, hence the forced js language.

## Summary of Changes

Form state carries the poll's code block only when the poll has one; the edit page shows it as a legacy code block field, the preview renders it, and a cleared field saves null. The question's legacy block renders with the javascript language. ADR-137, the wiki and the changelog are updated.
