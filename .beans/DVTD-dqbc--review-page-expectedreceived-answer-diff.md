---
# DVTD-dqbc
title: 'Review page: expected/received answer diff'
status: completed
type: feature
priority: normal
created_at: 2026-08-07T08:26:15Z
updated_at: 2026-08-07T08:43:18Z
---

Rebuild the gate review page's expanded row as a test-runner style diff, per Marciano's mockup.

## Target (from mockup)

- Expanded row is a panel: `Expected` rows (celadon, outlined letter chips) over `Received` rows (outcome-toned, filled letter chips).
- Option letters come from the option's position in the poll's option list (A, B, C...).
- Chip shape echoes the input the answer was given with: round for single-answer, square for multi-answer.
- Options that were neither expected nor picked collapse behind a `N other options` disclosure.
- Multi-answer polls get a footer: `2 of 3 — you missed C`.
- Rows open by default unless the poll passed; a passed poll's question dims to pewter.
- Badges go outlined (celadon/saffron/vermillion) instead of filled.
- The score reads celadon / saffron / faint by outcome; a 0% no longer shouts in red.
- Category name drops off the row; only `multiple choice` remains.

## Todo

- [x] Add an outline emphasis to StatusBadge
- [x] Rebuild AnswerResults.ui.tsx around the expected/received diff
- [x] Update AnswerResults.spec.tsx for the new structure
- [x] Update AnswerResults.stories.tsx with a many-option fixture
- [x] Fix ADR-020's claim that the answer review names categories
- [x] Run lint, typecheck, tests

## Summary of Changes

- `StatusBadge` gained `emphasis: solid | outline`; `StatusLine` forwards it as `badgeEmphasis`. Solid stays the default, so the gate report, role list and run summary are untouched.
- `AnswerResults.ui.tsx` rebuilt around `diffOf(poll)`, which splits a row into expected / received / others / missed and letters every option by its seat in the poll's option list.
- Chip shape follows `answerType` (round for single, square for multi), echoing the radio and checkbox the answer was given with.
- Rows open unless the poll passed; a passed poll's question dims to pewter. A 0% score reads faint rather than cinnabar.
- The category name is gone from the row; only the "multiple choice" marker remains.
- The snippet card now aligns with the diff panel: highlight.js paints its surface on `code` from an unlayered sheet, so the `pre` is emptied and that surface padded with `!` utilities.
- Docs: ADR-020's decision list and consequences, wiki section 8 "Poll Review", and two contradicting `[Unreleased]` changelog entries (one deleted, one amended) plus a new entry.

Verified: 1166 tests pass, `npx tsc --noEmit` clean, `npm run lint` clean. Rendering checked against the mockup in Storybook at 1000px and 390px.
