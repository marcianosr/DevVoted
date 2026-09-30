---
# DVTD-2wak
title: Prep reads the stakes as a ladder and seals the gates ahead
status: completed
type: feature
priority: normal
created_at: 2026-09-29T12:51:50Z
updated_at: 2026-09-29T13:17:32Z
---

**What:** Prep's At stake draws the coverage as a band ladder with one standing line, a Scoring fold prices a poll and lists the gate table with the gates ahead sealed, the five polls count their reveal, and every number on the screen wears a badge.

**Why:** The band table, the bar and the pay panel said the same ladder three times, the strictness table quoted every future gate's stakes, and a count read two ways on one screen.

## Done when

- [x] At stake draws the band ladder (zones worded and priced, PERFECT a cap, the standing zone ringed) and one standing line
- [x] Scoring folds shut in the right column with the unit ladders, two statements and the gate table sealed past the current gate
- [x] The five polls count what is revealed and say what reveals it
- [x] ADRs (badges on every number; the prep ladder and the sealed gates), wiki and changelog updated

## Notes

Mock from Marciano, 2026-09-29. Decisions: no secured mark; unlocked means reached in this run; Audits panel unchanged; one reveal predicate, counted; the multiple-answer ladder shows five steps. The ladder is piecewise (zones keep a minimum width) because from gate 3 on SHAKY and OK are 6–8% slivers.

## Summary of Changes

- `BandLadder.ui.tsx` (new): the coverage drawn as piecewise zones (min width, `flexGrow` by width), the pin inside its zone, rung badges under each zone, PERFECT as a fixed cap, the standing zone ringed. `CoverageBar` untouched.
- `BandOutcomes.ui.tsx`: band table gone; header meta (`Lavender · gate [4]`), objectives, one PollScores row, the ladder, a standing line (`+12 units to SHAKY · 5 polls left`), the note. `bandOutcomes.viewmodel.ts`: real rung edges, `ladderFor`, `standingLineFor` (next band up), `metaFor`, badged `5`.
- `Scoring.ui.tsx` + `scoring.viewmodel.ts` (renamed from GateStrictness / pollPays): fold strip `[25 slots] 1 unit [+4%]`, unit ladders (single 0/1, multiple 0…2), two statements (statement 2 quotes no future figure), gate table with every reached gate, the next one, a derived `⋮` gap and the last; rows past the current gate are `Redactable` and show `???` per figure.
- The five polls: `Ledger.meta` reads `0 of 3 revealed` (+ note) or `3 of 3 revealed by Prefetch`; categories read `TypeScript ×3`.
- `Fold.meta`, `Ledger.meta` (replaces `badge`), `SealedFigure` in `Redaction.ui`, `GATE_WORD` exported; `PrepFrame.unitsHeld` dropped.
- Deleted: `PollPays.*`, `Codebase.*`, `GateStrictness.*`, `pollPays.viewmodel.*`.
- Docs: ADR-148 (every number wears a badge), ADR-149 (the ladder and the sealed gates); 139 D2–D5, 078 D2/D5, 136 D5 collapsed; 070 D3 amended; README, wiki (Prep page, §8 rule, glossary), CHANGELOG (unreleased prep entry rewritten), rejected.md.
- Verification: lint (oxlint + depcruise) clean for these files; tsc clean for these files (27 errors remain in another session's uncommitted Dex/profile work); 1386 tests green across the 56 touched spec files; the 21 full-suite failures are that session's.
