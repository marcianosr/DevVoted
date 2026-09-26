---
# DVTD-a8tr
title: Story type-rot unrelated to spots (27 errors, 8 files)
status: todo
type: task
priority: normal
created_at: 2026-08-27T20:08:13Z
updated_at: 2026-08-27T20:08:13Z
---

Stories are excluded from `tsconfig.json`, so `npm run build` never typechecks them — but Storybook does run (`npm run storybook`, port 6006), so these are broken or wrong-rendering stories in a surface that gets opened.

Verify with a scratchpad tsconfig that clears the `*.stories.tsx` exclusion; the editor's own `~/` import errors on story files are phantoms and should be ignored.

All spot/slot-era errors were fixed in DVTD-3boj. What remains is older drift:

| File | Rot |
| --- | --- |
| `ConfiguringScreen.stories` · `PrepScreen.stories` · `StripScreen.stories` | `PerAnswerPreview` gained `coveragePerWrong`, `streakStepMultiplier`, `streakCapMultiplier`; also `stripsOnFailure` on `GateStake` |
| `RunCommunity.stories` | `standouts` no longer a prop |
| `GateRewardReport.stories` | `checkProgress`, `"check"`, `focusMissed` all off their unions |
| `RunHud.stories` | `storageBillKb` no longer a prop |
| `Pipeline.stories` | reads `.value` off a `ConfigFigure` |
| `GatesPanel.stories` · `Screen.stories` | assorted |

Worth considering as part of this: the exclusion is what let all of it accumulate. Either add a `typecheck:stories` script to CI, or drop the exclusion and fix the fallout once.

## Todo

- [ ] Fix the eight files
- [ ] Decide whether stories join the typechecked set, so this cannot silently recur
