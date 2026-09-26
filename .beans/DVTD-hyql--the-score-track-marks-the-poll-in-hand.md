---
# DVTD-hyql
title: The score track marks the poll in hand
status: completed
type: feature
created_at: 2026-09-26T14:32:31Z
updated_at: 2026-09-26T14:32:31Z
---

**What:** The first unanswered slot on the gate being played is drawn as a lit dashed well.

**Why:** The track showed what a gate had banked and what was still to come, but nothing said which of the empty slots the player is answering now.

## Done when

- [x] The slot being answered is marked on the gate in hand
- [x] A gate the run has climbed past marks nothing, however many slots it left empty
- [x] The mark is the one the kit already uses for where you are standing

## Summary of Changes

The track counts the current slot itself rather than taking it as a prop: a row
that reported its own position could disagree with the slots beside it and
point at a poll already paid. The mark is the swatch's `current` well — a
dashed edge in the gate's colour — so the score track and the gate track say
"you are here" the same way.

The dashed box's border width and colour moved out of the shared class, since
two utilities setting one property resolve by Tailwind's emit order rather than
by the class list.

Verified: 4007 tests pass, typecheck clean, lint and architecture boundaries clean.
