---
# DVTD-65kl
title: 'Poll screen: ditch the left rail'
status: completed
type: feature
priority: normal
created_at: 2026-08-29T06:52:35Z
updated_at: 2026-08-29T07:04:49Z
---

The poll and reveal screens lose the sidebar entirely. Its three folds are redistributed:

- Coverage -> the gate header, compact: "12% / of 40% needed" + meter. No "28% to go / about 3 right answers" (Marciano cut it).
- Audits -> saffron alert boxes under the pipeline track.
- Stake -> a note under the submit button ("wrong costs 6 - a miss peels 3 spots").

Plus a responsive pipeline: horizontal band on desktop, vertical rows behind a fold on small screens, folded by default.

## Todo
- [x] GateHeader takes coverage
- [x] AuditAlerts in Audits.ui
- [x] PipelineTrack responsive + foldable
- [x] PollScreen loses rail/aside/toggle, gains notices
- [x] PollView + RevealView rewire; stake note
- [x] Delete Coverage.ui (superseded by the header)
- [x] Wiki + changelog

## Summary of Changes

- `GateHeader` takes `coverage` and draws it beside the gate ladder: held% over "of N% needed", plus the Meter. The "28% to go / about 3 right answers" block Marciano cut is not built.
- `AuditAlerts` (new export in `Audits.ui`): one saffron box per audit, glyph + name + what it does to this gate. Keeps the ADR-028 suppressed treatment (struck through, "reported passing" chip). The `Audits` fold survives for prep.
- `PipelineTrack` is responsive: `flex-col` + `min-w-full` below lg, band above it. Foldable via `open`/`onToggle` with `hidden lg:flex` on the list, so a shut track is only ever shut on narrow screens. PollView opens folded.
- `PollScreen` lost `rail`/`railOpen`/`onToggleRail` and the whole aside; gained `notices`, rendered under the pipeline in the same strip.
- Stake moved twice in one session: first to `submitNote`, then (mid-turn) onto the poll facts line as `QuestionFact`s. `Question.meta` went from `readonly string[]` to `readonly QuestionFact[]` ({label, figure, tone}), so a figure can wear a chip while its wording stays muted. Green for the score multiplier, red for wrong-answer cost and gate retry cost.
- `Coverage.ui` + spec + stories deleted: the header supersedes it and nothing else imported it.

## Open question

The mock header counts "3 applying / 1 skipped"; the track still counts offline only, per the explicit choice made when the sidebar Pipeline lost "will apply". Flagged to Marciano rather than reversed.

## Known inconsistency

The peel is denominated in SPOTS in the domain (`peelSpotsOnFailure`; minifying pays it without removing a config), but the facts line now says "Remove 1 config" as asked, and prep's `Stake.ui` has always said "remove N configs". Worth one decision if the numbers ever diverge visibly.
