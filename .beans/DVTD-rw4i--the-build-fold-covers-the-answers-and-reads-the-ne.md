---
# DVTD-rw4i
title: The Build fold covers the answers and reads the next poll
status: todo
type: bug
created_at: 2026-10-01T14:53:22Z
updated_at: 2026-10-01T14:53:22Z
parent: DVTD-lk20
---

**What:** On a phone, opening the Build fold on the poll screen lays it over the answer options; after you answer, each config already reads the next poll while the answered one is still on screen.

**Why:** The fold exists to explain what paid this answer, and it currently hides the answer and explains a different poll.

## Done when
- [ ] At phone width the open Build fold pushes content down instead of covering the options
- [ ] While an answered poll is on screen, each config's reading describes that poll
- [ ] The reading switches to the next poll only when it is shown

## Notes
Seen at 390×844 on Pallet poll 4: the fold covered the options and the miss feedback.
Seen after answering the TypeScript poll (poll 2): ".css ×1.25 here" and "2 applies", while the poll paid 1.1 (no ×1.25); the next poll was CSS.
Wiki §2.5: a config reads "×1.25 here" while it is paying on the poll in hand.
