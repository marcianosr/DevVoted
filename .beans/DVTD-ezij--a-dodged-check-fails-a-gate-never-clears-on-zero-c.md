---
# DVTD-ezij
title: A dodged check fails; a gate never clears on zero correct
status: in-progress
type: bug
priority: high
created_at: 2026-08-07T13:46:32Z
updated_at: 2026-08-12T13:17:04Z
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

## Decision — 2026-08-12: linters get a mastery check, the pledge is dropped

Marciano ruled that linting must stay optional: forcing the fee is a trap, and
both earlier options (a) "one lint redeems the window" and (b) "every offer must
be taken" force it. So the check stops depending on the effect being used.

**ESLint and Stylelint gain a mastery check on the categories they lint.**
ESLint owes "1 JS/TS poll correct this window", Stylelint owes "1 CSS poll
correct". Identical mechanic to a Focus config: excused by an unlucky draw,
never by a choice. No fee is ever forced.

**The "every poll you lint must be correct" pledge is dropped**, one checklist
row per config. A lint you get wrong now costs the fee only.

Consequence: `lint-correct`, `LintTally`, `lintedByConfig` and the `offered`
counter all become dead and are deleted. `focusCheck` generalises to
`masteryCheck(config, categories)`; a Focus config passes one category, a linter
passes `eliminatesWrongOptionsFor`.

**Sizing (corrected by Marciano, same session).** A first pass claimed the width
demand (ADR-027) bounds this, because two linters only cover gates 0-2. That
holds for today's roster and fails for the planned one: there are 12 categories,
the width demand tops out at 8 configs, so a linter-per-category roster supplies
more than enough linters to fill every required slot with a config that owes
nothing. DVTD-72d9 (expand config roster) is in progress.

So this is not an early-game hole. It is a hole that grows with the roster, and
the mastery check is load-bearing rather than cosmetic. It is also the fix that
scales the right way: with a linter per category, every drawn poll belongs to
some linter's category, so a full-linter build fires a mastery check on nearly
every poll and becomes one of the hardest builds to clear rather than the
easiest. "Accept it and pin a test" would have aged badly.

- [ ] masteryCheck generalises focusCheck; linters use eliminatesWrongOptionsFor
- [ ] Delete lint-correct, LintTally, lintedByConfig, offered
- [ ] RosterConfig accepts a non-empty eliminatesWrongOptionsFor as owing a check
