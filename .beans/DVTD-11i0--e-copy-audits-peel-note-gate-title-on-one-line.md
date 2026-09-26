---
# DVTD-11i0
title: 'E — Copy: audits, peel note, gate title on one line'
status: completed
type: task
priority: normal
created_at: 2026-09-24T12:30:35Z
updated_at: 2026-09-24T13:21:57Z
parent: DVTD-c2ha
---

- [x] Item 4: AUDITS_SHUT becomes 'Audits are unlocked at ${gateLabelOf(AUDITS_FROM_GATE)}'
- [x] Item 4: suppress AttackPanel while gate < AUDITS_FROM_GATE
- [ ] Item 3: rewrite BAND_OUTCOMES_NOTE, converge with the shorter spec/story fixtures
- [x] Item 15: Header TITLE_ROW flex-wrap + min-w-0 on the title
- [x] Update PrepScreen.spec:392, AuditsPanel.spec:53, BandOutcomes.spec/stories

## Summary of Changes

**Item 4.** `AUDITS_SHUT` is now `Audits are unlocked at ${gateLabelOf(AUDITS_FROM_GATE)}` — capitalised, and the gate stays a template so the floor is never written twice (ADR-105).

`attackPanelFor` returns `undefined` below the floor instead of a panel restating the same lock, so the prep screen states it once. `ATTACK_LOCKED`, `attackLockBadgeOf` and `LOCK_COLOR` went with it, along with the locked fixture, story and spec. The test factory gained a `panelAt` helper that throws rather than narrowing, so a fixture slipping below the floor fails loudly instead of silently rendering nothing.

**Item 15** was not in `Header.ui.tsx` as the plan assumed — it is `NextGate.ui.tsx` on the shop screen, whose row *does* wrap. The swatch and the gate name were siblings of a wrapping row, so a long name wrapped past the swatch and left the mark alone on a line. They are now one non-wrapping `NAMED` unit inside the identity span. Regression test added.

**Item 3 is not done** — the peel copy rewrite is the author's voice and is being put to the user.

## Item 3 — resolved

Rewritten as "Paid when the gate shuts. Miss it and you owe a peel, settled in KB or in configs." Done under DVTD-9szc, which was open when the answer came back.
