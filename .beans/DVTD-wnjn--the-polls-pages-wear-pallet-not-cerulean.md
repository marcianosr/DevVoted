---
# DVTD-wnjn
title: The polls pages wear pallet, not cerulean
status: completed
type: task
priority: normal
created_at: 2026-10-08T12:35:35Z
updated_at: 2026-10-08T12:36:56Z
---

**What:** The poll list, the poll page and the edit form wear pallet, the same white the suggest form already wears, instead of cerulean.

**Why:** Cerulean is a gate's colour; the authoring pages are not a gate, and the suggest form already stood apart in pallet, so the four pages disagreed with each other.

## Done when

- [x] The poll list, poll page, edit page and edit form all wear pallet
- [x] Specs and the changelog state it

## Notes

Asked by Marciano with screenshots of /polls and /polls/289 on 2026-10-08.

## Summary of Changes

- `THEME` is `pallet` in `PollList.ui.tsx`, `PollDetail.ui.tsx` and `PollEdit.ui.tsx`; `PollForm.ui.tsx` collapses its per-mode map to one `pallet` constant.
- `PollForm.spec.tsx` asserts pallet for both modes; changelog Changed entry added.
- 20 polls spec files / 290 tests pass, lint and tsc clean.
