---
# DVTD-g9eq
title: 'Modern theme: review answers screen + option letters'
status: completed
type: feature
priority: normal
created_at: 2026-08-23T14:56:03Z
updated_at: 2026-08-23T15:06:04Z
---

Storybook-only. New Modern/Screens/Review readout of a gate's polls, and option letters (A/B/C/D) replacing the radio in the live poll so the review can reference them.

- [x] format.ts (signed, optionLetter)
- [x] Letter.ui.tsx + spec + stories
- [x] Choice.ui.tsx: letter replaces the radio (sr-only peer)
- [x] PollScreen.ui.tsx: derive letters by index
- [x] Verdict.ui.tsx (Answer + Verdict) + spec + stories
- [x] screens/ReviewScreen.ui.tsx + spec + stories
- [x] Verify: tsc, stories typecheck, tests, lint, emitted CSS

## Summary of Changes

Storybook only, nothing routed.

**New** — `format.ts` (`signed`, `valueTone`, `plural`, `optionLetter`), `Letter.ui.tsx`, `Verdict.ui.tsx` (exports `Answer` + `Verdict`), `screens/ReviewScreen.ui.tsx`, each with a spec and stories.

**Changed** — `Choice.ui.tsx`: the radio goes `sr-only peer` and the letter circle becomes the pick indicator via `peer-checked:*`; `letter` is a required prop. `PollScreen.ui.tsx` derives each letter from the option index, so `PollOption` omits `letter`.

**Folded** — `Ledger.ui.tsx`, `Delta.ui.tsx` and `RemovalScreen.ui.tsx` each carried a private copy of a formatter now living in `format.ts`.

**Design** — the review derives everything (letters, the `multi` marker, caught/missed/wrong) from one `AnswerOption[]`, so the header and the rows cannot disagree. `outcome` stays explicit: partial-vs-wrong is a scoring rule, not a `.ui` concern. PASS polls render one line with no body. The header tally and the mock's overflow stub are gone.

**Verified** — tsc clean, 38 story files typechecked clean, lint clean (725 modules), 253 passing. The 5 reds are all pre-existing `RewardScreen.spec.tsx` copy drift.
