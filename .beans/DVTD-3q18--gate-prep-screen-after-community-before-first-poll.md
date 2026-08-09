---
# DVTD-3q18
title: Gate-prep screen after Community, before first poll
status: completed
type: feature
priority: normal
created_at: 2026-08-08T18:21:54Z
updated_at: 2026-08-08T18:51:12Z
---

New PrepScreen shown between the Community board and the first poll of a gate: gate name/number, stake-if-you-fail warning, pipeline chips, Edit pipeline (drop-only) + Start gate actions. Plan: /Users/marciano/.claude-work/plans/i-want-a-screen-glimmering-lamport.md

## Todo
- [x] rules.model.ts: add GateStake type + gateStake()
- [x] run.model.ts: widen drop guard to allow status "answering"
- [x] run.model.spec.ts: drop-while-answering tests
- [x] AnsweringScreen.ui.tsx: use gateStake() instead of inline fatal check
- [x] PrepScreen.ui.tsx + spec + stories
- [x] RunPrep.component.tsx (no standalone spec: uses useNavigate, exercised via RunLayout.component.spec.tsx instead, same as RunShop/RunCommunity)
- [x] routes/_authed/run/prep.tsx
- [x] runRoutes.viewmodel.ts: add prep route + answering case
- [x] runRoutes.viewmodel.spec.ts: update tests
- [x] RunLayout.component.spec.tsx: add prep leaf, fix breaking assertion, add community->prep/start-gate/drop tests
- [x] run lint, typecheck/build, full test suite (all green except 5 pre-existing failures on HEAD, confirmed unrelated via git worktree: 3 in run.model.spec.ts economy/lint tests, 2 in RewardScreen.spec.tsx)
- [x] manual click-through skipped by Marciano; relying on automated test suite + build instead

## Summary of Changes

New PrepScreen shown between the community board and a gate's first poll:
gate name/number (themed), polls-per-window caption, a "Stake if you fail"
warning derived from the existing peel-quota math, the current pipeline as
plain chips, and an "Edit pipeline" toggle that reveals a drop-only remove
action per chip (last config stays protected).

- `rules.model.ts`: added `gateStake`/`GateStake`, shared by the new screen
  and refactored into `AnsweringScreen.ui.tsx`'s existing inline warning.
- `run.model.ts`: widened the `drop` action's reducer guard to also allow
  `status === "answering"`, reusing the existing no-refund drop (already
  protects the last installed config via `holdsLastConfig`).
- New `PrepScreen.ui.tsx` (Tier 1, + spec + stories) and `RunPrep.component.tsx`
  (Tier 2) + `routes/_authed/run/prep.tsx`.
- `runRoutes.viewmodel.ts`: `"answering"` now spans `[prep, answer]` with prep
  canonical, so Community's "Back to your run →" (and any other stale link
  into a gate in progress) lands on prep first; `/run/answer` stays valid for
  the rest of the gate once reached.
- `RunLayout.component.spec.tsx`: added the prep leaf, fixed the now-breaking
  "redirects a deep link" assertion, added coverage for community→prep,
  prep→answer, and the edit-pipeline drop dispatch.
- `proto-run.tsx`: added a matching local prep step so the no-auth prototype
  stays in sync with the routed flow (flagged as optional in the plan, done
  to keep the prototype from silently drifting).

Verification: full test suite, lint (oxlint + dependency-cruiser), and
`npm run build` (incl. `tsc --noEmit`) all pass. 5 pre-existing failures on
the branch (3 in `run.model.spec.ts` economy/lint tests, 2 in
`RewardScreen.spec.tsx`) were confirmed via a throwaway `git worktree` on
clean HEAD to predate this work — untouched by this change. Manual
browser click-through was requested but skipped by Marciano mid-session.

## Follow-up changes (same session, post-completion feedback)

1. **Gate 0 is special**: Configure already shows the gate name + stake before the
   climb starts, so a separate prep screen there would repeat it. Extracted the
   shared header+stake block into `GateStakeSummary.ui.tsx` (presentation/gate/),
   used by both `PrepScreen.ui.tsx` and now `ConfiguringScreen.ui.tsx`.
   `routesForStatus`/`syncTarget` now take `gatesCleared` too: "answering" only
   spans `[prep, answer]` when `gatesCleared > 0`; gate 0 goes straight to
   `answer`. RunConfigure/proto-run pass the three new ConfiguringScreen props
   (`victoryGate`, `pollsPerGate`, `stripsOnFailure`).
2. **Visual redesign to match the mockup exactly**: warning "!" icon in the stake
   block; "Your pipeline" wrapped in its own bordered box; "Edit pipeline" /
   "Start {gate} gate →" moved from Screen's small footer actions into full-width
   buttons owned by PrepScreen itself (Tier 1) — Screen renders bare, no
   leftAction/rightAction, for this route only.

All specs/build re-verified green (same 5 pre-existing failures, unrelated).
