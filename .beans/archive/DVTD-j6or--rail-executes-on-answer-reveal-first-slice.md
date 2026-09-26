---
# DVTD-j6or
title: Rail executes on answer reveal (first slice)
status: completed
type: feature
priority: normal
created_at: 2026-08-27T08:09:21Z
updated_at: 2026-08-27T08:55:40Z
---

The pipeline rail on the answering screen sits inert while the equation chips animate under the poll, so the pipeline reads as an inventory shelf. First slice (static, no animation): when the reveal lands, each contributing config row shows its coverage contribution as a trailing value (order/data from coverageBreakdownForAnswer via reveal.score.configBonuses); idle rows stay folded; miss treatment per Marciano's call. Presentation only — no new mechanics, no new vocabulary (never 'pipeline run': collides with THE run).

- [x] Reveal beat in /proto-run (local pause, RevealView.component, PollScreen reveal slot)
- [x] Fired contributions on the modern rail (PipelineRow.fired → Delta)
- [x] Miss treatment: rail silent, loss reads once in the ledger (Marciano's call)
- [x] Specs: RevealView (8), Pipeline fired (2), Choice settled (2)
- [x] Stories: Pipeline Fired, Choice SettledExpected/SettledWrongPick
- [x] CHANGELOG entry + wiki §2.5 reveal wording

## Scope discovery (2026-08-27)

The agreed slice targeted the wrong surface. Two answering surfaces exist:
- Legacy `_authed/run/answer`: RunAnswer.component → AnsweringScreen → RoleList + ScoreEquationChips. HAS the reveal beat. Not the new-concept flow.
- Live playtest `/proto-run`: PollView.component → PollScreen + modern-theme Pipeline.ui (online/skipped/offline per poll). Has NO reveal beat at all — submit advances straight to the next poll; per-answer earnings appear nowhere (ReviewView shows a bare score per poll, no breakdown). CHANGELOG's 'red −0.5 Overclock chip in the score equation' line describes the legacy screen only.

Re-scope: the slice must build the reveal beat into /proto-run — local (component-level) reveal held from answeredThisGate.at(-1) (carries coverageBreakdown, picked, correct, options), rendered before the next poll / gate screens, with fired configs showing their contribution on the modern rail. Miss = rail silent (Marciano's call, confirmed). Awaiting go on the re-scoped slice.

## Summary of Changes

Built the per-answer reveal beat into /proto-run (the modern-theme flow had none — submit jumped straight to the next poll).

- `RevealView.component.tsx` (new): answered poll settles in place (Choice settled/letterTone, notes "expected"/"your pick" — mirror-safe language), coverage Ledger (outcome base, streak, one row per fired config with a pass Mark), explanation text, rail via railFor with fired deltas, footer Next →.
- `PollView.component.tsx`: exported builders (gateHeaderFor, questionFor, categoryFor, trailFor, railFor(view, rows), pipelineRows(view, PollFacts, tools)); PollFacts carries answeredBefore so the reveal reads opener status for the answered poll, not the next.
- `Pipeline.ui.tsx`: PipelineRow.fired → Delta coverage chip wins the trailing slot.
- `Choice.ui.tsx`: settled (inert without blocked's strikethrough, MARKER dropped) + letterTone verdict colours.
- `PollScreen.ui.tsx`: reveal slot + submitLabel.
- `proto-run.tsx`: local revealing state (a reading beat, not a move — refresh skips it); answer() sets it; post-answer branches guarded with !reveal so the 5th answer reveals before reward/strip screens; poll clock held during reveal (Timeout audits can't bill unseen reading time); rig fast-forward bypasses the beat, rig single-answer buttons get it.

Known drift, accepted for the slice: an audit's offline roll advances to the next poll before the reveal renders, so on Flaky/Rolling gates the struck rail row is one poll ahead. Follow-up candidates: promote the pause to a reducer state (touches rig loops + zod action parity), chip pop-in animation, per-answer KB payouts on the rail.

Verification: lint + depcruise clean, build (tsc) clean, 2434 tests pass — only pre-existing red is RewardScreen.spec ×3 (DVTD-9dn0).
