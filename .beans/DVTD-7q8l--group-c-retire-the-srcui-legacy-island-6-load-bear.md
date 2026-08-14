---
# DVTD-7q8l
title: 'Group C: Retire the src/ui legacy island (6 load-bearing files)'
status: completed
type: task
priority: low
created_at: 2026-08-12T09:12:53Z
updated_at: 2026-08-12T20:03:30Z
parent: DVTD-82c4
---

ADR-010 froze `src/ui/runs/` (16 files), `src/ui/polls/` (12) and
`src/ui/economy/` (1). Only **six concepts** still hold the island open for the
current app, reached from 8 files in `src/modules/run/presentation/`:

- `~/ui/runs/StatusLine.ui` <- `gate/PipelineReportRow.ui.tsx:7`, `run/AnswerResults.ui.tsx:10`, `run/RunSummary.ui.tsx:11`
- `~/ui/runs/GainBar.ui` <- `gate/GateRewardReport.ui.tsx:14`, `gate/SlotUnlockRow.ui.tsx:4`
- `~/ui/runs/MetaStorageBar.ui` <- `run/RunSummary.ui.tsx:10`
- `~/ui/runs/ScoreEquationChips.ui` <- `screens/AnsweringScreen.ui.tsx:12`
- `~/ui/polls/PollMarkdown.ui` <- `run/AnswerResults.ui.tsx:9`, `poll/PollCard.ui.tsx:7`
- `~/ui/polls/PollCodeSandbox.ui` <- `poll/PollCard.ui.tsx:3`

Everything else in those folders is reachable only through
`src/domains/*/components/` and the 9 `/old` routes still registered in
`routeTree.gen.ts`. `src/ui/economy/` has **zero** importers from
`src/modules/` at all: its five importers are all inside `src/ui/{polls,runs}`
or `src/domains/economy/`.

Promote those six and the rest of the three folders retire as one unit with the
`/old` routes. Worth doing precisely because it is small.

Note `ScoreEquationChips` carries the legacy `green-400`/`red-400` ramp into the
live answering screen, so promoting it means recolouring it (see the Group B
surface-tone bean).

Overlaps DVTD-7tof (clean up storybook and old code) and the scrapped
DVTD-wz1b item "cut modules->domains legacy tendrils".

## Todo
- [x] Promote the six load-bearing files out of the frozen folders (StatusLine + GainBar -> src/ui; MetaStorageBar + ScoreEquationChips -> run/run/presentation; PollMarkdown + PollCodeSandbox -> run/poll/presentation)
- [x] Recolour `ScoreEquationChips` to Kanto (green-400/red-400 -> viridian/cinnabar); also deleted its dead rarity/ConfigCard branch — no live caller ever passed `rarity`, and cutting it severed the economy-island dependency
- [x] Confirmed: after promotion, only src/domains components and the three /old routes imported the remainder
- [x] Deleted: src/ui/{runs,polls,economy} (29 files), all 9 /old routes, 16 transitively-orphaned src/domains components, DevPollNavigator. routeTree regenerated. Two live tails fixed: polls/$pollId now uses PollQuestionHeading (resurrected into run/poll/presentation); ConfigCard.ui restored beside its legacy Cards consumers for the slides deck; nav End Run now lands home instead of /old/game-over

## Summary of Changes

The src/ui legacy island is gone. Six load-bearing files promoted to their consumers homes, ScoreEquationChips recoloured to Kanto with its dead rarity branch cut, then src/ui/{runs,polls,economy}, the 9 /old routes, 16 orphaned domains components and DevPollNavigator deleted as one unit. Two live surfaces repaired: the polls admin detail heading and the slides deck ConfigCard. CHANGELOG entry added (old game retired).

Verified: tsc 0 errors, oxlint clean, lint:arch 0 violations — 524 modules cruised, down from 590. Vitest 113 files / 1425 passed / 0 failed (8 island spec files went with it).
