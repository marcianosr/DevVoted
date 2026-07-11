---
# DVTD-nvqu
title: Consumable 'snippet' system — vertical slice prototype
status: in-progress
type: feature
priority: normal
created_at: 2026-07-10T11:27:42Z
updated_at: 2026-07-10T13:53:33Z
---

Prototype Model A: earn a one-use 'snippet' by crossing a category coverage milestone during a run; spend it for an effect. First slice is client-side only (no schema), scoped to the daily-poll screen, to get a feel. Trigger corrected from invalid 'poll difficulty' to real signal: category coverage milestone crossing. Effect v1: 50/50 (remove two wrong options), reusing existing config removal UI path.

## Slice 1 built (client-side, no schema)

Files:
- `src/domains/runs/utils/snippetEarning.ts` — pure earn rule `countEarnedSnippets` (coverage milestones, step=25%). The tuning knob.
- `src/ui/polls/SnippetBar.ui.tsx` (+ story) — presentational belt: held count, Use 50/50, debug +1.
- `src/domains/polls/components/DailyPollContainer.component.tsx` — state + earn pulse + 50/50 effect (reuses config option-removal path).

Trigger: coverage milestone crossing (real signal, replaces invalid 'poll difficulty').
Effect: 50/50 removes two wrong options on single-answer polls.
State: in-memory (survives answer refresh, resets on hard reload). No persistence by design.
tsc: 0 errors. lint: clean.

## Deferred (if it feels good)
- Persist snippets to run state (schema) so they survive reload/navigation
- Coverage-combinable effect (`Refactor`: double coverage next N) — needs server-side coverage hook
- Multiple snippet types + variety
- Whimsical shop tie-ins (npm-install gacha, snippet→storage trade)

## try/catch slice (server-side, real catch)

Key find: the catch already existed in turn.service resolveRunState (protection.tryCatch, cut config). Gave it a 2nd source — player-armed snippet.

Threaded armedTryCatch: SnippetBar spend → mutationFn → postPollOptions validator → pollSubmissionSchema (optional) → validatePollSubmission (?? false) → processTurn → resolveRunState (protection.tryCatch || armedTryCatch). Surfaced tryCatchUsed back through handler → client.

Design: NOT auto-trigger. Player arms under uncertainty; consumed even if window passes (spent-on-activation). Client shows armed badge + caught/unused messages.

No schema/migration (armed flag rides the submission, in-memory). tsc 0, lint clean, 36 tests pass (handlers + turn.service specs).

## Category-signature snippets (specialization / build identity)

Earning is now category-scoped + tiered instead of flat:
- snippets.ts: GENERIC_SNIPPETS (tiers 1-2, any category) + SIGNATURE_SNIPPETS (Partial<Record<CategoryCode>>, tier 3=75%+, exclusive per category: js/ts/css/react/git/html) + snippetForMilestone(category, tier).
- DailyPollContainer: per-category milestone detection (prevMilestonesRef seeded to current on mount → only future crossings grant). Debug button renamed grantDebugSnippet (rotates SNIPPET_TYPES).
- SnippetBar hint updated to mention 75% signatures.

Effect: JS-deep run and generalist run end with DIFFERENT toolkits (reward diverges by path). Generalist at ~30% everywhere never reaches a signature. Test fast via SNIPPET_MILESTONE_STEP=5 or SIGNATURE_TIER=1.

tsc 0, lint clean. Still in-memory (no persistence). countEarnedSnippets now unused by container (kept as exported tuning example).
