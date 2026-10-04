---
# DVTD-yp24
title: 'Poll screen: combo, card swap, options deal in'
status: completed
type: feature
priority: normal
created_at: 2026-10-04T07:35:08Z
updated_at: 2026-10-04T07:42:03Z
---

**What:** The poll screen pops "3 in a row!" on a streak, slides the answered card out and the next one in, and deals the options in one by one.

**Why:** Answering felt static between polls; the juiced mock shows the rhythm without changing the layout.

## Done when
- [x] Two or more right answers in a row pop "N in a row!" on the card
- [x] An answered card slides away and the next poll slides in
- [x] A new poll's options come in one after another
- [x] Reduced motion shows none of it

## Notes
Animations only, from ~/Downloads/devvoted-juiced.html (SCREENS.poll, answer()). Plan: cosmic-swimming-frost.

## Summary of Changes

- pollComboFor (viewmodel) counts the trailing right answers in answeredThisGate; 2+ pops "N in a row!" (vermillion, role status, 650ms so it fits the right-answer hold).
- useAnswerFeedback gains leaving (flips CARD_LEAVE_MS = 180ms before the hold ends; hold unchanged).
- PollScreen keys the card by poll id (pollKey), classes poll-card-enter / poll-card-revealed / poll-card-leave; options stagger only on a live card via [data-choices] on Question.
- .poll-card-enter.answer-shake keeps the shake winning; all of it off under reduced motion.
- Verified headless on /proto-run: timeline, combo frame, reduced motion.
