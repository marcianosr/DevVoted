---
# DVTD-lhao
title: Flaky Build, Rolling Outage, Deprecated + the Mirror rewrite
status: completed
type: feature
priority: normal
created_at: 2026-08-17T20:30:26Z
updated_at: 2026-08-18T06:45:21Z
parent: DVTD-kulw
---

Marciano's second pass on the roster: three more audits and a redesign of the Mirror.

- **Flaky Build** — one config fails to trigger on each poll (fresh roll every poll).
- **Rolling Outage** — a different config down each poll (rotates through the pipeline).
- **Deprecated** — your highest-level config is disabled for the attempt.
- **Mirror** — no longer inverts the score. The poll itself flips: every option's correctness inverts, so the question asks for the INCORRECT options and wants all of them ("would be hard, because some single choice are now multiple choice" — that is the mechanic, not a problem).

Because the mirrored answer is graded normally, streaks and partials work and the gate charges full demand: `scoreShare` and `demandFactor` leave the mirror.

## Summary of Changes

**Three audits, one mechanism.** Flaky Build, Rolling Outage and Deprecated join Dependency Outage as the four ways a config goes offline; they differ only in the pick, so `Audit.disablesOneConfig` became `disablesConfig: OfflinePick` (`one-per-attempt` / `random-per-poll` / `rotating-per-poll` / `highest-level`) and `offlineConfigFor` became `offlineConfigsFor`, returning a set. Every pick stays derived — seeded off the window start plus the poll's place in it — so nothing is stored, a reload never re-rolls, and the next attempt gets a different answer. Deprecated breaks level ties on the config id, since a tie means nothing was upgraded and any richer rule would be an unstated preference.

**The Mirror now flips the poll, not the score.** `mirrorPoll` inverts every option's correctness, so the question asks for the incorrect options and wants all of them — a four-option single-answer poll becomes a three-option select-all. Everything downstream grades normally (outcome, partials, streaks, difficulty bonus), `answeredThisGate.correct` carries the mirrored expectation so the reveal and the review agree with the score, and the mirror's `scoreShare`/`demandFactor` are deleted: Marsh charges full price. `.length` counts the wrong options at a mirrored gate, which meant `pickBudgetFor` gained a `mirrored` flag and `freshWindow` now takes the gate the window belongs to (a clear opens the *next* gate's window). Hydration mirrors the same rule.

**Schedule.** 8 = Timeout + Flaky Build, 9 = Memory Leak + Rolling Outage, 10 = Deprecated + Timeout, 11 = Strip + Mirror + Flaky Build. Feature Freeze keeps gate 6 only.

**UI.** The banner names every config offline *right now* (re-read per poll, since two of the four move) and the mirrored instruction sits on the poll card above the options — the click needs the rule where the click is. `.length`'s line reads "N incorrect answers" at a mirrored gate.

**Verification.** 1580 tests / 121 files green, oxlint + dependency-cruiser + tsc + build clean. ADR-038 rewritten (nine rules, new Decision 4), README/ADR-035 markers updated, wiki §2.2/§2.10/§4.1/appendix/glossary, CHANGELOG entry folded in. Uncommitted.

**Known gaps, filed in the ADR rather than fixed:** a mirrored gate records the player's deliberate wrong picks as wrong answers in `polls_responses` (noise in the community split, same as the old mirror); the pipeline rail does not mark an offline config; the stake receipt's per-answer preview still prices the full build.
