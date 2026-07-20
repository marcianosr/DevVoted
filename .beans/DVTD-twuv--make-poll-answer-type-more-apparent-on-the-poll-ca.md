---
# DVTD-twuv
title: Make poll answer-type more apparent on the poll card
status: completed
type: task
priority: normal
created_at: 2026-07-20T15:09:06Z
updated_at: 2026-07-20T19:56:47Z
parent: DVTD-wrem
---

The answer-type hint on PollCard is a dull pewter uppercase micro-label ("Pick one answer"). Turn it into an apparent info callout that reads clearly single vs multiple, with the key phrase emphasised (e.g. 'Select **exactly one** answer' / 'Select **all that apply**'), matching the saffron info-callout treatment.

## Todo
- [x] Restructure ANSWER_TYPE_HINT to lead/emphasis/tail so key words can be highlighted
- [x] Build AnswerTypeCallout.ui.tsx (info glyph + saffron accent) with a Story
- [x] Wire it into PollCard.ui.tsx, replacing the plain span
- [x] Update PollCard + AnswerResults tests for the new copy
- [x] typecheck + lint + tests green

## Summary of Changes

New `AnswerTypeCallout.ui.tsx` (run/poll): saffron info-callout (ⓘ glyph + saffron bottom-accent box) that emphasises the count phrase — Select **exactly one** answer / Select **all that apply**. Copy centralised as `ANSWER_TYPE_COPY` (lead/emphasis/tail) with `answerTypeHintText()` for the plainer results recap. Wired into PollCard (replaced the dull pewter uppercase span); AnswerResults now reads the shared flat string. Added a Story (Run/AnswerTypeCallout, single + multiple). Fixed accent (not category-themed) so poll type stands apart from topic colour.

## Revised approach (final)

Callout was scrapped — it added vertical length, which Marciano flagged as problematic. Replaced with a zero-real-estate inline cue: the option letter badge is shaped per poll type — `rounded-full` (radio) for single, `rounded-md` (checkbox) for multiple (`controlShapeOf` + `shape` cva variant in PollCard.ui.tsx). Each badge carries `data-shape="radio|checkbox"` as a stable test/semantic hook. Deleted AnswerTypeCallout.ui.tsx + story. Recap keeps a plain text hint via restored `ANSWER_TYPE_HINT` (copy: 'Select exactly one answer' / 'Select all that apply'). No full ARIA radiogroup — would need real keyboard semantics to be honest; shape is a visual cue on plain buttons. Tests: PollCard asserts data-shape counts per type; typecheck/lint/tests green.

## Mobile pass (2026-07-20)

PollCard option list reworked for mobile-first (Marciano's mock): single column at all sizes (dropped the experimental grid-cols-2), hairline dividers (border-b border-zinc-800, last:border-b-0) instead of a bordered box per option, only selected/correct/wrong statuses get a filled rounded pill (bg-theme-soft / bg-viridian-10 / bg-cinnabar-10). Option label text-xs on mobile, sm:text-base above. Row padding px-2 py-3. Storybook Run/PollCard used to verify.
