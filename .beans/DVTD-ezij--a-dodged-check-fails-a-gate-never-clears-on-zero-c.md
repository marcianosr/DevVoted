---
# DVTD-ezij
title: A dodged check fails; a gate never clears on zero correct
status: in-progress
type: bug
priority: high
created_at: 2026-08-07T13:46:32Z
updated_at: 2026-08-07T15:38:07Z
---

A build of Copilot + ESLint + Stylelint summits on 0 correct answers. Driven through the real reducer: 13 gates cleared, storage 0, coverage 0, status "won", and all 13 swatches written to users.owned_swatch_ids.

Cause: `gate.model.ts` counts `skipped` as a pass, so a build whose every check can skip has an effectively empty checklist and `[].every(...)` is true. Copilot carries no check at all; `lintState` returns "skipped" whenever `polls === 0`, which conflates "no JS/TS poll appeared" (unavoidable) with "a JS/TS poll appeared and I declined to lint it" (a dodge). ADR-021's peel death never fires because the build never fails a gate.

ADR-017 bet that scaling payout with correctness priced farming out. The bet missed that the climb is itself the reward: gate depth, swatches, and victory were all free.

Fix (Marciano, 2026-08-07), two parts:
1. A declined pledge is a failure, not a skip. A linter whose category appeared in the window but which was never run fails at window close. A linter whose category never appeared still skips, so an unlucky draw is never punished.
2. A gate never clears on zero correct answers (`MIN_CORRECT_TO_CLEAR`), as a sibling of `isBare` in the definition of a clear rather than a checklist row. This catches the all-excused window (every config's category missed, or a check-less config like Copilot).

Affordability does not excuse the pledge: a build that cannot fund what it promised is a bad build, not an unlucky one. Runs start at 0 storage, so a linter-only build dies early by design.

## Todo
- [x] `LintTally` gains `offered`; the reducer records lintable polls per linter
- [ ] `lintState`: dodge fails at window close, excused skip stays a skip
- [x] ~~`MIN_CORRECT_TO_CLEAR`~~ rejected: the floor is a config's check, not the gate's rule
- [x] The failure log names which checks failed
- [ ] Tests: freeloader dies, unlucky focus build survives, dodge vs excused, floor
- [x] Copilot renamed AGENTS.md, gains `min-correct: 1`; roster invariant makes a checkless config a compile error
- [ ] ADR-022 + amendment markers on ADR-017 and ADR-019's open risk
- [ ] wiki.md + CHANGELOG

## Notes

The floor broke nothing: 1262 pass with only the intentional red (the dodge test) failing, so no existing test relied on clearing a gate at 0/5. tsc and dep-cruiser clean.

Open UI gap: a gate that fails on the floor shows an all-skipped checklist and "Gate N failed. Peel X configs" with no stated reason. The player cannot tell why. Needs copy on the strip/report screen naming the floor.

## Course correction (Marciano, 2026-08-07)

The gate-level correctness floor is **out**. "Get one right" already exists as Unit Tests' check, so a gate rule duplicating it charges builds that never bought it and adds a demand with no checklist row — which was the reason the rules read as unclear in the first place. The checklist is the whole rulebook.

What replaces it: **no config may owe the gate nothing**, enforced by a `RosterConfig` type at the only place configs are authored. AGENTS.md carries `min-correct: 1` (unconditional, never excused by the draw), so it does the floor's job as a config the player chose. Verified: removing the check makes `tsc` fail.

Accepted residual: a build whose every check is excused by the draw (three focus configs, none of their categories drawn) clears on 0/5. That is the honest reading of "the gate demands only what your build demands", and it cannot be chained into a climb because the draw cannot be chosen. Pinned by a test.

Follow-up: DVTD-usyd for the effect redesign (option-manipulation ruled out, it overlaps the linters).
