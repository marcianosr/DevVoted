# ADR-195: An option explains why it is right or wrong

## Status

Accepted — 2026-10-08 (Marciano, DVTD-jupt). Extends
[ADR-137](137-the-question-is-the-one-source-of-code.md) decision 5 to a new
surface. Built from Marciano's poll-page mock.

## Context

A poll carried one explanation, shown after answering and under the review's
option list. One paragraph cannot say what was wrong with the option a player
actually fell for, and the review drew every option as a bare row. The mock put
a short reason under each option: a red ✗ and "Why it's wrong", a green ✓ and
"Why it's right", prose with inline code.

## Decision 1: one column, one word

`polls_options.explanation` (nullable text). The same word travels through
`PollOption`, `RunOption`, the form state and the kit's `QuestionOption`; the
poll's own `polls.explanation` stays as the general note under the options.
The form offers the field under each answer, capped by
`POLL_LIMITS.answerExplanation`, and its "Explain it" step lights on the poll
note or on every right answer explained.

## Decision 2: the word follows the option's correctness, not the pick

An unpicked wrong option still says "Why it's wrong". The review's row state is
`idle` for such an option, so the state cannot choose the word; the viewmodel
passes `right` from the answer key, the same source the row's colour reads.

## Decision 3: the run snapshots reasons by label

`AnsweredPoll.optionExplanations` is a label-keyed map written beside `options`
and `correct` at answer time, so the review reads only what the reducer froze.
Runs persisted before this change carry none and render as before; an edit to a
reason never reaches an already-played review, as with `explanation` today.

## Decision 4: a mirrored poll carries no reasons

Under the Mirror audit the graded key is flipped, so "Why it's right" would sit
over prose arguing the opposite. The reducer omits the map when the graded poll
is not the dealt one.

## Decision 5: the reason lives inside the row

`Choice` takes a `note` slot rendered as a full-width item on a wrapped row, so
the row's verdict tint wraps both the line and the reason, and the markup without
a note is byte-identical. `Question` builds the reason and hands it down, since
`Choice` cannot import `CodeSpans` from `Question` without a cycle. Correctness
is poll content, not run state, so the two labels are the component's copy
(ADR-102).

## Consequences

- Surfaces: the gate review, the poll page's **with the answer** view and the
  form preview once revealed. The verdict right after answering is a follow-up
  (DVTD-vlbd).
- `Icon` gains `bulb`.
- The seed explains three questions' options; the rest carry none.
