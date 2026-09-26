---
# DVTD-sdt4
title: A new run build chip is rebuilt beside its producer
status: todo
type: task
priority: low
created_at: 2026-09-26T17:06:44Z
updated_at: 2026-09-26T17:06:44Z
---

**What:** Have the new run build fixture call the producer instead of rebuilding a chip beside it.

**Why:** A fixture that builds its own version of a card draws a screen the game does not have, and it already does: it adds a badge the live build never shows.

## Done when

- [ ] The fixture asks the producer for its cards
- [ ] A story of the new run build shows what the screen shows

## Notes

Same drift the hand cards had before DVTD-458u, where the fix was to delegate.
Found while making the new run screen stop quoting a refund (DVTD-ptum).
