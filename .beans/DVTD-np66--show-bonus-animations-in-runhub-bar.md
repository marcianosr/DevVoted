---
# DVTD-np66
title: Show coverage and storage gains landing in the run bar
status: todo
type: feature
priority: normal
tags:
    - ui
    - juice
created_at: 2026-07-19T10:48:49Z
updated_at: 2026-09-26T14:06:31Z
parent: DVTD-cb52
---

**What:** Animate coverage and storage gains on the run bar as they happen.

**Why:** A gain arrives as a changed number, with nothing to say where it came from.

## Done when
- [ ] A coverage gain shows as a brief plus figure on the bar
- [x] A storage gain does the same
- [ ] Several gains at once queue instead of overlapping

## Notes

Display quick animations when bonuses are added: show '+% coverage' in the RunHub bar when answering polls, and '+storage' notifications when storage is added (from configs, gate clears, category juice, etc). Make bonus gains visually clear and satisfying.

Storage half done in DVTD-oafa: the header balance counts to its new reading and a signed pill names the change. The coverage half and the queueing of several gains at once are still open — the queue has to be shared between the bar and the balance, so neither owns it.
