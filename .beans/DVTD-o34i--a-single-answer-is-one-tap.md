---
# DVTD-o34i
title: A single answer is one tap
status: completed
type: feature
priority: normal
created_at: 2026-10-02T11:17:29Z
updated_at: 2026-10-02T11:26:26Z
---

**What:** Tapping an option answers a single-answer poll, the keyboard tip moves to the card's header for mouse players, and the right/wrong feedback is visible again.

**Why:** A Lock in press after a single pick is a second step that adds nothing, and players report not seeing the answer feedback at all.

## Done when
- [x] Tapping or pressing the letter of a single-answer option answers the poll
- [x] A multi-answer poll still asks for Lock in
- [x] The keyboard tip sits in the card header and hides on touch screens
- [x] A right and a wrong answer each show visible feedback

## Notes
Plan: ~/.claude-work/plans/can-we-build-the-cheerful-naur.md
- [x] Diagnose missing feedback
- [x] Tap answers single
- [x] Keyboard hint in meta row
- [x] Wiki, changelog, ADR

## Summary of Changes

- Diagnosis: reduced motion off, CSS served, payload carries outcome/correct; a headless proto-run probe showed shake, flight and pulse all fire. Cause: too brief and none sat on the option row.
- Choice: answered row gets `answer-verdict` (ring + glow in verdict hue) and the mark `reveal-pop` (was dead CSS); both behind reduced motion.
- PollView owns tap-to-answer: parents pass `onAnswer(optionIds)` (replaces onSubmit); single routes a pick there, multi keeps onSelect + Lock in.
- PollCommit is `{ lock?, skip? }`; the poll-number swatch leads the meta row; `keysHint` sits at its right end behind `pointer-fine:`.
- ADR-175, wiki, changelog.
- Follow-up noticed: during the reveal the skip row and credit footer vanish, so the card shrinks and the Build panel jumps up.
