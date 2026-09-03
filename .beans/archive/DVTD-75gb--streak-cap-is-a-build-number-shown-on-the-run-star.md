---
# DVTD-75gb
title: Streak cap is a build number, shown on the run start screen
status: completed
type: feature
created_at: 2026-08-25T15:39:09Z
updated_at: 2026-08-25T15:39:09Z
---

The streak bonus (+10% per consecutive correct answer, capped at ×2) was a private
constant with no surface anywhere. Marciano wants it stated on the run start screen
and modifiable by configs later.

## Summary of Changes

- `rules.model.ts`: `MAX_STREAK_STEPS` (private) -> `BASE_STREAK_STEPS` (exported);
  `streakMultiplier(streak, capSteps = BASE_STREAK_STEPS)`; new `streakCapMultiplier(capSteps)`.
- `config.model.ts` + `effect.model.ts`: optional `streakCapSteps` on a config, flat
  (not level-scaled, so headroom never compounds with the streak it uncaps).
  No config in the roster sells it yet.
- `pipeline.model.ts`: `streakCapStepsFor(configs)` = base + the build's steps;
  `PerAnswerPreview.streakCapMultiplier`.
- `answer.model.ts`: the reducer prices every answer against the build's cap, so a
  headroom config takes effect for real, not just on the receipt.
- `StartScreen.ui.tsx`: a `streak cap` fact in the gate panel, under `audits`
  (Marciano picked the spot).

Follow-up: no config sells headroom yet. When one does, it needs a name and a price;
the seam is `streakCapSteps` on the config.
