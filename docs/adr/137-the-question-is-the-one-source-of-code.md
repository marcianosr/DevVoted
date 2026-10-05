# ADR-137: The question is the one source of code

## Status

Accepted — 2026-09-28 (Marciano, DVTD-lmxg). Changes what the `code_block`
column means; leaves it in place.

## Context

A poll had two places for code: the question text, and a separate `code_block`
column with its own field on the form. The run rendered the column as a
highlighted panel and the question as plain text, so a backtick typed into a
question showed literally to players. Thirty-eight seeded questions carry
backticks. The old form previewed the question through a markdown renderer the
run had stopped using, so the preview lied.

## Decisions

1. **Code lives in the question.** Inline backticks render as `<code>`, and a
   fenced ```lang block renders as the kit's code panel with that language, on
   the run's poll screen and in the form's preview. The form no longer offers a
   code block field.

2. **Only backticks are interpreted.** The question is split on fences and code
   spans by a pure splitter; nothing else is markdown. A markdown pass would
   strip raw HTML out of a CSS question, turn `> ` into a blockquote and `1.`
   into a list, and stack headings inside the headline. The old run needed an
   escaper to fight exactly that.

3. **The column stays, read-only.** Polls that already carry a `code_block` keep
   rendering it after the question. The form never sends the field, so an edit
   leaves it untouched and a new poll writes null. No migration.

4. **The preview is the run's own component.** The form renders `Question` with
   the current answers, unpicked, so "see it the way players will" is literal.

5. **Answer options follow the question's rule** (2026-10-05). An option's inline
   backticks render as `<code>` and a fenced ```lang block as the same code
   panel, with the fence and language tag gone and its lines kept. Every surface
   that draws an option uses the question's renderer: the poll screen, the
   review, the poll page, the form preview and the community board's results.

## Consequences

- The question headline can hold several lines and code panels; only its first
  prose part is the page's heading.
- The polls list counts a fenced question as "with code" and shows only its prose
  in the table.
- An option is authored in a one-line field, so a fence typed or pasted there
  arrives without line breaks and reads as one inline code span. A fenced
  option keeps its lines only once the form gives answers a multi-line field.
