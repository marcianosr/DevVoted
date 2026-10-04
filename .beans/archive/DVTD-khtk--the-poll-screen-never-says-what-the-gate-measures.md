---
# DVTD-khtk
title: The poll screen never says what the gate measures you against
status: completed
type: feature
priority: high
created_at: 2026-09-14T19:52:20Z
updated_at: 2026-09-14T20:10:46Z
---

Coverage is `units / scoringSlotsAt(gate)` and `scoringSlotsAt(gate) = 5 x (gate + 1)`.
Clearing a gate opens five more slots, so the same score is divided by a bigger number:
42% at Pallet reads 21% at Boulder having lost nothing.

DVTD-65yi bracketed that re-base with two notes, on the shop and the debrief. Neither is
the screen the player is looking at when the number confuses them. On the poll screen the
only explanation of scoring is a hover tooltip whose panel is `aria-hidden`, and the
coverage header reads `6.2/15 correct`, which is neither a count of correct answers nor a
statement of what 15 is.

Plan: ~/.claude-work/plans/currently-it-s-pretty-unclear-validated-hinton.md

## Decisions

- The explainer lives in the poll screen's **Coverage** panel body, not a fold: a screen
  you answer on may not hide the terms (wiki 7).
- The denominator is called **slots**, never "window". "Window" already means the five
  polls a gate deals.
- Per-poll figures show **what the poll actually paid** (`coverageEarned`), so the rows
  sum to the score. Untidy with multipliers, and that is the point.
- The scoring popover becomes the ladder table alone; the cancelled-answer and
  correct-tally prose is dropped.

## Todo

- [x] Step 1: `gate?` on `AnsweredPoll` + `answersPerGate`, retry-safe
- [x] Step 2: extract `Lead` out of `BandOutcomes` into its own kit file
- [x] Step 3: `PollScores` optional `paid` mode with dashed numbered boxes
- [x] Step 4: the Coverage panel body on `PollScreen`
- [x] Step 5: `ScoringRule` rewritten as a two-row ladder table
- [x] Step 6: `pollScreen.viewmodel` builders + `PollView` wiring
- [x] Specs and stories for all of the above
- [x] CHANGELOG + wiki glossary; check DVTD-zecb
- [x] Verify: lint, build, tests (browser blocked, see below)

## Summary of Changes

The poll screen's **Coverage** panel now states the arithmetic it was only ever
drawing. Under the bar: `You have scored 35 out of 50 slots.`, then why the ruler
moved (`Every gate opens 5 more slots. Seafoam scored out of 45; Volcano takes it
to 50.`), then **what each poll paid** — one row per gate opened, five badges at
what each poll actually earned, closing on that gate's units. The rows sum to the
figure in the sentence, and the sentence over the denominator is the percentage on
the bar. Today's gate draws its unanswered slots as numbered dashed boxes.

The popover is a two-row ladder table instead of seven stacked sentences, headed
`what a poll pays · before the build multiplies it` — the one caveat the prose
never carried.

### Also, unasked but in the way

`70% SHAKY · 34/55 correct` dropped its second half. That 34 was units, not
correct answers (a select-all pays two), so the word was the confusion the panel
now exists to fix. The meta is the band plus the popover trigger; the figure it was
hiding is the sentence underneath.

### Files

- `runPoll.model.ts` — `gate?` on `AnsweredPoll`; `answersPerGate`, which groups by
  the stamped gate and keeps only the attempt that counted
- `answer.model.ts` — `answeredPollFrom` stamps `state.gatesCleared`
- `prepScreen.viewmodel.ts` — `rightAnswersPerGate` onto `answersPerGate`
- `pollScreen.viewmodel.ts` — `coverageLeadFor`, `slotsNoteFor`, `pollPaidFor`;
  `pollCorrectFor` deleted
- `PollView.component.tsx` — passes `lead`, `slotsNote`, `paid`
- `Lead.ui.tsx` — **new**, lifted out of `BandOutcomes` (built, storied, and passed
  by zero viewmodels until now), plus a `variant` so the poll screen runs it at
  paragraph size
- `PollScores.ui.tsx` — optional `payouts` mode: badges and a unit total instead of
  swatches and a tally. Prep is untouched, it still passes counts
- `PollScreen.ui.tsx` — the panel body; `PollCoverage` loses `correct`, gains three
- `ScoringRule.ui.tsx` — rewritten as a table, spans only (the tooltip panel is a
  `<span>`; see DVTD-3els)
- `Tooltip.ui.tsx` — `width="wide"`, `w-72 sm:w-112`, so a ladder row fits one line
- Fixtures: `pollPayoutRows` in `swatchTrack.factory`, a ten-gate run in
  `kantoPoll.factory` whose rows sum to the 70% the bar already drew

### The retry bug, fixed on the way

`AnsweredPoll` carried no gate index, so `rightAnswersPerGate` sliced the
append-only record by position and a retried gate desynchronised every row after
it. `prepScreen.viewmodel.ts:193-198` documented the hazard; DVTD-xj95 deferred it
as "needs per-gate history the run does not keep". It does keep it — `allAnswered`
is append-only, never reset, persisted, and every entry carries `coverageEarned`.
It just never labelled which gate an answer belonged to. Now it does, and the
grouping keeps the **last attempt** per gate, because a held gate returns before
`bankedUnits` is ever written (`answer.model.ts:184-202` vs `:233`) — an abandoned
attempt paid nothing and must not appear in a table whose rows sum to the score.
The field is optional, so a snapshot written before today falls back to position.

## Known, stated not fixed

- **Ten rows at gate 9, thirteen at the Champion.** The paid table is linear in
  gates, so the panel above the question grows all run: ~330px of rows at gate 9 on
  top of ~170px of bar and prose. At the gates in the mockup (0-2) it is three rows
  and fine. Left as built rather than silently capped, because a capped table stops
  summing to the score, which is the one thing it is for.
- **A full bar.** `bankableUnits` clamps at 100% and pays the surplus out as KB, so
  past a full bar the rows sum higher than the reading. Not handled.

## Verified

`npm run lint` clean (1 pre-existing warning in `Screen.stories.tsx`), depcruise
clean over 980 modules, `npm run build` clean, prettier clean. 4245 passing; the 2
failures are `gate.model.spec.ts`'s floor rule, red before this work (DVTD-xl63).
New: 5 on `answersPerGate`, 5 on `PollScores` payouts, 9 on `ScoringRule`, 1 on
`Tooltip`, 4 on `PollScreen`, 5 on `Lead`, 9 across the three viewmodel builders.

**Browser click-through did not run.** chrome-devtools MCP refuses to attach — a
Chrome from an earlier session still holds `~/.cache/chrome-devtools-mcp/chrome-profile`
— and the claude-in-chrome extension reports disconnected. Same pair of failures
DVTD-65yi hit. Covered instead by rendering the real fixture through `PollScreen`
and reading the output back: ten rows, totals 4.0 / 3.0 / 4.0 / 3.5 / 4.0 / 3.5 /
3.5 / 3.5 / 2.5 / 3.5 summing to 35.0, the sentence reading 35 out of 50, the bar
reading 70%. What is unverified is layout: the panel's real height at a deep gate,
and the wide popover on a narrow viewport.
