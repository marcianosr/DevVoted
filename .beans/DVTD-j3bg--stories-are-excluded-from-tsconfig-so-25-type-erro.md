---
# DVTD-j3bg
title: Stories are excluded from tsconfig, so 25 type errors have accumulated
status: todo
type: bug
priority: normal
created_at: 2026-08-25T17:49:34Z
updated_at: 2026-08-25T17:49:34Z
---

`tsconfig.json` excludes `**/*.stories.tsx`, so no story file has been typechecked by `npm run build` in a long time. Typechecking them with a temporary config that clears the exclude turns up 25 real errors across 7 files — props renamed or removed on the component, never updated in the story.

Found while doing DVTD-ay66 (passing RunView clusters as props): the story edits there could not be verified by `npm run build`, which is what surfaced the gap.

| file | errors | shape |
|---|---|---|
| GateRewardReport.stories.tsx | 6 | `"checkProgress"` / `"check"` / `"focusMissed"` are not in the union anymore |
| Screen.stories.tsx | 5 | |
| RunHud.stories.tsx | 4 | sets `storageBillKb`, not a prop |
| RunCommunity.stories.tsx | 4 | sets `standouts`, not a prop |
| RoleList.stories.tsx | 4 | `"requirement"` is not a ConfigRole; sets `state` |
| PrepScreen.stories.tsx | 1 | `perAnswer` fixture missing 3 PerAnswerPreview fields |
| ConfiguringScreen.stories.tsx | 1 | same fixture drift |

ShopScreen.stories.tsx had the same `perAnswer` drift and was fixed in DVTD-ay66 under the boy-scout rule, since that file was already being edited. The 7 above were left alone.

Note the interaction with the existing anomaly: `~/` imports inside stories show phantom TS2307 in the editor *because* of this exclusion. Removing the exclusion would fix the phantom errors and catch the real ones, but it needs the 25 fixed first, and a check that Storybook's own types do not pull anything the app tsconfig rejects.

## Todo
- [ ] Fix the 25 errors, file by file
- [ ] Remove `**/*.stories.tsx` from the tsconfig exclude
- [ ] Confirm `npm run build` stays clean and the editor's phantom TS2307 on story imports is gone
