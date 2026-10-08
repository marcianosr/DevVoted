---
# DVTD-jupt
title: Every answer explains itself
status: completed
type: feature
priority: normal
created_at: 2026-10-08T12:17:08Z
updated_at: 2026-10-08T12:31:48Z
---

**What:** Each answer of a poll can carry its own note on why it is right or why it is wrong, written under the answer on the poll form and shown under the answer on the gate review and on the poll page's "with the answer" view.

**Why:** One explanation per poll cannot say what was wrong with the option a player actually fell for; the review lists the options and leaves the lesson to one paragraph.

## Done when

- [x] The gate review shows "Why it’s right" under the right answer and "Why it’s wrong" under every explained wrong one, whether or not it was picked
- [x] The poll page shows the same once flipped to "with the answer", and nothing as a player meets it
- [x] The poll form offers an optional note under each answer, worded by its mark, and the preview shows the notes once revealed
- [x] The "Explain it" step lights on the poll note or on every right answer explained
- [x] A run played before this change still reviews, and a mirrored poll shows no notes
- [x] Specs, stories, lint, typecheck, migration, seed, ADR, wiki and changelog are done

## Notes

Mock: the screenshot pasted in the session (poll detail, "with the answer"). Plan: ~/.claude-work/plans/i-want-to-create-dazzling-thimble.md. The poll-level explanation stays as the general note.

## Summary of Changes

- `polls_options.explanation` (nullable text), guarded migration `20261008140000_polls_options_explanation.sql`; `PollOption`, `RunOption`, the Zod option schema (max 500, `POLL_LIMITS.answerExplanation`) and the three option writes in the authoring repository carry it; `withOptions` reads it into the run poll.
- `AnsweredPoll.optionExplanations` (label-keyed, additive) is frozen by `answeredPollFrom` and `skippedPollFrom`, omitted when the Mirror flipped the key; `gateAnswersOf` carries it and `cardFor` attaches `{ text, right }` per option by the answer key, so an unpicked wrong option still reads "Why it’s wrong".
- `pollDetailViewOf` attaches the same only in the answer view.
- Kit: `Icon` gains `bulb`; `Choice` gains a `note` slot (wrapped row, `basis-full pl-13`, markup unchanged without one); `Question` builds the reason (circled ✓/✗ under `badge-theme`, bulb, label, caption with `CodeSpans`) and hands it to `Choice`.
- Form: `PollFormAnswer.explanation`, `changeAnswerExplanation`, a `TextField` under each answer labelled `why A is right` / `why A is wrong`, the preview attaches reasons once revealed, the Explain it step lights on the note or on every right answer explained, blanks are sent as null.
- Seed: three questions explain their options (`optionExplanations`, index-keyed).
- Docs: ADR-195 and its index row, two wiki passages (the poll rule and the stale review bullet), changelog Added entry.
- Verified: 332 files / 6122 tests pass, lint clean, `tsc` clean, `db:refresh` built the column from the migration and seeded 11 reasons. Follow-up: DVTD-vlbd (the verdict after answering).
